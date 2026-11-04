import { lazy } from 'react';
import registry from '../../covers/registry.json';

/**
 * Joins `covers/registry.json` to the route modules on disk.
 *
 * Globs are relative to THIS file (src/gallery/), so `../../covers/` is the
 * repo's `covers/` folder. Vite expands them at build time:
 *   - Cover.jsx  — lazy: each cover is its own chunk, loaded when its route opens.
 *   - parts.js   — eager: the panel needs PARTS before the scene arrives. Small.
 *   - budget.js  — eager, only the CEILING export. Optional per route.
 *
 * `_template` matches the glob, so CI compiles it on every build, but it is
 * never a route: `scripts/check-registry.mjs` refuses it in the registry, and
 * it is filtered out below as well.
 */
const coverModules = import.meta.glob('../../covers/*/src/Cover.jsx');
const partsModules = import.meta.glob('../../covers/*/src/parts.js', { eager: true });
const ceilingModules = import.meta.glob('../../covers/*/src/budget.js', {
  eager: true,
  import: 'CEILING',
});

/**
 * `../../covers/<slug>/src/Cover.jsx` → `<slug>`
 *
 * @param {string} path
 * @returns {string}
 */
function slugOf(path) {
  return path.split('/').at(-3);
}

/**
 * @template T
 * @param {Record<string, T>} modules
 * @returns {Record<string, T>}
 */
function bySlug(modules) {
  /** @type {Record<string, T>} */
  const out = {};
  for (const [path, value] of Object.entries(modules)) out[slugOf(path)] = value;
  return out;
}

const loaders = bySlug(coverModules);
const partsBySlug = bySlug(partsModules);
const ceilingBySlug = bySlug(ceilingModules);

/**
 * @typedef {import('../lib/types.js').RegistryEntry & {
 *   Cover: import('react').ComponentType<import('../lib/types.js').CoverProps>,
 *   parts: import('../lib/types.js').PartInfo[],
 *   ceiling: import('../lib/types.js').Ceiling | null,
 * }} GalleryCover
 */

/** @type {import('../lib/types.js').RegistryEntry[]} */
const entries = Array.isArray(registry) ? registry : [];

/**
 * Every lit route, in registry order. `React.lazy` is called once per cover,
 * here at module level, never during render.
 *
 * @type {GalleryCover[]}
 */
export const covers = entries
  .filter((entry) => entry.slug !== '_template' && loaders[entry.slug])
  .map((entry) => ({
    ...entry,
    authors: Array.isArray(entry.authors) ? entry.authors : [],
    Cover: lazy(loaders[entry.slug]),
    parts: partsBySlug[entry.slug]?.PARTS ?? [],
    ceiling: ceilingBySlug[entry.slug] ?? null,
  }));

/**
 * Registry slugs with no `covers/<slug>/src/Cover.jsx`. `npm run lint` fails
 * on these in CI; the index page also lists them so a local mistake is visible.
 *
 * @type {string[]}
 */
export const missingModules = entries
  .filter((entry) => entry.slug !== '_template' && !loaders[entry.slug])
  .map((entry) => entry.slug);

/**
 * @param {string | undefined} slug
 * @returns {GalleryCover | null}
 */
export function findCover(slug) {
  return covers.find((cover) => cover.slug === slug) ?? null;
}
