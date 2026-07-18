"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CameraWindow, { type CameraStatus } from "@/components/CameraWindow";

// Above this closeness the fist is considered "fully closed" and the
// crumble plays out to the end on its own
const FIST_THRESHOLD = 0.85;
// Portion of the timeline scrubbed directly by the hand; the rest plays out
const SCRUB_PORTION = 0.8;
// Crumble progress at which the paper starts crying out
const PAIN_THRESHOLD = 0.45;

const PAIN_WORDS = [
  "Oww!",
  "Please...",
  "Stop!",
  "Nooo!",
  "Mercy!",
  "Why?!",
  "Ouch!",
  "Help!",
];

const PainCloud = ({
  id,
  word,
  onDone,
}: {
  id: number;
  word: string;
  onDone: (id: number) => void;
}) => {
  const [x] = useState(() => Math.random() * 240 - 120);
  const [drift] = useState(() => Math.random() * 60 - 30);
  const [tilt] = useState(() => Math.random() * 24 - 12);

  return (
    <motion.div
      initial={{ y: 40, x, opacity: 0, scale: 0.4, rotate: 0 }}
      animate={{
        y: -180,
        x: x + drift,
        opacity: [0, 1, 1, 0],
        scale: [0.4, 1.15, 1, 0.9],
        rotate: tilt,
      }}
      transition={{ duration: 1.8, ease: "easeOut" }}
      onAnimationComplete={() => onDone(id)}
      className="absolute left-1/2 top-1/3 -translate-x-1/2 pointer-events-none z-20"
    >
      <span className="inline-block bg-white border-3 border-text rounded-full px-4 py-1.5 font-heading font-black text-lg md:text-xl text-text shadow-[4px_4px_0_var(--color-primary-black)] whitespace-nowrap">
        {word}
      </span>
    </motion.div>
  );
};

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shakeRef = useRef<HTMLDivElement>(null);
  const closenessRef = useRef<number | null>(null);
  const smoothTimeRef = useRef(0);
  const rafRef = useRef<number>(0);
  const progressRef = useRef(0);
  const [inPain, setInPain] = useState(false);
  const [clouds, setClouds] = useState<{ id: number; word: string }[]>([]);
  const [cameraOn, setCameraOn] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const [camDenied, setCamDenied] = useState(false);
  const [camReady, setCamReady] = useState(false);

  const handleCloseness = useCallback((value: number | null) => {
    closenessRef.current = value;
  }, []);

  const handleCamStatus = useCallback((status: CameraStatus) => {
    setCamReady(status === "ready");
    if (status === "denied") {
      // Permission refused/failed — turn the toggle back off so the user
      // can click "wanna try" again to re-request access
      setCamDenied(true);
      setCameraOn(false);
      setDebugOpen(false);
      closenessRef.current = null;
    }
  }, []);

  const toggleCamera = useCallback(() => {
    setCameraOn((on) => {
      if (on) {
        // Stopping: release the paper so it smoothly rewinds to flat
        closenessRef.current = null;
        setDebugOpen(false);
      } else {
        setCamDenied(false);
      }
      return !on;
    });
  }, []);

  useEffect(() => {
    const tick = () => {
      const video = videoRef.current;
      const value = closenessRef.current;
      if (video && video.duration > 0) {
        if (value !== null) {
          if (value >= FIST_THRESHOLD) {
            // Fist fully closed — let the crumble finish on its own
            if (video.paused && !video.ended) video.play().catch(() => {});
            // Keep the scrub reference in sync so a later release/rewind
            // starts from where the video actually is
            smoothTimeRef.current = video.currentTime;
          } else {
            // Hand drives the timeline: openness → start, closedness → crumbled
            if (!video.paused) video.pause();
            const target =
              Math.min(value / FIST_THRESHOLD, 1) *
              video.duration *
              SCRUB_PORTION;
            // Ease toward the target so the paper doesn't jitter
            smoothTimeRef.current += (target - smoothTimeRef.current) * 0.5;
            if (Math.abs(video.currentTime - smoothTimeRef.current) > 0.015) {
              video.currentTime = smoothTimeRef.current;
            }
          }
        } else {
          // Hand left the frame — smoothly release the paper back to flat.
          // smoothTimeRef stays live during the rewind, so a hand re-entering
          // mid-return takes over from the current position without a jump.
          if (!video.paused) video.pause();
          smoothTimeRef.current *= 0.94;
          if (smoothTimeRef.current < 0.02) smoothTimeRef.current = 0;
          if (Math.abs(video.currentTime - smoothTimeRef.current) > 0.015) {
            video.currentTime = smoothTimeRef.current;
          }
        }

        // Violent shake, ramping exponentially with crumble progress
        const progress = video.currentTime / video.duration;
        progressRef.current = progress;
        setInPain(progress >= PAIN_THRESHOLD && !video.ended);
        const shake = shakeRef.current;
        if (shake) {
          const amp = Math.pow(progress, 3) * 7;
          // Keep shaking after the video ends as long as a hand is still
          // squeezing; only rest once the hand releases/leaves
          if (amp > 0.3 && (!video.ended || value !== null)) {
            shake.style.transform = `translate(${(Math.random() * 2 - 1) * amp}px, ${
              (Math.random() * 2 - 1) * amp
            }px) rotate(${(Math.random() * 2 - 1) * amp * 0.4}deg)`;
          } else {
            shake.style.transform = "";
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Spawn pain clouds while the paper is suffering, faster as it gets worse
  useEffect(() => {
    if (!inPain) return;
    let timer: ReturnType<typeof setTimeout>;
    const spawn = () => {
      setClouds((prev) => [
        ...prev.slice(-5),
        {
          id: Date.now(),
          word: PAIN_WORDS[Math.floor(Math.random() * PAIN_WORDS.length)],
        },
      ]);
      const interval = 850 - Math.pow(progressRef.current, 2) * 600;
      timer = setTimeout(spawn, interval);
    };
    spawn();
    return () => clearTimeout(timer);
  }, [inPain]);

  const removeCloud = useCallback((id: number) => {
    setClouds((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <div>
      <div className="flex-1 flex flex-col items-center justify-center min-h-[75vh] px-6">
        <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex flex-col text-center md:text-left order-2 md:order-1">
            <h1 className="text-5xl md:text-[5.5rem] font-heading font-black tracking-tighter leading-[1.05] text-text">
              Hello, my
              <br />
              name&apos;s Anas.
              <br />
              I&apos;m always <br />
              Learning.
            </h1>
          </div>

          {/* Crumbling paper reel — timeline driven by hand closeness */}
          <div className="relative shrink-0 order-1 md:order-2">
            <div ref={shakeRef} className="will-change-transform">
              <video
                ref={videoRef}
                src="/videos/crumble-scrub.webm"
                muted
                playsInline
                preload="auto"
                className="w-84 h-84 md:w-124 md:h-124 object-contain -scale-x-100"
              />
            </div>

            {/* Pain clouds fading up as the paper gets crushed */}
            <AnimatePresence mode="popLayout">
              {clouds.map((c) => (
                <PainCloud
                  key={c.id}
                  id={c.id}
                  word={c.word}
                  onDone={removeCloud}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Camera controls, bottom-left just above the section's bottom border */}
      <div className="max-w-6xl mx-auto px-6 my-2 flex gap-1 font-mono text-xs text-text-secondary">
        <button
          onClick={toggleCamera}
          className="underline underline-offset-4 decoration-dotted hover:text-text transition-colors cursor-pointer"
        >
          {cameraOn ? "Stop" : "Wanna try somthing?"}
        </button>
        {cameraOn && <div>•</div>}
        {cameraOn && (
          <button
            onClick={() => setDebugOpen((v) => !v)}
            className="underline underline-offset-4 decoration-dotted hover:text-text transition-colors cursor-pointer"
          >
            {debugOpen ? "Hide debug" : "Debug!"}
          </button>
        )}
        {cameraOn && <div>•</div>}
        {cameraOn && (
          <div>{camReady ? "Raise your hand now" : "Starting camera…"}</div>
        )}
        {!cameraOn && camDenied && (
          <div>
            Camera was blocked — allow camera access in your browser, then
            click again
          </div>
        )}
      </div>

      {/* Floating webcam window with hand-tracking skeleton */}
      {cameraOn && (
        <CameraWindow
          onCloseness={handleCloseness}
          onStatus={handleCamStatus}
          visible={debugOpen}
        />
      )}
    </div>
  );
}
