"use client";

import { useEffect, useRef } from "react";
import { STILL_FRAME_SECONDS } from "./pixel-ink/config";
import { createRenderer } from "./pixel-ink/renderer";

/**
 * A contribution-graph wall drawn on the GPU with WebGPU, all in GitHub's
 * greens: pale empty squares everywhere, deepening where four blobs wander,
 * merge like water drops and split apart again, with random squares twinkling
 * to a stronger green. Every change is a smooth fade. Squares sweep in on
 * load, and the wall fades toward its edges and behind the heading.
 *
 * Meant as a decorative background: the parent should be `relative`, and the
 * canvas fills it. Colors come from the `--ink-green-*` CSS variables. Where
 * WebGPU isn't supported the canvas simply stays empty. Tunables live in
 * `pixel-ink/config.ts`.
 */
export default function PixelInk({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let stop = () => {};

    createRenderer(canvas).then((renderer) => {
      if (!renderer) return;
      if (disposed) return renderer.dispose();

      const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
      const startedAt = performance.now();
      let rafId = 0;

      const tick = (now: number) => {
        rafId = requestAnimationFrame(tick);
        if (!document.hidden) renderer.draw((now - startedAt) / 1000);
      };

      const startOrFreeze = () => {
        cancelAnimationFrame(rafId);
        if (reducedMotion.matches) renderer.draw(STILL_FRAME_SECONDS);
        else rafId = requestAnimationFrame(tick);
      };

      const resizeObserver = new ResizeObserver(() => {
        renderer.resize();
        if (reducedMotion.matches) renderer.draw(STILL_FRAME_SECONDS);
      });

      renderer.resize();
      startOrFreeze();
      resizeObserver.observe(canvas);
      reducedMotion.addEventListener("change", startOrFreeze);

      stop = () => {
        cancelAnimationFrame(rafId);
        resizeObserver.disconnect();
        reducedMotion.removeEventListener("change", startOrFreeze);
        renderer.dispose();
      };
    });

    return () => {
      disposed = true;
      stop();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
