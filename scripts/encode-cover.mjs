#!/usr/bin/env node
// scripts/encode-cover.mjs — one source PNG → two KTX2 files (ETC1S and UASTC)
// for one route, with the same two commands the KTX2/Basis satellite teaches
// (flags checked against `toktx --help`, KTX-Software 4.4.2).
//
//   npm run encode -- <slug> [source.png]
//
// What it does, in order, and how it fails:
//   1. `toktx` missing            → exit 127 with an install hint. Installing
//      KTX-Software on every laptop is not a lab outcome (D9): keep the PNG and
//      say so in docs/ktx2-note.md. Never commit a fake .ktx2.
//   2. Source checks (PNG chunks, read here, no extra package):
//      - not a PNG                → exit 1;
//      - an ICC profile that is not sRGB (phone photos: Display P3) → exit 4.
//        `--assign_oetf srgb` only RELABELS; on an unconverted P3 photo the
//        sleeve comes out muted while texture.colorSpace still logs 'srgb'.
//        Convert the picture to sRGB in an image editor first. Pass
//        --relabel-anyway only if you have decided the muted result is fine.
//      - not square, or a side not a multiple of 4 → a warning (UV runs 0–1 on
//        both axes, so a non-square picture stretches).
//   3. Two encodes, flags as arrays (no shell):
//      - ETC1S: --t2 --encode etc1s --genmipmap --lower_left_maps_to_s0t0 --assign_oetf srgb
//      - UASTC: --t2 --encode uastc --zcmp 18 --genmipmap --lower_left_maps_to_s0t0 --assign_oetf srgb
//      --lower_left_maps_to_s0t0 flips the rows: three.js does not flip a packed
//      texture on upload, so an unflipped file lands upside down.
//      --assign_oetf srgb labels the pixels as the screen colours they are. The
//      convert flag is never used: it trusts a wrong tag and rewrites the pixels
//      (X8 cold review S1). --zcmp is UASTC only: toktx rejects it for ETC1S,
//      which is already supercompressed.
//   4. Verification with `ktx info` on each output: it must validate, show
//      `Transfer: KHR_DF_TRANSFER_SRGB` and `KTXorientation: ru`. Anything else
//      → the output is deleted and the script exits 5. (`ru` is proof of the
//      flip for toktx only: if `ktx create` ever replaces toktx here, the flip
//      flag is --convert-texcoord-origin bottom-left, and the UV-labelled
//      picture in the studio switch stays the proof.)

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';
import process from 'node:process';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

const USAGE = `Usage: npm run encode -- <slug> [source.png] [--relabel-anyway]

  <slug>        your route folder: covers/<slug>/
  [source.png]  a PNG inside covers/<slug>/public/ (default: sleeve.png)

Writes, next to the source, in covers/<slug>/public/:
  <name>-etc1s.ktx2   ETC1S (smaller file, lossier)
  <name>-uastc.ktx2   UASTC (larger file, cleaner; zstd-packed on disk)
Both are flipped for three.js (--lower_left_maps_to_s0t0), labelled sRGB
(--assign_oetf srgb), with mipmaps (--genmipmap), and checked with \`ktx info\`.
Then choose one and explain it in covers/<slug>/docs/ktx2-note.md, with file
bytes AND computed GPU bytes for the PNG and both modes.

Needs \`toktx\` and \`ktx\` (KTX-Software 4.4.2) on PATH. Not required on every laptop.`;

const INSTALL_HINT = `toktx not found on PATH.
Install KTX-Software 4.4.2 (it provides toktx and ktx): https://github.com/KhronosGroup/KTX-Software/releases
  macOS: the KTX-Software .pkg from that page installs toktx and ktx into /usr/local/bin.
  Windows / Linux: the installer or archive for your platform from the same page.
Or ask a teammate / the instructor who has it to run this script for your route.
Without it, keep the PNG and say so in docs/ktx2-note.md ("encoder skip — toktx missing").
Never commit a .ktx2 you did not encode.`;

/** Flags shared by both modes, in the order the lesson prints them. */
const SHARED = ['--genmipmap', '--lower_left_maps_to_s0t0', '--assign_oetf', 'srgb'];

/** The two modes. `--zcmp` is UASTC-only (toktx refuses it with ETC1S). */
const MODES = [
  { name: 'etc1s', args: ['--t2', '--encode', 'etc1s', ...SHARED] },
  { name: 'uastc', args: ['--t2', '--encode', 'uastc', '--zcmp', '18', ...SHARED] },
];

const argv = process.argv.slice(2);
const relabelAnyway = argv.includes('--relabel-anyway');
const args = argv.filter((arg) => arg !== '--relabel-anyway');

if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  console.log(USAGE);
  process.exit(args.length === 0 ? 2 : 0);
}

// 1. Encoder present?
const toktxVersion = probe('toktx');
if (!toktxVersion) {
  console.error(`ERROR: ${INSTALL_HINT}`);
  process.exit(127);
}
const ktxVersion = probe('ktx');
if (!ktxVersion) {
  console.error('ERROR: `ktx` (KTX-Software, same package as toktx) not found on PATH; it is needed to verify the output.');
  process.exit(127);
}

const [slug, source = 'sleeve.png'] = args;
const publicDir = join(ROOT, 'covers', slug ?? '', 'public');
const input = join(publicDir, source);
if (!slug || !existsSync(input)) {
  console.error(`ERROR: ${relative(ROOT, input)} does not exist.\n\n${USAGE}`);
  process.exit(1);
}

// 2. Source checks.
const png = readPng(input);
if (!png) {
  console.error(`ERROR: ${relative(ROOT, input)} is not a PNG. Export your sleeve as an 8-bit sRGB PNG first.`);
  process.exit(1);
}
if (png.icc && !png.icc.isSrgb) {
  const banner = '!'.repeat(72);
  console.error(
    `${banner}\n` +
      `${relative(ROOT, input)} carries a NON-sRGB colour profile: "${png.icc.name}"${png.icc.description ? ` (${png.icc.description})` : ''}.\n` +
      'A sleeve picture must hold sRGB screen colours. --assign_oetf srgb only relabels, so this\n' +
      'picture would come out MUTED, and texture.colorSpace would still log "srgb".\n' +
      'Convert it to sRGB in your image editor (Export / Convert to profile: sRGB), then run again.\n' +
      `${banner}`,
  );
  if (!relabelAnyway) process.exit(4);
  console.error('--relabel-anyway given: encoding anyway. Say so in docs/ktx2-note.md.');
}
if (png.icc?.isSrgb) console.log(`note: sRGB ICC profile "${png.icc.name}" found; --assign_oetf srgb lets toktx accept it.`);
if (png.gamma !== null && Math.abs(png.gamma - 45455) > 5) {
  console.log(`note: the PNG's gAMA chunk says ${png.gamma / 100000}; a sleeve holds screen colours, so --assign_oetf srgb relabels it as sRGB.`);
}
if (png.width !== png.height || png.width % 4 || png.height % 4) {
  console.warn(
    `WARNING: ${png.width}×${png.height}. A sleeve source should be square, each side a multiple of 4 ` +
      '(UV runs 0–1 on both axes; a non-square picture stretches).',
  );
}

// 3. Encode, 4. verify.
console.log(`${toktxVersion} · ${ktxVersion}`);
console.log(`source  ${relative(ROOT, input)}  ${statSync(input).size} bytes (file bytes, the suitcase)`);
const stem = basename(source, extname(source));
for (const mode of MODES) {
  const output = join(publicDir, `${stem}-${mode.name}.ktx2`);
  const command = ['toktx', ...mode.args, output, input];
  console.log(`\n$ ${command.map((part) => relative(ROOT, part) || part).join(' ')}`);
  const encode = spawnSync(command[0], command.slice(1), { encoding: 'utf8' });
  if (encode.stdout) process.stdout.write(encode.stdout);
  if (encode.stderr) process.stderr.write(encode.stderr);
  if (encode.error || encode.status !== 0) {
    console.error(`ERROR: toktx (${mode.name}) exited ${encode.status ?? encode.error?.message}.`);
    rmSync(output, { force: true });
    process.exit(5);
  }

  const info = spawnSync('ktx', ['info', output], { encoding: 'utf8' });
  const text = `${info.stdout ?? ''}${info.stderr ?? ''}`;
  const checks = [
    ['ktx info validates the file', info.status === 0],
    ['Transfer: KHR_DF_TRANSFER_SRGB', /^Transfer: KHR_DF_TRANSFER_SRGB$/m.test(text)],
    ['KTXorientation: ru', /^KTXorientation: ru$/m.test(text)],
  ];
  for (const [label, ok] of checks) console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label}`);
  if (checks.some(([, ok]) => !ok)) {
    console.error(`ERROR: ${relative(ROOT, output)} failed verification; deleted. Full \`ktx info\` output:\n${text}`);
    rmSync(output, { force: true });
    process.exit(5);
  }
  console.log(`  ${relative(ROOT, output)}  ${statSync(output).size} bytes (file bytes, the suitcase)`);
}

console.log(
  '\nNext: open your route, switch PNG / ETC1S / UASTC, read the GPU bytes (the room) and texture.format,\n' +
    'check orientation (uv 0,0 bottom-left) and colorSpace (srgb), then fill docs/ktx2-note.md.',
);

// --- helpers -----------------------------------------------------------------

/**
 * `<tool> --version` as one line, or null when the tool is not on PATH.
 *
 * @param {string} tool
 * @returns {string | null}
 */
function probe(tool) {
  const result = spawnSync(tool, ['--version'], { encoding: 'utf8' });
  if (result.error || result.status !== 0) return null;
  return `${result.stdout || result.stderr}`.trim().split('\n')[0];
}

/**
 * Reads the PNG header chunks this script cares about. Returns null if the
 * file is not a PNG.
 *
 * @param {string} file
 * @returns {{ width: number, height: number, gamma: number | null,
 *   icc: { name: string, description: string, isSrgb: boolean } | null } | null}
 */
function readPng(file) {
  const data = readFileSync(file);
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (data.length < 33 || !data.subarray(0, 8).equals(signature)) return null;
  const out = { width: data.readUInt32BE(16), height: data.readUInt32BE(20), gamma: null, icc: null };
  let at = 8;
  while (at + 8 <= data.length) {
    const length = data.readUInt32BE(at);
    const type = data.toString('latin1', at + 4, at + 8);
    const body = data.subarray(at + 8, at + 8 + length);
    if (type === 'gAMA' && length === 4) out.gamma = body.readUInt32BE(0);
    if (type === 'iCCP') out.icc = readIcc(body);
    if (type === 'IDAT' || type === 'IEND') break;
    at += 12 + length;
  }
  return out;
}

/**
 * iCCP chunk → profile name, its `desc` text when readable, and whether it is
 * an sRGB profile (by name or description).
 *
 * @param {Buffer} body
 * @returns {{ name: string, description: string, isSrgb: boolean }}
 */
function readIcc(body) {
  const nul = body.indexOf(0);
  const name = body.toString('latin1', 0, Math.max(nul, 0));
  let description = '';
  try {
    const profile = inflateSync(body.subarray(nul + 2));
    // Profile descriptions are plain or UTF-16 text; strip the zero bytes and look for words.
    const flat = profile.toString('latin1').replace(/\0/g, '');
    const match = /(Display P3|sRGB[^\n\r]{0,40}|Adobe RGB[^\n\r]{0,20}|ProPhoto[^\n\r]{0,20}|P3[^\n\r]{0,20})/.exec(flat);
    description = match ? match[1].replace(/[^\x20-\x7e]/g, '').trim() : '';
  } catch {
    description = '';
  }
  const isSrgb = /srgb/i.test(name) || (/^srgb/i.test(description) && !/p3/i.test(name));
  return { name, description, isSrgb };
}
