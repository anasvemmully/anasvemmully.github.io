"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  HandLandmarker,
  NormalizedLandmark,
} from "@mediapipe/tasks-vision";

// Landmark index pairs forming the hand skeleton
const CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4], // thumb
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8], // index
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12], // middle
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16], // ring
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20], // pinky
  [0, 17],
];

// 0 = hand fully open, 1 = fist fully closed
function handCloseness(lm: NormalizedLandmark[]): number {
  const wrist = lm[0];
  const dist = (a: NormalizedLandmark, b: NormalizedLandmark) =>
    Math.hypot(a.x - b.x, a.y - b.y);
  // [tip, mcp] per finger; curled fingers bring the tip close to the knuckle line
  const fingers: [number, number][] = [
    [8, 5],
    [12, 9],
    [16, 13],
    [20, 17],
  ];
  let total = 0;
  for (const [tip, mcp] of fingers) {
    const ratio = dist(lm[tip], wrist) / dist(lm[mcp], wrist);
    // ratio ≈ 1.6+ when the finger is straight, ≈ 0.9 or less when curled
    total += Math.min(Math.max((1.55 - ratio) / (1.55 - 0.95), 0), 1);
  }
  return total / fingers.length;
}

// True when the palm (not the back of the hand) faces the camera.
// Cross product of wrist→indexMCP and wrist→pinkyMCP flips sign with hand
// orientation; combined with the handedness label it resolves palm vs back.
// (If this ever reads inverted on some setup, swap the "Left"/"Right" check.)
function palmFacingCamera(lm: NormalizedLandmark[], label: string): boolean {
  const v1x = lm[5].x - lm[0].x;
  const v1y = lm[5].y - lm[0].y;
  const v2x = lm[17].x - lm[0].x;
  const v2y = lm[17].y - lm[0].y;
  const crossZ = v1x * v2y - v1y * v2x;
  return label === "Left" ? crossZ > 0 : crossZ < 0;
}

// --- Detection sensitivity tuning ---
// MediaPipe confidence thresholds (defaults are 0.5, which lets phantom
// "hands" through on empty backgrounds — raise to be stricter)
const MIN_DETECTION_CONFIDENCE = 0.75;
const MIN_PRESENCE_CONFIDENCE = 0.75;
const MIN_TRACKING_CONFIDENCE = 0.6;
// Minimum handedness score to accept a detection at all
const MIN_HAND_SCORE = 0.85;
// A hand must be seen this many consecutive frames before it takes control
const CONFIRM_FRAMES = 4;
// ...and must be missing this many consecutive frames before control is released
const RELEASE_FRAMES = 6;

export type CameraStatus = "loading" | "ready" | "denied";

export default function CameraWindow({
  onCloseness,
  onStatus,
  visible = true,
}: {
  onCloseness: (value: number | null) => void;
  onStatus?: (status: CameraStatus) => void;
  visible?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const smoothRef = useRef(0);
  const presenceRef = useRef({ seen: 0, missed: 0, active: false });

  const [status, setStatus] = useState<CameraStatus>("loading");

  useEffect(() => {
    onStatus?.(status);
  }, [status, onStatus]);
  const [pos, setPos] = useState({ x: 24, y: 0 });
  const [size, setSize] = useState({ w: 280, h: 210 });
  const dragRef = useRef<{
    mode: "drag" | "resize";
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
  } | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPos({ x: 24, y: window.innerHeight - 210 - 96 });
  }, []);

  // Webcam + hand landmarker setup
  useEffect(() => {
    let landmarker: HandLandmarker | null = null;
    let stream: MediaStream | null = null;
    let cancelled = false;

    (async () => {
      try {
        const { FilesetResolver, HandLandmarker } =
          await import("@mediapipe/tasks-vision");
        const [vision, mediaStream] = await Promise.all([
          FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm",
          ),
          navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
          }),
        ]);
        if (cancelled) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = mediaStream;
        landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: MIN_DETECTION_CONFIDENCE,
          minHandPresenceConfidence: MIN_PRESENCE_CONFIDENCE,
          minTrackingConfidence: MIN_TRACKING_CONFIDENCE,
        });

        const video = videoRef.current;
        if (!video || cancelled) return;
        video.srcObject = stream;
        await video.play();
        setStatus("ready");

        let lastTime = -1;
        const loop = () => {
          const canvas = canvasRef.current;
          if (!video || !canvas || !landmarker) return;
          if (video.currentTime !== lastTime && video.videoWidth > 0) {
            lastTime = video.currentTime;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const result = landmarker.detectForVideo(video, performance.now());
            const ctx = canvas.getContext("2d")!;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const handScore = result.handedness[0]?.[0]?.score ?? 0;
            const handLabel = result.handedness[0]?.[0]?.categoryName ?? "";
            const handPresent =
              result.landmarks.length > 0 && handScore >= MIN_HAND_SCORE;
            // Only the palm side may drive the paper — back of hand is ignored
            const detected =
              handPresent && palmFacingCamera(result.landmarks[0], handLabel);
            const presence = presenceRef.current;

            if (detected) {
              presence.seen++;
              presence.missed = 0;
              const lm = result.landmarks[0];
              const raw = handCloseness(lm);

              if (!presence.active && presence.seen >= CONFIRM_FRAMES) {
                presence.active = true;
                // Start from the live value so control doesn't jump on entry
                smoothRef.current = raw;
              }
              if (presence.active) {
                // Light smoothing to keep the scrub steady
                smoothRef.current += (raw - smoothRef.current) * 0.6;
                onCloseness(smoothRef.current);
              }
              const value = smoothRef.current;

              ctx.strokeStyle = presence.active
                ? "#FFFFFF"
                : "rgba(255,255,255,0.35)";
              ctx.lineWidth = 3;
              for (const [a, b] of CONNECTIONS) {
                ctx.beginPath();
                ctx.moveTo(lm[a].x * canvas.width, lm[a].y * canvas.height);
                ctx.lineTo(lm[b].x * canvas.width, lm[b].y * canvas.height);
                ctx.stroke();
              }
              ctx.fillStyle = presence.active
                ? "#FFD600"
                : "rgba(255,214,0,0.35)";
              for (const p of lm) {
                ctx.beginPath();
                ctx.arc(
                  p.x * canvas.width,
                  p.y * canvas.height,
                  5,
                  0,
                  Math.PI * 2,
                );
                ctx.fill();
              }

              // Crumble progress bar along the bottom
              ctx.fillStyle = "rgba(15,15,15,0.6)";
              ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
              ctx.fillStyle = "#FFD600";
              ctx.fillRect(0, canvas.height - 10, canvas.width * value, 10);
            } else {
              presence.seen = 0;
              presence.missed++;
              // A brief dropout keeps control; a sustained one releases it
              if (presence.missed >= RELEASE_FRAMES && presence.active) {
                presence.active = false;
                onCloseness(null);
              }
              // Hand present but back-facing: draw a faint skeleton so the
              // user can see it's detected but deliberately ignored
              if (handPresent) {
                const lm = result.landmarks[0];
                ctx.strokeStyle = "rgba(255,255,255,0.2)";
                ctx.lineWidth = 3;
                for (const [a, b] of CONNECTIONS) {
                  ctx.beginPath();
                  ctx.moveTo(lm[a].x * canvas.width, lm[a].y * canvas.height);
                  ctx.lineTo(lm[b].x * canvas.width, lm[b].y * canvas.height);
                  ctx.stroke();
                }
                ctx.fillStyle = "rgba(255,255,255,0.6)";
                ctx.font = "16px monospace";
                ctx.textAlign = "center";
                // Canvas is CSS-mirrored, so flip text to keep it readable
                ctx.save();
                ctx.scale(-1, 1);
                ctx.fillText(
                  "show your palm ✋",
                  -canvas.width / 2,
                  canvas.height - 24,
                );
                ctx.restore();
              }
            }
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch (e) {
        console.error("Camera / hand tracking failed:", e);
        if (!cancelled) setStatus("denied");
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach((t) => t.stop());
      landmarker?.close();
    };
  }, [onCloseness]);

  // Drag / resize handling
  const onPointerDown = useCallback(
    (mode: "drag" | "resize") => (e: React.PointerEvent) => {
      e.preventDefault();
      dragRef.current = {
        mode,
        startX: e.clientX,
        startY: e.clientY,
        origX: pos.x,
        origY: pos.y,
        origW: size.w,
        origH: size.h,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [pos, size],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (d.mode === "drag") {
      setPos({
        x: Math.min(Math.max(0, d.origX + dx), window.innerWidth - 100),
        y: Math.min(Math.max(0, d.origY + dy), window.innerHeight - 60),
      });
    } else {
      setSize({
        w: Math.min(Math.max(180, d.origW + dx), 640),
        h: Math.min(Math.max(135, d.origH + dy), 480),
      });
    }
  }, []);

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  return (
    <div
      className="fixed z-50 border-4 border-text bg-primary-black shadow-[8px_8px_0_var(--color-primary-black)] select-none"
      style={{
        left: pos.x,
        top: pos.y,
        width: size.w,
        height: size.h,
        // Hidden via visibility (not unmount) so tracking keeps running
        visibility: visible ? "visible" : "hidden",
      }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Title bar — drag handle */}
      <div
        className="flex items-center justify-between h-7 px-2 bg-accent text-primary-black font-mono text-[11px] font-bold cursor-move"
        onPointerDown={onPointerDown("drag")}
      >
        <span>cam.exe — crumple to crush 📄</span>
        <span className="flex gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-black/20" />
          <span className="w-2.5 h-2.5 rounded-full bg-black/20" />
          <span className="w-2.5 h-2.5 rounded-full bg-black" />
        </span>
      </div>

      <div className="relative w-full h-[calc(100%-1.75rem)] overflow-hidden bg-primary-black">
        <video
          ref={videoRef}
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover -scale-x-100"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full -scale-x-100"
        />
        {status !== "ready" && (
          <div className="absolute inset-0 flex items-center justify-center text-white font-mono text-xs text-center px-4">
            {status === "loading"
              ? "starting camera + hand tracking…"
              : "camera unavailable — allow webcam access to crumple the paper"}
          </div>
        )}
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
        onPointerDown={onPointerDown("resize")}
      >
        <svg viewBox="0 0 16 16" className="w-full h-full text-white/70">
          <path d="M15 7v8H7z" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
