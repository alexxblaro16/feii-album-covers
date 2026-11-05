import { lazy } from 'react';
import registry from '../../covers/registry.json';

/**
 * Joins `covers/registry.json` to lazy route endpoints on disk (D26).
 *
 * Globs are relative to THIS file (src/gallery/), so `../../covers/` is the
 * repo's `covers/` folder. Each registered slug must export a default
 * `Route.jsx` — a complete student-authored endpoint (DOM, Canvas, layout).
 *
 * `_template` may match the glob when present, but it is never a route:
 * `scripts/check-registry.mjs` refuses it in the registry, and it is filtered
 * out below as well.
 */
const routeModules = import.meta.glob('../../covers/*/src/Route.jsx');

/**
 * `../../covers/<slug>/src/Route.jsx` → `<slug>`
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

const loaders = bySlug(routeModules);

/**
 * @typedef {import('../lib/types.js').RegistryEntry & {
 *   Route: import('react').ComponentType<Record<string, never>>,
 * }} GalleryRoute
 */

/** @type {import('../lib/types.js').RegistryEntry[]} */
const entries = Array.isArray(registry) ? registry : [];

/**
 * Every lit route, in registry order. `React.lazy` is called once per cover,
 * here at module level, never during render.
 *
 * @type {GalleryRoute[]}
 */
export const covers = entries
  .filter((entry) => entry.slug !== '_template' && loaders[entry.slug])
  .map((entry) => ({
    ...entry,
    authors: Array.isArray(entry.authors) ? entry.authors : [],
    Route: lazy(loaders[entry.slug]),
  }));

/**
 * Registry slugs with no `covers/<slug>/src/Route.jsx`. `npm run lint` fails
 * on these in CI; the index page also lists them so a local mistake is visible.
 *
 * @type {string[]}
 */
export const missingModules = entries
  .filter((entry) => entry.slug !== '_template' && !loaders[entry.slug])
  .map((entry) => entry.slug);

/**
 * @param {string | undefined} slug
 * @returns {GalleryRoute | null}
 */
export function findCover(slug) {
  return covers.find((cover) => cover.slug === slug) ?? null;
}
