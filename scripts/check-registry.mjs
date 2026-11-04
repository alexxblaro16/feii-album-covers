#!/usr/bin/env node
// scripts/check-registry.mjs — runs inside `npm run lint` (and so in CI).
//
// Checks covers/registry.json against the schema every route relies on:
//   - a JSON array of { slug, title, album, authors } objects;
//   - slug is lowercase kebab-case (only the instructor's `_studio` may start
//     with an underscore), unique, and never `_template`;
//   - covers/<slug>/src/Cover.jsx exists for every slug.
// It does not check who changed what; CODEOWNERS and the human review do that.

import { existsSync, readFileSync } from 'node:fs';
import process from 'node:process';

const PATH = 'covers/registry.json';
const SLUG = /^(?:_studio|[a-z0-9]+(?:-[a-z0-9]+)*)$/;
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
  const { slug, title, album, authors } = entry;
  const extra = Object.keys(entry).filter((key) => !['slug', 'title', 'album', 'authors'].includes(key));
  if (extra.length) errors.push(`${at}: unknown field(s) ${extra.join(', ')} — the schema is slug, title, album, authors.`);
  if (typeof slug !== 'string' || !SLUG.test(slug)) {
    errors.push(`${at}: slug ${JSON.stringify(slug)} must be lowercase kebab-case (e.g. "ok-computer").`);
    return;
  }
  if (seen.has(slug)) errors.push(`${at}: slug "${slug}" appears twice.`);
  seen.add(slug);
  if (typeof title !== 'string' || !title.trim()) errors.push(`${at}: title must be a non-empty string.`);
  if (typeof album !== 'string' || !album.trim()) errors.push(`${at}: album must be a non-empty string ("Artist — Album (year)").`);
  if (!Array.isArray(authors) || authors.length === 0 || !authors.every((a) => typeof a === 'string' && a.trim())) {
    errors.push(`${at}: authors must be a non-empty array of names/handles.`);
  }
  if (!existsSync(`covers/${slug}/src/Cover.jsx`)) {
    errors.push(`${at}: covers/${slug}/src/Cover.jsx does not exist — copy covers/_template/ first.`);
  }
});

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`registry ok (${registry.length} cover${registry.length === 1 ? '' : 's'})`);
