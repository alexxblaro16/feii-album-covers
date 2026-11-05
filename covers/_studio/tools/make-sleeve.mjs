#!/usr/bin/env node
// covers/_studio/tools/make-sleeve.mjs — paints the studio's ORIGINAL sleeve
// picture, covers/_studio/public/sleeve.png (D8: made for this repository; it
// is not an album cover and copies none).
//
//   node covers/_studio/tools/make-sleeve.mjs
//
// Needs ImageMagick 7 (`magick`) for the ground and librsvg (`rsvg-convert`)
// for the sharp layer. Every colour and position comes from ../src/palette.js,
// the same file the scene and the runtime checks read.
//
//   1. Ground: a seeded fractal, blurred, gradient-mapped and grained, so it
//      behaves like a photograph for an encoder.
//   2. Sharp layer (SVG): flat disc and grey patch (the colour check samples
//      them), four corner squares (the orientation check samples two), the
//      title, a rule, a subtitle and a UV label in each corner.
//   3. Written 8-bit RGB with every ancillary chunk stripped (no gAMA, no
//      iCCP): an untagged picture of screen colours.
//
// The fonts (DIN Alternate, Courier New) are system fonts, used only to
// rasterise this artwork. The script is a record of how the committed PNG was
// made; students never run it.

import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { PROBE, SLEEVE } from '../src/palette.js';

const OUT = fileURLToPath(new URL('../public/sleeve.png', import.meta.url));
const S = SLEEVE.size;
const M = 36; // corner square size
const PAD = 12;

function run(command, args) {
  const result = spawnSync(command, args, { stdio: ['ignore', 'inherit', 'inherit'] });
  if (result.error || result.status !== 0) {
    console.error(`make-sleeve: \`${command}\` failed or is not installed.`);
    process.exit(1);
  }
}

const work = mkdtempSync(join(tmpdir(), 'make-sleeve-'));
const ground = join(work, 'ground.png');
const svgPath = join(work, 'sleeve.svg');
const flat = join(work, 'flat.png');

// 1. Ground.
run('magick', [
  '-size', `${S}x${S}`, '-seed', '11', 'plasma:fractal',
  '-colorspace', 'gray', '-blur', '0x14', '-auto-level',
  '(', '-size', '1x3', ...SLEEVE.ground.map((c) => `xc:${c}`), '-append',
  '-filter', 'triangle', '-resize', '1x256!', ')', '-clut',
  '-attenuate', '0.18', '+noise', 'Gaussian',
  '-strip', '-depth', '8', `PNG24:${ground}`,
]);

// 2. Sharp layer over the ground.
const square = (x, y, color) => `<rect x="${x}" y="${y}" width="${M}" height="${M}" fill="${color}"/>`;
const text = (x, y, anchor, body) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" class="mono">${body}</text>`;
const near = PAD + M + 8;
const far = S - near;
const g = PROBE.grey;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <style>
    .title { font-family: 'DIN Alternate'; font-weight: bold; font-size: 54px; fill: ${SLEEVE.ink}; }
    .mono { font-family: 'Courier New'; font-weight: bold; font-size: 18px; fill: ${SLEEVE.ink}; }
    .small { font-size: 15px; }
  </style>
  <image x="0" y="0" width="${S}" height="${S}" xlink:href="data:image/png;base64,${readFileSync(ground).toString('base64')}"/>
  <circle cx="${S / 2}" cy="296" r="112" fill="${SLEEVE.disc}"/>
  <rect x="${g.x - 32}" y="${g.y - 32}" width="64" height="64" fill="${SLEEVE.grey}"/>
  ${square(PAD, PAD, SLEEVE.corner.u0v1)}
  ${square(S - PAD - M, PAD, SLEEVE.corner.u1v1)}
  ${square(PAD, S - PAD - M, SLEEVE.corner.u0v0)}
  ${square(S - PAD - M, S - PAD - M, SLEEVE.corner.u1v0)}
  <text x="${S / 2}" y="122" text-anchor="middle" class="title">${SLEEVE.title.replace('&', '&amp;')}</text>
  <rect x="96" y="140" width="${S - 192}" height="3" fill="${SLEEVE.ink}"/>
  <text x="${S / 2}" y="440" text-anchor="middle" class="mono small">${SLEEVE.subtitle}</text>
  ${text(near, PAD + 24, 'start', 'uv 0,1')}
  ${text(far, PAD + 24, 'end', 'uv 1,1')}
  ${text(near, S - PAD - 12, 'start', 'uv 0,0')}
  ${text(far, S - PAD - 12, 'end', 'uv 1,0')}
</svg>
`;
writeFileSync(svgPath, svg);
run('rsvg-convert', ['--width', String(S), '--height', String(S), '--output', flat, svgPath]);

// 3. 8-bit RGB, untagged.
run('magick', [flat, '-alpha', 'off', '-strip', '-define', 'png:exclude-chunks=all', '-depth', '8', `PNG24:${OUT}`]);
rmSync(work, { recursive: true, force: true });
console.log(`wrote ${OUT}`);
