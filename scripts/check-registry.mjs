#!/usr/bin/env node
// scripts/check-registry.mjs — runs inside `npm run lint` (and so in CI).
//
// Checks covers/registry.json against the schema every route relies on:
//   - a JSON array of { slug, title, authors, concept, thumbnail, tags, readiness };
//     (X15: former `album` field folds into title + concept — see CONTRIBUTING.md)
//   - slug is lowercase kebab-case (only the instructor's `_studio` may start
//     with an underscore), unique, and never `_template`;
//   - covers/<slug>/src/Route.jsx exists for every slug (D26 complete endpoint);
//   - the array is sorted by slug, so two teams' task1 PRs add lines in
//     different places and a registry.json conflict stays trivial to resolve.
//
// It also guards Route contract item 3 (CONTRIBUTING.md): React Three Fiber's
// `extend({ Key: Class })` writes Key into ONE catalogue shared by every route.
// If two routes register the same key, whichever chunk loaded last wins, and the
// other route silently renders the wrong material. So every `extend({ … })` key
// under covers/<folder>/src/** must be unique across folders, and must not
// shadow a three.js export (the Canvas re-registers those on every mount).
// The component form, `const Sleeve = extend(SleeveShader)`, gets a fresh
// generated key from R3F and cannot collide, so it is not checked.
// covers/_template/ is never a route and is skipped.
//
// It does not check who changed what; CODEOWNERS and the human review do that.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import * as THREE from 'three';

const PATH = 'covers/registry.json';
const SLUG = /^(?:_studio|_fixture-[a-z0-9]+(?:-[a-z0-9]+)*|[a-z0-9]+(?:-[a-z0-9]+)*)$/;
const FIELDS = ['slug', 'title', 'authors', 'concept', 'thumbnail', 'tags', 'readiness'];
const READINESS = new Set(['wip', 'ready', 'reference', 'demo']);
const errors = [];

let registry;
try {
  registry = JSON.parse(readFileSync(PATH, 'utf8'));
} catch (error) {
  console.error(`${PATH}: not valid JSON — ${error.message}`);
  process.exit(1);
}

if (!Array.isArray(registry)) {
  console.error(`${PATH}: must be a JSON array of cover objects.`);
  process.exit(1);
}

const seen = new Set();
registry.forEach((entry, index) => {
  const at = `${PATH}[${index}]`;
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    errors.push(`${at}: must be an object.`);
    return;
  }
  const { slug, title, authors, concept, thumbnail, tags, readiness } = entry;
  const extra = Object.keys(entry).filter((key) => !FIELDS.includes(key));
  if (extra.length) {
    errors.push(`${at}: unknown field(s) ${extra.join(', ')} — the schema is ${FIELDS.join(', ')}.`);
  }
  if (typeof slug !== 'string' || !SLUG.test(slug)) {
    errors.push(`${at}: slug ${JSON.stringify(slug)} must be lowercase kebab-case (e.g. "ok-computer").`);
    return;
  }
  if (seen.has(slug)) errors.push(`${at}: slug "${slug}" appears twice.`);
  seen.add(slug);
  if (typeof title !== 'string' || !title.trim()) errors.push(`${at}: title must be a non-empty string.`);
  if (typeof concept !== 'string' || !concept.trim()) {
    errors.push(`${at}: concept must be a non-empty string (artist/album + one-line pitch).`);
  }
  if (typeof thumbnail !== 'string' || !thumbnail.trim()) {
    errors.push(`${at}: thumbnail must be a filename under covers/${slug}/public/ (e.g. "thumbnail.svg").`);
  } else if (!existsSync(`covers/${slug}/public/${thumbnail}`)) {
    errors.push(`${at}: covers/${slug}/public/${thumbnail} is missing — add a square preview for the gallery index.`);
  }
  if (!Array.isArray(tags) || tags.length === 0 || !tags.every((t) => typeof t === 'string' && t.trim())) {
    errors.push(`${at}: tags must be a non-empty array of short strings (e.g. ["webgl", "dom"]).`);
  }
  if (typeof readiness !== 'string' || !READINESS.has(readiness)) {
    errors.push(`${at}: readiness must be one of ${[...READINESS].join(', ')}.`);
  }
  if (!Array.isArray(authors) || authors.length === 0 || !authors.every((a) => typeof a === 'string' && a.trim())) {
    errors.push(`${at}: authors must be a non-empty array of names/handles.`);
  }
  if (!existsSync(`covers/${slug}/src/Route.jsx`)) {
    errors.push(`${at}: covers/${slug}/src/Route.jsx does not exist — copy covers/_template/ first (X15 neutral template).`);
  }
});

// --- Sorted by slug -----------------------------------------------------------
const slugs = registry.map((entry) => entry?.slug).filter((slug) => typeof slug === 'string');
for (let i = 1; i < slugs.length; i += 1) {
  if (slugs[i - 1] > slugs[i]) {
    errors.push(
      `${PATH}: keep the array sorted by slug — "${slugs[i]}" must come before "${slugs[i - 1]}". ` +
        `Expected order: ${[...slugs].sort().join(', ')}.`,
    );
    break;
  }
}

// --- R3F extend keys: unique across routes (Route contract item 3) -------------
const { keysByFolder, extendErrors } = collectExtendKeys('covers');
errors.push(...extendErrors);
/** @type {Map<string, {folder: string, file: string}[]>} */
const owners = new Map();
for (const [folder, found] of keysByFolder) {
  for (const { key, file } of found) {
    if (key in THREE) {
      errors.push(
        `${file}: extend({ ${key} }) shadows three's own ${key}, which every route uses. ` +
          `Register it under a slug-unique name instead (Route contract 3 in CONTRIBUTING.md).`,
      );
    }
    if (!owners.has(key)) owners.set(key, []);
    const list = owners.get(key);
    if (!list.some((owner) => owner.folder === folder)) list.push({ folder, file });
  }
}
for (const [key, list] of owners) {
  if (list.length < 2) continue;
  const where = list.map(({ folder, file }) => `"${folder}" (${file})`).join(' and ');
  errors.push(
    `R3F extend key "${key}" is registered by ${where}. Extend keys are shared by every route, ` +
      `so one of these covers would render the other's material. Rename yours to a slug-unique key ` +
      `(extend({ OkComputerSleeve: SleeveShader }) → <okComputerSleeve …/>) or use the component form ` +
      `(const Sleeve = extend(SleeveShader) → <Sleeve …/>). See Route contract 3 in CONTRIBUTING.md.`,
  );
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

const keyCount = owners.size;
console.log(
  `registry ok (${registry.length} cover${registry.length === 1 ? '' : 's'}; ` +
    `${keyCount} R3F extend key${keyCount === 1 ? '' : 's'}, none shared)`,
);

// --- helpers -----------------------------------------------------------------

/**
 * Every `extend({ … })` key under covers/<folder>/src/**, per folder.
 *
 * @param {string} root
 * @returns {{ keysByFolder: Map<string, {key: string, file: string}[]>, extendErrors: string[] }}
 */
function collectExtendKeys(root) {
  const keysByFolder = new Map();
  const extendErrors = [];
  if (!existsSync(root)) return { keysByFolder, extendErrors };
  for (const folder of readdirSync(root).sort()) {
    if (folder === '_template') continue;
    const src = join(root, folder, 'src');
    if (!existsSync(src) || !statSync(src).isDirectory()) continue;
    const found = [];
    for (const file of walk(src)) {
      const code = readFileSync(file, 'utf8');
      const masked = mask(code);
      for (const [from, to] of extendObjectBodies(masked)) {
        for (const [a, b] of splitTopLevel(masked, from, to)) {
          const lead = a + (masked.slice(a, b).length - masked.slice(a, b).trimStart().length);
          const entry = masked.slice(lead, b).trim();
          if (!entry) continue;
          if (entry.startsWith('...') || entry.startsWith('[')) {
            extendErrors.push(
              `${file}: extend({ ${code.slice(lead, b).trim()} }) cannot be checked. List each key by name, ` +
                `e.g. extend({ OkComputerSleeve: SleeveShader }).`,
            );
            continue;
          }
          const match = /^(?:(['"])([^'"]+)\1|([A-Za-z_$][\w$]*))/.exec(code.slice(lead, b));
          if (match) found.push({ key: match[2] ?? match[3], file });
        }
      }
    }
    if (found.length) keysByFolder.set(folder, found);
  }
  return { keysByFolder, extendErrors };
}

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else if (/\.(?:js|jsx|mjs)$/.test(name)) out.push(path);
  }
  return out;
}

/**
 * Same length as `code`, with comments and the insides of string and template
 * literals blanked to spaces (quote characters kept). Searching the mask finds
 * only real code, so a commented-out example or a string never counts as a
 * registration, and the indices still point into the original source.
 * (Regex literals are not recognised; a cover file rarely has one.)
 *
 * @param {string} code
 * @returns {string}
 */
function mask(code) {
  const out = code.split('');
  for (let i = 0; i < code.length; i += 1) {
    const c = code[i];
    const next = code[i + 1];
    if (c === '"' || c === "'" || c === '`') {
      for (i += 1; i < code.length && code[i] !== c; i += 1) {
        if (code[i] === '\\') out[i++] = ' ';
        if (code[i] !== '\n') out[i] = ' ';
      }
    } else if (c === '/' && next === '/') {
      for (; i < code.length && code[i] !== '\n'; i += 1) out[i] = ' ';
    } else if (c === '/' && next === '*') {
      const end = code.indexOf('*/', i + 2);
      const stop = end === -1 ? code.length : end + 2;
      for (; i < stop; i += 1) if (code[i] !== '\n') out[i] = ' ';
      i -= 1;
    }
  }
  return out.join('');
}

/**
 * [start, end) of the text between the braces of every `extend({ … })` call.
 *
 * @param {string} masked output of mask()
 * @returns {[number, number][]}
 */
function extendObjectBodies(masked) {
  const bodies = [];
  const call = /\bextend\s*\(\s*\{/g;
  let match;
  while ((match = call.exec(masked))) {
    const open = match.index + match[0].length - 1;
    let depth = 0;
    let close = -1;
    for (let i = open; i < masked.length; i += 1) {
      if (masked[i] === '{') depth += 1;
      else if (masked[i] === '}' && --depth === 0) {
        close = i;
        break;
      }
    }
    if (close === -1) continue;
    bodies.push([open + 1, close]);
    call.lastIndex = close;
  }
  return bodies;
}

/**
 * Splits masked[from, to) on its top-level commas.
 *
 * @param {string} masked
 * @param {number} from
 * @param {number} to
 * @returns {[number, number][]}
 */
function splitTopLevel(masked, from, to) {
  const parts = [];
  let depth = 0;
  let start = from;
  for (let i = from; i < to; i += 1) {
    const c = masked[i];
    if ('([{'.includes(c)) depth += 1;
    else if (')]}'.includes(c)) depth -= 1;
    else if (c === ',' && depth === 0) {
      parts.push([start, i]);
      start = i + 1;
    }
  }
  parts.push([start, to]);
  return parts;
}
