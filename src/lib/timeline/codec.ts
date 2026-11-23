import {
  MAX_ASSIGNEES, MAX_FREEZES, MAX_HANDLE, MAX_LABEL, MAX_PEOPLE, MAX_REPO, MAX_REPOS, MAX_SERVICE, MAX_SERVICES,
  MAX_TEAMS, MAX_TEAM_NAME, MAX_WINDOWS, SLOT, TEAM_COLORS, type Repeat, type Timeline, type Window,
} from "./types";

/**
 * Format versions. Every version ever written must keep decoding (ADR 0001).
 * v1: teams, windows.
 * v2: + people, repos and services tables, a per-Window extras byte, freezes.
 */
const VERSION = 2;
const KIND = { none: 0, daily: 1, weekly: 2 } as const;
const HAS_UNTIL = 4;
const X_ASSIGNEES = 1, X_REF = 2, X_SERVICE = 4;

export type DecodeResult =
  | { ok: true; timeline: Timeline }
  | { ok: false; reason: "corrupt" | "unsupported-version" };

class Corrupt extends Error {}
class Unsupported extends Error {}

// ---- byte writer / reader --------------------------------------------------

class Writer {
  bytes: number[] = [];
  byte(b: number) {
    this.bytes.push(b);
  }
  varint(n: number) {
    if (!Number.isInteger(n) || n < 0) throw new Error(`cannot encode ${n}`);
    while (n >= 0x80) {
      this.bytes.push((n % 0x80) | 0x80);
      n = Math.floor(n / 0x80);
    }
    this.bytes.push(n);
  }
  text(s: string) {
    const b = new TextEncoder().encode(s);
    this.varint(b.length);
    this.bytes.push(...b);
  }
  slots(minutes: number) {
    if (minutes % SLOT !== 0) throw new Error(`times must be on the ${SLOT}-minute grid`);
    this.varint(minutes / SLOT);
  }
}

class Reader {
  pos = 0;
  constructor(private b: Uint8Array) {}
  byte(): number {
    if (this.pos >= this.b.length) throw new Corrupt();
    return this.b[this.pos++];
  }
  varint(): number {
    let n = 0;
    let mul = 1;
    for (let i = 0; i < 8; i++) {
      const b = this.byte();
      n += (b & 0x7f) * mul;
      if (!(b & 0x80)) return n;
      mul *= 0x80;
    }
    throw new Corrupt();
  }
  text(): string {
    const len = this.varint();
    if (this.pos + len > this.b.length) throw new Corrupt();
    const slice = this.b.subarray(this.pos, this.pos + len);
    this.pos += len;
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(slice);
    } catch {
      throw new Corrupt();
    }
  }
  slots(): number {
    return this.varint() * SLOT;
  }
  done() {
    if (this.pos !== this.b.length) throw new Corrupt();
  }
}

// ---- compression / base64url -----------------------------------------------

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream as unknown as ReadableWritablePair);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

function toBase64Url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(s)) throw new Corrupt();
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

// ---- public API ------------------------------------------------------------

export async function encodeTimeline(t: Timeline): Promise<string> {
  const w = new Writer();
  w.byte(VERSION);
  w.varint(t.teams.length);
  for (const team of t.teams) {
    w.byte(team.color);
    w.text(team.name);
  }
  const list = (xs: string[] = []) => { w.varint(xs.length); xs.forEach((s) => w.text(s)); };
  list(t.people?.map((p) => p.gh));
  list(t.repos);
  list(t.services);
  w.varint(t.windows.length);
  for (const win of t.windows) {
    w.varint(win.team);
    w.text(win.label);
    w.slots(win.start);
    w.slots(win.duration);
    const r = win.repeat;
    const until = r.kind === "none" ? undefined : r.until;
    w.byte(KIND[r.kind] | (until !== undefined ? HAS_UNTIL : 0));
    if (r.kind === "weekly") w.byte(r.days);
    if (until !== undefined) w.slots(until);
    const x = (win.assignees?.length ? X_ASSIGNEES : 0) | (win.ref ? X_REF : 0) | (win.service !== undefined ? X_SERVICE : 0);
    w.byte(x);
    if (win.assignees?.length) { w.varint(win.assignees.length); win.assignees.forEach((a) => w.varint(a)); }
    if (win.ref) { w.varint(win.ref.repo); w.varint(win.ref.num); }
    if (win.service !== undefined) w.varint(win.service);
  }
  w.varint(t.freezes?.length ?? 0);
  for (const f of t.freezes ?? []) {
    w.text(f.label);
    w.slots(f.start);
    w.slots(f.duration);
  }
  const packed = await pipe(Uint8Array.from(w.bytes), new CompressionStream("deflate-raw"));
  return toBase64Url(packed);
}

export async function decodeTimeline(fragment: string): Promise<DecodeResult> {
  try {
    const packed = fromBase64Url(fragment);
    let raw: Uint8Array;
    try {
      raw = await pipe(packed, new DecompressionStream("deflate-raw"));
    } catch {
      throw new Corrupt();
    }
    const r = new Reader(raw);
    const version = r.byte();
    if (version !== 1 && version !== 2) throw new Unsupported();
    const teams: Timeline["teams"] = [];
    const teamCount = r.varint();
    if (teamCount > MAX_TEAMS) throw new Corrupt();
    for (let n = teamCount; n > 0; n--) {
      const color = r.byte();
      const name = r.text();
      if (color >= TEAM_COLORS.length || name.length > MAX_TEAM_NAME) throw new Corrupt();
      teams.push({ name, color });
    }
    const list = (max: number, maxLen: number) => {
      if (version < 2) return [];
      const n = r.varint();
      if (n > max) throw new Corrupt();
      return Array.from({ length: n }, () => {
        const s = r.text();
        if (!s || s.length > maxLen) throw new Corrupt();
        return s;
      });
    };
    const people = list(MAX_PEOPLE, MAX_HANDLE);
    const repos = list(MAX_REPOS, MAX_REPO);
    const services = list(MAX_SERVICES, MAX_SERVICE);
    const count = r.varint();
    if (count > MAX_WINDOWS) throw new Corrupt();
    const windows: Timeline["windows"] = [];
    for (let i = 0; i < count; i++) {
      const team = r.varint();
      if (team >= teams.length) throw new Corrupt();
      const label = r.text();
      const start = r.slots();
      const duration = r.slots();
      if (label.length > MAX_LABEL || duration <= 0) throw new Corrupt();
      const flags = r.byte();
      const kind = flags & 3;
      let repeat: Repeat;
      if (kind === KIND.none) repeat = { kind: "none" };
      else if (kind === KIND.daily) repeat = { kind: "daily" };
      else if (kind === KIND.weekly) {
        const days = r.byte();
        if (days < 1 || days > 0x7f) throw new Corrupt();
        repeat = { kind: "weekly", days };
      } else throw new Corrupt();
      if (flags & HAS_UNTIL) {
        if (repeat.kind === "none") throw new Corrupt();
        repeat.until = r.slots();
      }
      const win: Window = { team, label, start, duration, repeat };
      if (version >= 2) {
        const x = r.byte();
        if (x & ~(X_ASSIGNEES | X_REF | X_SERVICE)) throw new Corrupt();
        if (x & X_ASSIGNEES) {
          const n = r.varint();
          if (n < 1 || n > MAX_ASSIGNEES) throw new Corrupt();
          win.assignees = Array.from({ length: n }, () => r.varint());
          if (win.assignees.some((a) => a >= people.length)) throw new Corrupt();
        }
        if (x & X_REF) {
          const repo = r.varint();
          const num = r.varint();
          if (repo >= repos.length || num < 1) throw new Corrupt();
          win.ref = { repo, num };
        }
        if (x & X_SERVICE) {
          win.service = r.varint();
          if (win.service >= services.length) throw new Corrupt();
        }
      }
      windows.push(win);
    }
    const timeline: Timeline = { teams, windows };
    if (version >= 2) {
      const n = r.varint();
      if (n > MAX_FREEZES) throw new Corrupt();
      const freezes = Array.from({ length: n }, () => {
        const label = r.text();
        const start = r.slots();
        const duration = r.slots();
        if (label.length > MAX_LABEL || duration <= 0) throw new Corrupt();
        return { label, start, duration };
      });
      if (people.length) timeline.people = people.map((gh) => ({ gh }));
      if (repos.length) timeline.repos = repos;
      if (services.length) timeline.services = services;
      if (freezes.length) timeline.freezes = freezes;
    }
    r.done();
    return { ok: true, timeline };
  } catch (e) {
    if (e instanceof Unsupported) return { ok: false, reason: "unsupported-version" };
    return { ok: false, reason: "corrupt" };
  }
}
