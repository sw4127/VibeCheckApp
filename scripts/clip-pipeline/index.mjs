#!/usr/bin/env node
/**
 * Bias-pool content-ops pipeline (rt-answers-2026-07-11 §Content-ops).
 * PM only ear-confirms; this does the mechanics. Stages:
 *
 *   node scripts/clip-pipeline/index.mjs download   # fetch sources -> .cache, SHA-256 into manifest
 *   node scripts/clip-pipeline/index.mjs snapshot   # save license-proof pages -> src/content/bias/licenses/
 *   node scripts/clip-pipeline/index.mjs analyze    # propose top-2 20s windows per item (PM ear-confirms)
 *   node scripts/clip-pipeline/index.mjs render     # trim approved windows, R128 loudnorm to target LUFS,
 *                                                   # mp3 + m4a into public/audio/bias, TASL attributions
 *   # debug helpers (local files, no manifest):
 *   node scripts/clip-pipeline/index.mjs analyze --local <file> [--len 20]
 *   node scripts/clip-pipeline/index.mjs render  --local <file> --start <sec> [--len 20] [--out <id>]
 *
 * The gatekeeping tests (src/content/bias/bias.test.ts) fail the suite if any
 * non-placeholder item ships without a license snapshot + proof URL + sha256.
 */

import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const MANIFEST = join(ROOT, "src", "content", "bias", "manifest.json");
const CACHE = join(dirname(fileURLToPath(import.meta.url)), ".cache");
const LICENSES = join(ROOT, "src", "content", "bias", "licenses");
const AUDIO_OUT = join(ROOT, "public", "audio", "bias");

const FFMPEG = process.env.FFMPEG_PATH || require("ffmpeg-static");
const FFPROBE = process.env.FFPROBE_PATH || require("@ffprobe-installer/ffprobe").path;

const SR = 22050; // analysis sample rate (mono s16le)

function loadManifest() {
  return JSON.parse(readFileSync(MANIFEST, "utf8"));
}
function saveManifest(m) {
  writeFileSync(MANIFEST, JSON.stringify(m, null, 2) + "\n");
}
function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

/* ------------------------------------------------------------ download */
async function download() {
  const m = loadManifest();
  mkdirSync(CACHE, { recursive: true });
  let done = 0, skipped = 0;
  for (const item of m.items) {
    if (!item.source.downloadUrl) {
      console.log(`- ${item.id}: no downloadUrl yet (resolve from proof page first) — SKIP`);
      skipped++;
      continue;
    }
    const ext = new URL(item.source.downloadUrl).pathname.split(".").pop() || "bin";
    const dest = join(CACHE, `${item.id}.${ext}`);
    console.log(`- ${item.id}: downloading ${item.source.downloadUrl}`);
    const res = await fetch(item.source.downloadUrl, { redirect: "follow" });
    if (!res.ok) throw new Error(`${item.id}: HTTP ${res.status} from ${item.source.downloadUrl}`);
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(dest, buf);
    item.source.sha256 = sha256(buf);
    item.source.cachedFile = `${item.id}.${ext}`;
    console.log(`  saved ${dest} (${(buf.length / 1e6).toFixed(1)} MB, sha256 ${item.source.sha256.slice(0, 12)}…)`);
    done++;
  }
  saveManifest(m);
  console.log(`download: ${done} fetched, ${skipped} skipped`);
}

/* ------------------------------------------------------------ snapshot */
async function snapshot(args = []) {
  const m = loadManifest();
  mkdirSync(LICENSES, { recursive: true });
  // --only pb7,b3 : restrict to named ids so unverified proof URLs (e.g. the
  // Musopen pages pending live verification) never get a snapshot stamp that
  // could masquerade as a checked license.
  const onlyIdx = args.indexOf("--only");
  const only = onlyIdx >= 0 ? new Set(args[onlyIdx + 1].split(",")) : null;
  let done = 0, skipped = 0;
  for (const item of m.items) {
    if (only && !only.has(item.id)) continue;
    const url = item.license.proofPageUrl;
    if (!url) {
      console.log(`- ${item.id}: no proofPageUrl — SKIP`);
      skipped++;
      continue;
    }
    console.log(`- ${item.id}: snapshotting ${url}`);
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) throw new Error(`${item.id}: HTTP ${res.status} from ${url}`);
    const body = await res.text();
    const file = `${item.id}.html`;
    writeFileSync(join(LICENSES, file), `<!-- snapshot of ${url} at ${new Date().toISOString()} -->\n` + body);
    item.license.snapshotFile = file;
    item.license.confirmedAt = new Date().toISOString().slice(0, 10);
    done++;
  }
  saveManifest(m);
  console.log(`snapshot: ${done} saved, ${skipped} skipped — PM/engineer must still READ the license line in each snapshot (gatekeeping §A)`);
}

/* ------------------------------------------------------------- analyze */
function decodePcm(file) {
  // Decode to mono s16le PCM for pure-Node analysis (no stderr parsing).
  const out = spawnSync(FFMPEG, ["-i", file, "-ac", "1", "-ar", String(SR), "-f", "s16le", "-v", "error", "pipe:1"], {
    maxBuffer: 1 << 30,
  });
  if (out.status !== 0) throw new Error(`ffmpeg decode failed: ${out.stderr}`);
  const raw = out.stdout;
  const n = Math.floor(raw.length / 2);
  const samples = new Float32Array(n);
  for (let i = 0; i < n; i++) samples[i] = raw.readInt16LE(i * 2) / 32768;
  return samples;
}

/**
 * Window scoring: 0.5s frames -> RMS series. A candidate window must start
 * after the lead-in silence and end before the final 10% (no fades), and is
 * scored by mean energy + RMS variance + onset density (jumps > 6dB between
 * frames ~ phrase onsets). Top-2 non-overlapping windows win.
 */
function suggestWindows(samples, clipSec) {
  const frame = Math.floor(SR * 0.5);
  const frames = Math.floor(samples.length / frame);
  const rms = [];
  for (let f = 0; f < frames; f++) {
    let acc = 0;
    for (let i = f * frame; i < (f + 1) * frame; i++) acc += samples[i] * samples[i];
    rms.push(Math.sqrt(acc / frame));
  }
  const db = rms.map((v) => 20 * Math.log10(v + 1e-9));
  const totalSec = frames * 0.5;
  // Lead-in silence: first frame above -35 dBFS.
  let startFrame = db.findIndex((v) => v > -35);
  if (startFrame < 0) startFrame = 0;
  const lastAllowedSec = totalSec * 0.9 - clipSec;
  const winFrames = clipSec * 2;
  const candidates = [];
  for (let s = startFrame; s * 0.5 <= lastAllowedSec; s++) {
    const seg = db.slice(s, s + winFrames);
    if (seg.length < winFrames) break;
    const mean = seg.reduce((a, b) => a + b, 0) / seg.length;
    const variance = seg.reduce((a, b) => a + (b - mean) ** 2, 0) / seg.length;
    let onsets = 0;
    for (let i = 1; i < seg.length; i++) if (seg[i] - seg[i - 1] > 6) onsets++;
    // Weighted score: audible (mean), dynamic (variance), phrase-y (onsets).
    const score = mean * 0.4 + Math.sqrt(variance) * 6 + onsets * 3;
    candidates.push({ startSec: s * 0.5, score: Math.round(score * 10) / 10, onsets });
  }
  candidates.sort((a, b) => b.score - a.score);
  const picked = [];
  for (const c of candidates) {
    if (picked.every((p) => Math.abs(p.startSec - c.startSec) >= clipSec / 2)) picked.push(c);
    if (picked.length === 2) break;
  }
  return picked.map((p) => ({ startSec: p.startSec, endSec: p.startSec + clipSec, score: p.score, onsets: p.onsets }));
}

function analyze(args) {
  const localIdx = args.indexOf("--local");
  const lenIdx = args.indexOf("--len");
  const clipSec = lenIdx >= 0 ? Number(args[lenIdx + 1]) : loadManifest().clipSeconds;
  if (localIdx >= 0) {
    const file = args[localIdx + 1];
    const s = suggestWindows(decodePcm(file), clipSec);
    console.log(`analyze --local ${file} (window ${clipSec}s):`);
    for (const w of s) console.log(`  suggest ${w.startSec}s → ${w.endSec}s  (score ${w.score}, onsets ${w.onsets})`);
    return;
  }
  const m = loadManifest();
  for (const item of m.items) {
    if (!item.source.cachedFile) {
      console.log(`- ${item.id}: not downloaded — SKIP`);
      continue;
    }
    const s = suggestWindows(decodePcm(join(CACHE, item.source.cachedFile)), m.clipSeconds);
    item.window.suggestions = s;
    console.log(`- ${item.id}: ${s.map((w) => `${w.startSec}s→${w.endSec}s (score ${w.score})`).join("  |  ")}`);
  }
  saveManifest(m);
  console.log("analyze: suggestions written — PM ear-confirms and sets window.approved = {startSec} per item");
}

/* -------------------------------------------------------------- render */
function tasl(item) {
  // TASL: Title, Author, Source, License — plus the excerpt notice (CC BY).
  const src = item.license.proofPageUrl || item.source.pageUrl || "";
  return `"${item.title}" — ${item.composerOrArtist}${item.performer && item.performer !== item.composerOrArtist ? `, perf. ${item.performer}` : ""} · ${src} · ${item.license.expected} · excerpt (trimmed + loudness-normalized)`;
}

function renderOne(input, startSec, lenSec, outBase, lufs) {
  mkdirSync(AUDIO_OUT, { recursive: true });
  const common = ["-ss", String(startSec), "-t", String(lenSec), "-i", input, "-af", `loudnorm=I=${lufs}:TP=-1.5:LRA=11`, "-ar", "44100", "-v", "error", "-y"];
  execFileSync(FFMPEG, [...common, "-codec:a", "libmp3lame", "-q:a", "3", join(AUDIO_OUT, `${outBase}.mp3`)]);
  execFileSync(FFMPEG, [...common, "-codec:a", "aac", "-b:a", "160k", join(AUDIO_OUT, `${outBase}.m4a`)]);
  const probe = execFileSync(FFPROBE, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", join(AUDIO_OUT, `${outBase}.mp3`)]).toString().trim();
  return { mp3: `${outBase}.mp3`, m4a: `${outBase}.m4a`, durationSec: Number(probe) };
}

function render(args) {
  const localIdx = args.indexOf("--local");
  if (localIdx >= 0) {
    const file = args[localIdx + 1];
    const start = Number(args[args.indexOf("--start") + 1] || 0);
    const lenIdx = args.indexOf("--len");
    const len = lenIdx >= 0 ? Number(args[lenIdx + 1]) : 20;
    const outIdx = args.indexOf("--out");
    const out = outIdx >= 0 ? args[outIdx + 1] : "local-test";
    const r = renderOne(file, start, len, out, loadManifest().lufsTarget);
    console.log(`render --local: wrote public/audio/bias/${r.mp3} + ${r.m4a} (${r.durationSec.toFixed(2)}s @ ${loadManifest().lufsTarget} LUFS)`);
    return;
  }
  const m = loadManifest();
  for (const item of m.items) {
    if (!item.source.cachedFile || !item.window.approved) {
      console.log(`- ${item.id}: needs cachedFile + PM-approved window — SKIP`);
      continue;
    }
    const r = renderOne(join(CACHE, item.source.cachedFile), item.window.approved.startSec, m.clipSeconds, item.id, m.lufsTarget);
    item.render = { ...r, renderedAt: new Date().toISOString().slice(0, 10), attribution: tasl(item) };
    console.log(`- ${item.id}: ${r.mp3} + ${r.m4a} · attribution: ${item.render.attribution}`);
  }
  saveManifest(m);
  console.log("render: done — wire items.ts from manifest.render + bump BIAS_POOL_VERSION");
}

/* ---------------------------------------------------------------- main */
const [stage, ...args] = process.argv.slice(2);
try {
  if (stage === "download") await download();
  else if (stage === "snapshot") await snapshot(args);
  else if (stage === "analyze") analyze(args);
  else if (stage === "render") render(args);
  else {
    console.log("usage: node scripts/clip-pipeline/index.mjs <download|snapshot|analyze|render> [--local <file>] [--start N] [--len N] [--out id]");
    process.exit(2);
  }
} catch (e) {
  console.error(`clip-pipeline ${stage} FAILED:`, e.message);
  process.exit(1);
}
