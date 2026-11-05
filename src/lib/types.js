/**
 * Shared JSDoc typedefs. JavaScript-first: no TypeScript in this repo (D10).
 * Import a type in a JSDoc comment with
 *   @type {import('../lib/types.js').RouteProps}
 * This module exports nothing at runtime.
 */

/**
 * One object in `covers/registry.json`. Adding this object (plus the
 * `covers/<slug>/` folder) is what turns `/covers/<slug>` on.
 *
 * @typedef {object} RegistryEntry
 * @property {string} slug     Folder name under `covers/` and the URL segment.
 *                             Lowercase kebab-case (`ok-computer`). Instructor
 *                             routes may use `_studio` or `_fixture-*`.
 * @property {string} title    Heading for discovery / selector (DOM text).
 * @property {string} concept  Artist/album naming + one-line pitch (replaces legacy `album`).
 * @property {string} thumbnail Filename under `covers/<slug>/public/` for the gallery index.
 * @property {string[]} tags   Short labels (e.g. webgl, dom, shader).
 * @property {'wip'|'ready'|'reference'|'demo'} readiness Exhibition state for `/`.
 * @property {string[]} authors Team members (GitHub handles).
 */

/**
 * Legacy five-prop scene fragment (pre-D26). New routes default-export a
 * complete `Route.jsx` instead. Kept for docs referencing the Unit 8 fork.
 *
 * @typedef {string | null} PartIdValue
 */

/**
 * @typedef {object} CoverProps
 * @property {PartIdValue} hovered
 * @property {PartIdValue} selected
 * @property {boolean} reduced
 * @property {(id: PartIdValue) => void} onHover
 * @property {(id: PartIdValue) => void} onSelect
 */

/**
 * One entry of a route's `PARTS` array when the route chooses to expose parts.
 *
 * @typedef {object} PartInfo
 * @property {string} id
 * @property {string} name
 * @property {string} note
 */

/**
 * @typedef {object} Ceiling
 * @property {number} calls
 * @property {number} triangles
 * @property {number} geometries
 * @property {number} textures
 */

/**
 * @typedef {object} BudgetSample
 * @property {number} calls
 * @property {number} triangles
 * @property {number} geometries
 * @property {number} textures
 */

export {};
