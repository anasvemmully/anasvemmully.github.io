// Records the Window Timeline tutorial video (public/videos/timeline-tutorial.webm + poster).
// Run from a folder with playwright installed: REPO=<repo> FRAG=<repo>/scripts/timeline-tour-sample.txt node record-timeline-tour.mjs
// Needs the dev server on localhost:3000 and ffmpeg.

// Scripted, screen-recorded tour of the Window Timeline tool.
//
//   node tour.mjs                 # record + encode into <repo>/public/videos/
//   BASE=http://localhost:3000 REPO=/path/to/repo node tour.mjs
//   STEPS=viewer,zoom node tour.mjs   # run only some steps (for debugging; no encode)
//
// The tour is a list of named STEPS (see bottom). Each step is an async fn(ctx).
// To add a feature (freeze bands, avatars, GitHub links, conflicts panel, .ics…),
// write a new step function and insert its name in TOUR at the right place.

import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE ?? 'http://localhost:3000';
const REPO = process.env.REPO ?? '/Volumes/couch/Hobby/anasvemmully.github.io';
const FRAG = (process.env.FRAG ?? fs.readFileSync(path.join(HERE, '..', 'frag-rich.txt'), 'utf8')).trim();
const FFMPEG = process.env.FFMPEG ?? '/opt/homebrew/bin/ffmpeg';
const OUT_DIR = path.join(REPO, 'public', 'videos');
const RAW_DIR = path.join(HERE, 'raw');
const W = 1440, H = 900;

// ---------------------------------------------------------------------------
// Overlay: fake cursor + caption pill. Injected on every document.
// ---------------------------------------------------------------------------
const OVERLAY = () => {
  const css = `
    nextjs-portal, [data-nextjs-toast], #__next-build-watcher { display: none !important; }
    #tour-cursor { position: fixed; z-index: 2147483647; left: 0; top: 0; width: 26px; height: 26px;
      margin: -13px 0 0 -13px; border-radius: 50%; pointer-events: none; display: none;
      background: rgba(255, 214, 0, .35); border: 2.5px solid #111; box-shadow: 0 2px 6px rgba(0,0,0,.25);
      transition: transform .12s ease, background .12s ease; }
    #tour-cursor::after { content: ''; position: absolute; left: 50%; top: 50%; width: 6px; height: 6px;
      margin: -3px 0 0 -3px; border-radius: 50%; background: #111; }
    #tour-cursor.down { transform: scale(.75); background: rgba(255, 214, 0, .9); }
    #tour-caption { position: fixed; z-index: 2147483646; left: 28px; bottom: 28px; max-width: 760px;
      pointer-events: none; padding: 14px 24px 15px; border-radius: 999px; background: #111; color: #fff;
      font: 700 26px/1.2 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; letter-spacing: -.01em;
      box-shadow: 4px 4px 0 #ffd600; opacity: 0; transform: translateY(12px);
      transition: opacity .35s ease, transform .35s ease; }
    #tour-caption.on { opacity: 1; transform: none; }
    #tour-caption small { display: block; margin-top: 4px; font: 500 15px/1.3 ui-monospace, Menlo, monospace;
      color: #ffd600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 700px; }
    #tour-caption .n { display: inline-block; margin-right: 12px; color: #ffd600; }
  `;
  const mount = () => {
    if (document.getElementById('tour-cursor')) return;
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    const c = document.createElement('div'); c.id = 'tour-cursor'; document.body.appendChild(c);
    const cap = document.createElement('div'); cap.id = 'tour-caption'; document.body.appendChild(cap);
    const last = sessionStorage.getItem('tour-xy');
    if (last) { const [x, y] = JSON.parse(last); Object.assign(c.style, { left: x + 'px', top: y + 'px', display: 'block' }); }
    addEventListener('mousemove', (e) => {
      c.style.display = 'block'; c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px';
      try { sessionStorage.setItem('tour-xy', JSON.stringify([e.clientX, e.clientY])); } catch {}
    }, true);
    addEventListener('mousedown', () => c.classList.add('down'), true);
    addEventListener('mouseup', () => c.classList.remove('down'), true);
    window.__caption = (text, sub, n) => {
      if (!text) { cap.classList.remove('on'); return; }
      cap.classList.remove('on');
      setTimeout(() => {
        cap.innerHTML = '';
        if (n) { const s = document.createElement('span'); s.className = 'n'; s.textContent = n; cap.appendChild(s); }
        cap.appendChild(document.createTextNode(text));
        if (sub) { const s = document.createElement('small'); s.textContent = sub; cap.appendChild(s); }
        cap.classList.add('on');
      }, 180);
    };
    window.__overlay = (on) => { c.style.visibility = cap.style.visibility = on ? 'visible' : 'hidden'; };
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function helpers(page, t0) {
  const pos = { x: W / 2, y: H / 2 };
  let stepNo = 0;
  const h = {
    page, pos,
    pause: (ms = 1000) => sleep(ms),
    /** Smooth cursor move (~60 fps), duration scales with distance. */
    async move(x, y, ms) {
      const d = Math.hypot(x - pos.x, y - pos.y);
      ms ??= Math.min(900, Math.max(250, d * 1.1));
      const steps = Math.max(2, Math.round(ms / 16));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps, e = t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2; // easeInOutQuad
        await page.mouse.move(pos.x + (x - pos.x) * e, pos.y + (y - pos.y) * e);
        await sleep(16);
      }
      pos.x = x; pos.y = y;
    },
    async center(locator) {
      const b = await locator.boundingBox();
      if (!b) throw new Error('no box for ' + locator);
      return { x: b.x + b.width / 2, y: b.y + b.height / 2, box: b };
    },
    async moveTo(locator, ms) { const c = await h.center(locator); await h.move(c.x, c.y, ms); return c; },
    async click(locator, { before = 250, after = 600 } = {}) {
      await h.moveTo(locator);
      await sleep(before);
      await page.mouse.down(); await sleep(90); await page.mouse.up();
      await sleep(after);
    },
    /** Press at the current position, glide to (x,y), release. */
    async drag(x0, y0, x1, y1, ms = 900) {
      await h.move(x0, y0);
      await sleep(250);
      await page.mouse.down();
      await sleep(120);
      await h.move(x1, y1, ms);
      await sleep(200);
      await page.mouse.up();
    },
    async type(text, delay = 70) { await page.keyboard.type(text, { delay }); },
    /** Smooth Ctrl+wheel zoom at the cursor: total deltaY split into small ticks. */
    async zoom(totalDeltaY, ticks = 10) {
      await page.keyboard.down('Control');
      for (let i = 0; i < ticks; i++) { await page.mouse.wheel(0, totalDeltaY / ticks); await sleep(45); }
      await page.keyboard.up('Control');
    },
    async shiftPan(totalDelta, ticks = 12) {
      await page.keyboard.down('Shift');
      for (let i = 0; i < ticks; i++) { await page.mouse.wheel(0, totalDelta / ticks); await sleep(40); }
      await page.keyboard.up('Shift');
    },
    async caption(text, sub) {
      stepNo += text ? 1 : 0;
      await page.evaluate(([t, s]) => window.__caption?.(t, s), [text, sub]);
      await sleep(450);
    },
    async goto(url) {
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => !!window.__caption);
      h.firstVisible ??= (Date.now() - t0) / 1000;
      await sleep(400);
    },
    lane: (i) => page.locator(`[data-lane="${i}"]`),
    freeze: () => page.locator('div[class*="border-sky-700"]').first(),
  };
  return h;
}

// ---------------------------------------------------------------------------
// Steps. Each takes the helper bag `t`. Keep them small and independent-ish.
// ---------------------------------------------------------------------------
const STEPS = {
  async editorIntro(t) {
    await t.goto(`${BASE}/timeline`);
    await t.move(W * 0.55, H * 0.45, 10);
    await t.caption('Window Timeline — plan windows across teams');
    await t.pause(1100);
    // Full-width chart: hide the side panel.
    await t.click(t.page.getByRole('button', { name: 'Hide panel' }), { after: 700 });
  },

  async addTeams(t) {
    await t.caption('Add a team — type a name, press Enter');
    const input = t.page.getByPlaceholder('+ Add team');
    await t.click(input, { after: 300 });
    for (const name of ['Payments', 'Search', 'Platform']) {
      await t.type(name, 85);
      await t.pause(350);
      await t.page.keyboard.press('Enter');
      await t.pause(650);
    }
    await t.pause(500);
    await t.page.evaluate(() => document.activeElement?.blur());
  },

  async zoomEditor(t) {
    await t.caption('Pinch or Ctrl + scroll to zoom in on a day');
    const b = (await t.lane(1).boundingBox());
    // Aim at Tuesday midday in the default Mon–Sun week.
    await t.move(b.x + b.width * (1.55 / 7), b.y + b.height / 2);
    await t.pause(400);
    await t.zoom(-160, 16);
    await t.pause(1000);
  },

  async createWindows(t) {
    await t.caption('Drag on an empty lane to create a window');
    const plan = [
      { lane: 0, from: 0.24, to: 0.40, label: 'Deploy' },
      { lane: 1, from: 0.56, to: 0.72, label: 'DB migration' },
      { lane: 2, from: 0.66, to: 0.86, label: 'Kernel patch' },
    ];
    for (const [k, w] of plan.entries()) {
      const b = await t.lane(w.lane).boundingBox();
      const y = b.y + 20;
      await t.drag(b.x + b.width * w.from, y, b.x + b.width * w.to, y, 1000);
      await t.pause(450);
      if (k === 0) await t.caption('…then type a label and press Enter');
      await t.type(w.label, 80);
      await t.pause(300);
      await t.page.keyboard.press('Enter');
      await t.pause(800);
      if (k === 0) await t.caption('Drag on an empty lane to create a window');
    }
  },

  async moveBar(t) {
    await t.caption('Drag a bar to move it — overlaps are tinted red');
    const bar = t.lane(1).locator('[data-bar]').first();
    const c = await t.center(bar);
    const lane = await t.lane(1).boundingBox();
    await t.drag(c.x, c.y, c.x - lane.width * 0.20, c.y, 1200);
    await t.pause(1600);
  },

  async share(t) {
    await t.caption('Copy the share link — the whole timeline lives in the URL');
    await t.click(t.page.getByRole('button', { name: /copy share link/i }), { after: 300 });
    // Show the link that was actually copied (falls back to the editor URL).
    const url = (await t.page.evaluate(() => navigator.clipboard.readText().catch(() => location.href))).replace(/^https?:\/\//, '');
    await t.caption('Copy the share link — the whole timeline lives in the URL', url.length > 80 ? url.slice(0, 80) + '…' : url);
    await t.pause(2200);
  },

  async viewer(t) {
    await t.caption('');
    await t.goto(`${BASE}/timeline?view=1#${FRAG}`);
    await t.page.waitForFunction(() => [...document.images].every((i) => i.complete));
    await t.caption('Anyone with the link gets a read-only view');
    await t.move(W * 0.5, H * 0.55);
    await t.pause(1600);
  },

  async zoomViewer(t) {
    await t.caption('Pinch or Ctrl + scroll to zoom — detail appears as you go');
    // Zoom on the freeze band (hatched blue).
    const f = await t.center(t.freeze());
    const lane = await t.lane(0).boundingBox();
    await t.move(f.x, lane.y + 170);
    await t.pause(300);
    await t.zoom(-200, 20);
    await t.pause(1100);
    await t.zoom(200, 14);
    await t.pause(700);
  },

  async pan(t) {
    await t.caption('Drag the background (or Shift + scroll) to pan');
    const b = await t.lane(5).boundingBox(); // empty "Security" lane
    const y = b.y + b.height / 2;
    await t.drag(b.x + b.width * 0.7, y, b.x + b.width * 0.4, y, 1100);
    await t.pause(400);
    await t.drag(b.x + b.width * 0.4, y, b.x + b.width * 0.7, y, 1000);
    await t.pause(500);
  },

  async freezeBand(t) {
    await t.caption('Freezes are hatched across every lane');
    const f = await t.center(t.freeze());
    await t.move(f.x, f.box.y + 52); // the "❄ label" tag on the axis
    await t.pause(1500);
  },

  async conflicts(t) {
    await t.caption('Red dots mark conflicts — open the list and jump to one');
    await t.click(t.page.getByRole('button', { name: /\d+ conflicts?/ }), { after: 1200 });
    const list = t.page.locator('aside[aria-label="Conflicts"] li button');
    let item = list.filter({ hasText: /Prod deploy window runs in/ }).first();
    if (!(await item.count())) item = list.filter({ hasText: 'Inside a freeze' }).first();
    await item.scrollIntoViewIfNeeded();
    await t.moveTo(item, 700);
    await t.pause(500);
    await t.click(item, { before: 100, after: 1600 });
  },

  async details(t) {
    await t.caption('Click a window for details — assignees, GitHub link, service');
    // A bar inside the freeze band, preferring one with avatars.
    const band = await t.freeze().boundingBox();
    const lane = await t.lane(0).boundingBox(); // visible plot area (left of any open side panel)
    const bars = await t.page.locator('[data-bar]').all();
    let best = null, score = -1;
    for (const bar of bars) {
      const b = await bar.boundingBox();
      if (!b || b.x < lane.x || b.x + b.width > lane.x + lane.width) continue;
      const cx = b.x + b.width / 2;
      const inFreeze = band && cx > band.x && cx < band.x + band.width;
      const s = (inFreeze ? 1e6 : 0) + (await bar.locator('img').count()) * 1e4 + b.width;
      if (s > score) { best = bar; score = s; }
    }
    await t.click(best, { after: 1800 });
    await t.move(W * 0.5, H * 0.82);
    await t.pause(900);
  },

  async byPerson(t) {
    await t.caption('Switch lanes to “By person” to spot double-bookings');
    await t.click(t.page.getByRole('button', { name: 'By person' }), { after: 2200 });
    await t.click(t.page.getByRole('button', { name: 'By team' }), { after: 700 });
  },

  async zone(t) {
    await t.caption('Toggle between local time and UTC');
    const badge = t.page.locator('button[title^="Toggle between"]');
    await t.click(badge, { after: 1600 });
    await t.click(badge, { after: 800 });
  },

  async ics(t) {
    await t.caption('Export every window to your calendar with .ics');
    await t.moveTo(t.page.getByRole('button', { name: '.ics' }));
    await t.pause(1800);
  },

  async poster(t) {
    // Clean still for the <video poster>: hide overlay, keep detail pane.
    await t.page.evaluate(() => window.__overlay(false));
    await t.page.screenshot({ path: path.join(OUT_DIR, 'timeline-tutorial-poster.png') });
    await t.page.evaluate(() => window.__overlay(true));
  },

  async outro(t) {
    await t.click(t.page.getByRole('button', { name: 'Today' }), { after: 400 });
    await t.caption('Plan windows, spot clashes, share one link.');
    await t.move(W * 0.6, H * 0.5, 900);
    await t.pause(1800);
  },
};

const TOUR = [
  // Editor
  'editorIntro', 'addTeams', 'zoomEditor', 'createWindows', 'moveBar', 'share',
  // Viewer (rich sample: people, GitHub refs, services, a freeze)
  'viewer', 'zoomViewer', 'pan', 'freezeBand', 'conflicts', 'details', 'poster',
  'byPerson', 'zone', 'ics', 'outro',
];

// ---------------------------------------------------------------------------
async function main() {
  const only = process.env.STEPS?.split(',');
  const steps = only ?? TOUR;
  fs.rmSync(RAW_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: W, height: H }, deviceScaleFactor: 1,
    recordVideo: { dir: RAW_DIR, size: { width: W, height: H } },
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const t0 = Date.now();
  await context.addInitScript(OVERLAY);
  const page = await context.newPage();
  page.on('dialog', (d) => d.dismiss());
  const t = helpers(page, t0);

  const marks = [];
  for (const name of steps) {
    if (!STEPS[name]) throw new Error('unknown step ' + name);
    const s = (Date.now() - t0) / 1000;
    marks.push([name, s]);
    console.log(`${s.toFixed(1).padStart(6)}s  ${name}`);
    await STEPS[name](t);
  }
  const total = (Date.now() - t0) / 1000;
  const video = page.video();
  await context.close();
  await browser.close();
  const raw = await video.path();
  fs.writeFileSync(path.join(HERE, 'timing.json'), JSON.stringify({ marks, total, raw, firstVisible: t.firstVisible }, null, 2));
  console.log('raw video', raw, 'total', total.toFixed(1) + 's');
  if (only) return;

  // Trim the blank lead-in: start just after the first page finished loading.
  const trim = (t.firstVisible + 0.1).toFixed(2);
  const out = path.join(OUT_DIR, 'timeline-tutorial.webm');
  execFileSync(FFMPEG, ['-y', '-ss', trim, '-i', raw, '-an', '-r', '30',
    '-c:v', 'libvpx-vp9', '-crf', process.env.CRF ?? '34', '-b:v', '0', '-row-mt', '1',
    '-deadline', 'good', '-cpu-used', '2', '-pix_fmt', 'yuv420p', out], { stdio: 'inherit' });
  console.log('wrote', out, (fs.statSync(out).size / 1e6).toFixed(2) + ' MB');
}

main().catch((e) => { console.error(e); process.exit(1); });
