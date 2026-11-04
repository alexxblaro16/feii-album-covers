#!/usr/bin/env node
// scripts/encode-cover.mjs — PNG → two KTX2 files (ETC1S and UASTC) for one route.
//
// X9 STUB. This file fixes the interface and the failure mode; the two encode
// commands are implemented in X10 (same flags as the KTX2/Basis satellite's
// Template, checked against `toktx --help` on KTX-Software 4.4.2).
//
// Installing KTX-Software on every laptop is not a lab outcome (D9). If `toktx`
// is missing, this script stops with a loud error and an install hint; the PNG
// path still teaches the file-bytes vs GPU-bytes lesson.

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import process from 'node:process';

const USAGE = `Usage: npm run encode -- <slug> [source.png]

  <slug>        your route folder: covers/<slug>/
  [source.png]  file inside covers/<slug>/public/ (default: sleeve.png)

Writes, next to the source, in covers/<slug>/public/:
  <name>.etc1s.ktx2   ETC1S (smaller file, lossier)
  <name>.uastc.ktx2   UASTC (larger file, higher quality)
Then you choose one and explain it in covers/<slug>/docs/ktx2-note.md.

Needs \`toktx\` (KTX-Software) on PATH. It is not required on every laptop.`;

const INSTALL_HINT = `toktx not found on PATH.
Install KTX-Software (it provides toktx): https://github.com/KhronosGroup/KTX-Software/releases
  macOS: the KTX-Software .pkg from that page installs toktx into /usr/local/bin.
  Windows / Linux: the installer or archive for your platform from the same page.
Or ask a teammate / the instructor who has it to run this script for your route.
Without it, keep the PNG and say so in docs/ktx2-note.md.`;

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  console.log(USAGE);
  process.exit(args.length === 0 ? 2 : 0);
}

const probe = spawnSync('toktx', ['--version'], { encoding: 'utf8' });
if (probe.error || probe.status !== 0) {
  console.error(`ERROR: ${INSTALL_HINT}`);
  process.exit(127);
}

const [slug, source = 'sleeve.png'] = args;
const input = `covers/${slug}/public/${source}`;
if (!existsSync(input)) {
  console.error(`ERROR: ${input} does not exist.\n\n${USAGE}`);
  process.exit(1);
}

console.error(
  `NOT IMPLEMENTED: found ${(probe.stdout || probe.stderr).trim()} and ${input}, but the ETC1S/UASTC ` +
    'encode commands land in X10. Use the KTX2/Basis satellite Template by hand until then.',
);
process.exit(3);
