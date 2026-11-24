import {
  BLOB_MOTION,
  QUARTER_SECONDS,
  RING_SCALE,
  WIDE_CENTER_X,
  WIDE_VIEWPORT_PX,
} from "./config";

export type Blob = { x: number; y: number; radius: number };

const QUARTER = Math.PI / 2;

/** Maps a sine into [0, 1]. */
const wave = (t: number, freq: number, phase: number) =>
  0.5 + 0.5 * Math.sin(t * freq + phase);

/**
 * The four blobs at time `t` (seconds), for a canvas of the given size. Each
 * orbits the centre, reaching in and out and swaying, so neighbours overlap
 * and merge, then separate.
 */
export function blobsAt(t: number, width: number, height: number): Blob[] {
  const ringRadius = Math.min(width, height) * RING_SCALE;
  const discRadius = ringRadius * 0.78;
  const centerX = width * (width >= WIDE_VIEWPORT_PX ? WIDE_CENTER_X : 0.5);
  const turn = (t / QUARTER_SECONDS) * QUARTER;

  return BLOB_MOTION.map((m, k) => {
    const angle = turn + k * QUARTER + 0.6 * Math.sin(t * m.swayFreq + m.swayPhase);
    const reach = ringRadius * (0.35 + 0.65 * wave(t, m.reachFreq, m.reachPhase));
    return {
      x: centerX + Math.cos(angle) * reach,
      y: height / 2 + Math.sin(angle) * reach,
      radius: discRadius * (0.9 + 0.2 * wave(t, m.sizeFreq, 0)),
    };
  });
}
