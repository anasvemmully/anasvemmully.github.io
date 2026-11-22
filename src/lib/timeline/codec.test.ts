import { describe, expect, it } from "vitest";
import { decodeTimeline, encodeTimeline } from "./codec";
import type { Timeline } from "./types";

const SUN = Date.UTC(2026, 10, 22) / 60000;

const sample: Timeline = {
  teams: [
    { name: "Infra", color: 0 },
    { name: "Daten-Team ✓", color: 7 },
  ],
  windows: [
    { team: 0, label: "Nightly backup", start: SUN + 120, duration: 120, repeat: { kind: "daily" } },
    { team: 1, label: "", start: SUN + 1380, duration: 240, repeat: { kind: "weekly", days: 0b1000001, until: SUN + 60 * 24 * 90 } },
    { team: 0, label: "Freeze", start: SUN + 15, duration: 15, repeat: { kind: "none" } },
  ],
};

describe("timeline codec", () => {
  it("round-trips a Timeline through its fragment", async () => {
    const fragment = await encodeTimeline(sample);
    expect(await decodeTimeline(fragment)).toEqual({ ok: true, timeline: sample });
  });

  it("produces a URL-safe fragment", async () => {
    expect(await encodeTimeline(sample)).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("keeps a 50-Window Timeline well under 1,000 characters", async () => {
    const big: Timeline = {
      teams: Array.from({ length: 5 }, (_, i) => ({ name: `Team ${i}`, color: i })),
      windows: Array.from({ length: 50 }, (_, i) => ({
        team: i % 5,
        label: `Job ${i}`,
        start: SUN + i * 90,
        duration: 60,
        repeat: { kind: "daily" as const },
      })),
    };
    expect((await encodeTimeline(big)).length).toBeLessThan(1000);
  });

  it("round-trips an empty Timeline", async () => {
    const empty: Timeline = { teams: [], windows: [] };
    expect(await decodeTimeline(await encodeTimeline(empty))).toEqual({ ok: true, timeline: empty });
  });

  it("rejects a corrupt fragment", async () => {
    expect(await decodeTimeline("not a real fragment!!")).toEqual({ ok: false, reason: "corrupt" });
    const good = await encodeTimeline(sample);
    expect(await decodeTimeline(good.slice(0, good.length - 8))).toEqual({ ok: false, reason: "corrupt" });
  });

  it("rejects an unknown format version", async () => {
    // payload [99] deflated+base64url, built independently of the codec
    const raw = new Uint8Array([99, 0, 0]);
    const cs = new Blob([raw]).stream().pipeThrough(new CompressionStream("deflate-raw"));
    const bytes = new Uint8Array(await new Response(cs).arrayBuffer());
    const b64 = Buffer.from(bytes).toString("base64url");
    expect(await decodeTimeline(b64)).toEqual({ ok: false, reason: "unsupported-version" });
  });

  it("refuses to encode times that are not on the 15-minute grid", async () => {
    const bad: Timeline = { teams: [{ name: "A", color: 0 }], windows: [{ team: 0, label: "", start: SUN + 7, duration: 15, repeat: { kind: "none" } }] };
    await expect(encodeTimeline(bad)).rejects.toThrow(/15/);
  });

  it("rejects links that exceed the Team and Window limits", async () => {
    const tooManyTeams: Timeline = { teams: Array.from({ length: 21 }, (_, i) => ({ name: `T${i}`, color: 0 })), windows: [] };
    expect(await decodeTimeline(await encodeTimeline(tooManyTeams))).toEqual({ ok: false, reason: "corrupt" });
    const badColor: Timeline = { teams: [{ name: "A", color: 10 }], windows: [] };
    expect(await decodeTimeline(await encodeTimeline(badColor))).toEqual({ ok: false, reason: "corrupt" });
    const noDays: Timeline = { teams: [{ name: "A", color: 0 }], windows: [{ team: 0, label: "", start: SUN, duration: 15, repeat: { kind: "weekly", days: 0 } }] };
    expect(await decodeTimeline(await encodeTimeline(noDays))).toEqual({ ok: false, reason: "corrupt" });
  });
});
