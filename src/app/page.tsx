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
    <div className="flex flex-1 flex-col">
      <section className="flex flex-1 items-center">
        <div className="mx-auto grid min-h-[70vh] w-full max-w-6xl items-center gap-10 px-6 py-12 md:grid-cols-2 md:gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="order-2 text-center text-5xl font-heading font-black leading-[1.05] tracking-tighter text-text md:order-1 md:text-left md:text-6xl lg:text-[5.5rem]">
            <span className="block text-balance">Hello, my name&apos;s Anas.</span>
            <span className="block text-balance">I&apos;m always learning.</span>
          </h1>

          {/* Crumbling paper reel — timeline driven by hand closeness */}
          <div className="relative order-1 flex justify-center md:order-2 md:justify-end">
            <div ref={shakeRef} className="will-change-transform">
              <video
                ref={videoRef}
                src="/videos/crumble-scrub.webm"
                muted
                playsInline
                preload="auto"
                className="h-72 w-72 -scale-x-100 object-contain md:h-96 md:w-96 lg:h-[31rem] lg:w-[31rem]"
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
      </section>

      {/* Camera controls, aligned with the page container's left edge */}
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-2 gap-y-1 px-6 pb-4 font-mono text-xs text-text-secondary">
        <button
          onClick={toggleCamera}
          className="cursor-pointer underline decoration-dotted underline-offset-4 transition-colors hover:text-text"
        >
          {cameraOn ? "Stop" : "Wanna try something?"}
        </button>
        {cameraOn && <span aria-hidden>•</span>}
        {cameraOn && (
          <button
            onClick={() => setDebugOpen((v) => !v)}
            className="cursor-pointer underline decoration-dotted underline-offset-4 transition-colors hover:text-text"
          >
            {debugOpen ? "Hide debug" : "Debug!"}
          </button>
        )}
        {cameraOn && <span aria-hidden>•</span>}
        {cameraOn && (
          <span>{camReady ? "Raise your hand now" : "Starting camera…"}</span>
        )}
        {!cameraOn && camDenied && (
          <span>
            Camera was blocked — allow camera access in your browser, then
            click again
          </span>
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
