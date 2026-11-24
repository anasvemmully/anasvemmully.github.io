/**
 * Tunables for the PixelInk background. Sizes are CSS px, strengths are
 * opacities (0–1), and times are seconds.
 */

/* The wall: a contribution-graph style grid of rounded squares */
/** Distance between neighbouring squares. */
export const CELL = 32;
/** Gap between neighbouring squares. */
export const GAP = 5;
/** Corner radius of a square. */
export const ROUNDING = 6;

/* Strengths (opacity of a square's color) */
/** Empty squares, so the whole grid is visible. */
export const EMPTY_ALPHA = 1;
/** Squares at their deepest green. */
export const INK_ALPHA = 0.9;

/* Shading: squares go from empty to deep green with the merging blobs */
/** Field strength at which a blob's surface sits; green deepens above it. */
export const FIELD_SURFACE = 0.6;
/** Field range over which a square goes from empty to its deepest green. */
export const FIELD_RANGE = 0.9;
/**
 * How far along the green ramp the blobs can reach, from 0 (empty tile) to 1
 * (deepest green). 0.5 stops at the ramp's middle level, keeping the sage light.
 */
export const MAX_DEPTH = 0.5;
/** How much each square's shade is randomly lighter or darker (fixed per square). */
export const SHADE_JITTER = 0.06;

/* Random fill: squares fill up with green at random, hold, then drain away */
/** Chance that a square fills during any one of its cycles. */
export const FILL_DENSITY = 0.3;
/** One square's fill cycle (fill, hold, drain) lasts somewhere between these. */
export const FILL_MIN_SECONDS = 7;
export const FILL_MAX_SECONDS = 16;
/** Fraction of a cycle spent filling in. */
export const FILL_IN = 0.1;
/** Fraction of a cycle at which the square starts to drain; it is empty again by the end. */
export const FILL_HOLD = 0.62;
/** Each fill picks a green between these points on the ramp (0 = empty tile, 1 = deepest). */
export const FILL_DEPTH_MIN = 0.25;
export const FILL_DEPTH_MAX = 0.6;
/**
 * The sage ramp, empty tile first then four levels like GitHub's. Used when the
 * `--ink-green-0…4` CSS variables aren't available.
 */
export const GREEN_RAMP_FALLBACK = ["#edf1e9", "#d3dfca", "#b0c7a5", "#8eac83", "#678864"];

/* Blobs: the circles that wander, merge and split */
/** Seconds the whole loop takes to turn by one quarter. */
export const QUARTER_SECONDS = 14;
/** Ring the blobs orbit on, as a fraction of the canvas's shorter side. */
export const RING_SCALE = 0.225;
/** On wide viewports the blobs centre this far across, keeping them off the heading. */
export const WIDE_CENTER_X = 0.62;
/**
 * Per-blob motion, as sums of sines with unrelated frequencies. They never
 * line up, so blobs seem to wander at random: drifting together to merge,
 * then pulling apart again.
 */
export const BLOB_MOTION = [
  { reachFreq: 0.155, reachPhase: 0.0, swayFreq: 0.115, swayPhase: 1.3, sizeFreq: 0.205 },
  { reachFreq: 0.135, reachPhase: 2.1, swayFreq: 0.185, swayPhase: 0.4, sizeFreq: 0.165 },
  { reachFreq: 0.215, reachPhase: 4.2, swayFreq: 0.095, swayPhase: 2.6, sizeFreq: 0.145 },
  { reachFreq: 0.175, reachPhase: 5.5, swayFreq: 0.145, swayPhase: 3.9, sizeFreq: 0.235 },
] as const;

/* Fades */
/** Width of the soft fade at the edges of the wall. */
export const EDGE_FADE_PX = 180;
/** Viewports at least this wide have the heading on the left, so fade that side. */
export const WIDE_VIEWPORT_PX = 768;
/** How faint the wall gets behind the heading, as a fraction of full strength. */
export const HEADING_FADE_MIN = 0.12;
/** Horizontal span (as a fraction of the width) over which the heading fade lifts. */
export const HEADING_FADE_FROM = 0.05;
export const HEADING_FADE_TO = 0.55;

/* Intro: squares appear in a diagonal sweep */
/** Delay per diagonal of squares. */
export const INTRO_STAGGER = 0.025;
/** How long one square takes to fade in. */
export const INTRO_FADE = 0.5;

/** The moment shown as a single still frame when reduced motion is on. */
export const STILL_FRAME_SECONDS = 10;
