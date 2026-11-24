import * as c from "./config";

/** WGSL needs a decimal point on float literals. */
const f = (n: number) => (Number.isInteger(n) ? n.toFixed(1) : String(n));

/**
 * The whole wall is drawn by one fragment shader over a full-screen triangle.
 * Every square's shade, twinkle, fades and intro are continuous functions of
 * time, so nothing ever jumps between shades. The config values are baked in
 * as constants; only size, time, colours and blob positions change per frame.
 */
export const SHADER = /* wgsl */ `
const CELL: f32 = ${f(c.CELL)};
const GAP: f32 = ${f(c.GAP)};
const ROUNDING: f32 = ${f(c.ROUNDING)};
const EMPTY_ALPHA: f32 = ${f(c.EMPTY_ALPHA)};
const INK_ALPHA: f32 = ${f(c.INK_ALPHA)};
const TWINKLE_ALPHA: f32 = ${f(c.TWINKLE_ALPHA)};
const FIELD_SURFACE: f32 = ${f(c.FIELD_SURFACE)};
const FIELD_RANGE: f32 = ${f(c.FIELD_RANGE)};
const MAX_DEPTH: f32 = ${f(c.MAX_DEPTH)};
const SHADE_JITTER: f32 = ${f(c.SHADE_JITTER)};
const TWINKLE_DENSITY: f32 = ${f(c.TWINKLE_DENSITY)};
const TWINKLE_EDGE_BOOST: f32 = ${f(c.TWINKLE_EDGE_BOOST)};
const TWINKLE_EDGE_REACH: f32 = ${f(c.TWINKLE_EDGE_REACH)};
const TWINKLE_MIN: f32 = ${f(c.TWINKLE_MIN_SECONDS)};
const TWINKLE_MAX: f32 = ${f(c.TWINKLE_MAX_SECONDS)};
const EDGE_FADE_PX: f32 = ${f(c.EDGE_FADE_PX)};
const WIDE_VIEWPORT_PX: f32 = ${f(c.WIDE_VIEWPORT_PX)};
const HEADING_FADE_MIN: f32 = ${f(c.HEADING_FADE_MIN)};
const HEADING_FADE_FROM: f32 = ${f(c.HEADING_FADE_FROM)};
const HEADING_FADE_TO: f32 = ${f(c.HEADING_FADE_TO)};
const INTRO_STAGGER: f32 = ${f(c.INTRO_STAGGER)};
const INTRO_FADE: f32 = ${f(c.INTRO_FADE)};
const PI: f32 = 3.14159265;

struct Uniforms {
  resolution: vec2f, // canvas size in CSS px
  time: f32,         // seconds since the wall appeared
  dpr: f32,          // device pixels per CSS px
  ramp: array<vec4f, 5>, // green ramp: empty tile, then GitHub levels 1–4
  blobs: array<vec4f, 4>, // x, y, radius, unused
}
@group(0) @binding(0) var<uniform> u: Uniforms;

@vertex
fn vs(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
  // One oversized triangle that covers the whole canvas
  var corners = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  return vec4f(corners[index], 0.0, 1.0);
}

/** Deterministic noise in [0, 1) from three integers. */
fn noise(x: i32, y: i32, salt: i32) -> f32 {
  var h = bitcast<u32>(x) * 374761393u
        + bitcast<u32>(y) * 668265263u
        + bitcast<u32>(salt) * 1442695041u;
  h = (h ^ (h >> 13u)) * 1274126177u;
  return f32(h ^ (h >> 16u)) / 4294967296.0;
}

/** Metaball field: 1 at an isolated blob's edge, adding up where blobs meet. */
fn fieldAt(p: vec2f) -> f32 {
  var sum = 0.0;
  for (var k = 0; k < 4; k++) {
    let blob = u.blobs[k];
    let d = p - blob.xy;
    sum += blob.z * blob.z / (dot(d, d) + 1.0);
  }
  return sum;
}

/** A color anywhere along the ramp: 0 is the empty tile, 1 the deepest green. */
fn rampAt(s: f32) -> vec3f {
  let x = s * 4.0;
  var c = mix(u.ramp[0].rgb, u.ramp[1].rgb, clamp(x, 0.0, 1.0));
  c = mix(c, u.ramp[2].rgb, clamp(x - 1.0, 0.0, 1.0));
  c = mix(c, u.ramp[3].rgb, clamp(x - 2.0, 0.0, 1.0));
  return mix(c, u.ramp[4].rgb, clamp(x - 3.0, 0.0, 1.0));
}

@fragment
fn fs(@builtin(position) fragCoord: vec4f) -> @location(0) vec4f {
  let p = fragCoord.xy / u.dpr;
  let cell = floor(p / CELL);
  let ci = i32(cell.x);
  let cj = i32(cell.y);
  let centre = (cell + 0.5) * CELL;

  // The square's shape: a rounded box, anti-aliased to one device pixel
  let q = abs(p - centre) - (vec2f((CELL - GAP) * 0.5) - ROUNDING);
  let dist = length(max(q, vec2f(0.0))) + min(max(q.x, q.y), 0.0) - ROUNDING;
  let shape = clamp(0.5 - dist * u.dpr, 0.0, 1.0);
  if (shape <= 0.0) { return vec4f(0.0); }

  // Fades: soft at the edges, softer behind the heading, and the intro sweep
  let edge = smoothstep(
    0.0, EDGE_FADE_PX,
    min(min(centre.x, u.resolution.x - centre.x), min(centre.y, u.resolution.y - centre.y)));
  let heading = HEADING_FADE_MIN
    + (1.0 - HEADING_FADE_MIN) * smoothstep(HEADING_FADE_FROM, HEADING_FADE_TO, centre.x / u.resolution.x);
  let behindHeading = select(1.0, heading, u.resolution.x >= WIDE_VIEWPORT_PX);
  let intro = smoothstep(0.0, INTRO_FADE, u.time - f32(ci + cj) * INTRO_STAGGER);
  let visible = edge * behindHeading * intro;

  // Shade: depth follows the blobs' field, with a fixed per-square variation
  let field = fieldAt(centre);
  let strength = smoothstep(0.0, 1.0, (field - FIELD_SURFACE) / FIELD_RANGE);
  let jitter = 1.0 - SHADE_JITTER + 2.0 * SHADE_JITTER * noise(ci, cj, 9);
  let depth = clamp(strength * jitter, 0.0, 1.0);
  let baseColour = rampAt(depth * MAX_DEPTH);
  let baseAlpha = mix(EMPTY_ALPHA, INK_ALPHA, depth);

  // Twinkle: each square runs its own cycle and rolls at the start of each
  // one whether to brighten. The roll is softened so it can't pop.
  let seconds = TWINKLE_MIN + noise(ci, cj, 1) * (TWINKLE_MAX - TWINKLE_MIN);
  let progress = u.time / seconds + noise(ci, cj, 2);
  let cycle = i32(floor(progress));
  let nearSurface = 1.0 - clamp(abs(field - FIELD_SURFACE) / TWINKLE_EDGE_REACH, 0.0, 1.0);
  let chance = TWINKLE_DENSITY + TWINKLE_EDGE_BOOST * nearSurface;
  let lit = smoothstep(0.0, 0.03, chance - noise(ci, cj, 3 + cycle * 7));
  let twinkleAlpha = sin(PI * fract(progress)) * lit * TWINKLE_ALPHA;
  // Twinkles pick a light green (between levels 1 and 2)
  let twinkleColour = rampAt(0.25 + 0.25 * noise(ci, cj, 4 + cycle * 7));

  // Twinkle over shade, blended (not switched), in premultiplied alpha
  let alpha = twinkleAlpha + baseAlpha * (1.0 - twinkleAlpha);
  let colour = (twinkleColour * twinkleAlpha + baseColour * baseAlpha * (1.0 - twinkleAlpha)) / max(alpha, 0.0001);
  let coverage = shape * visible;
  return vec4f(colour * alpha * coverage, alpha * coverage);
}
`;
