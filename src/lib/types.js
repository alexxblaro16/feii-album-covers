/**
 * Shared JSDoc typedefs. JavaScript-first: no TypeScript in this repo (D10).
 * Import a type in a JSDoc comment with
 *   @type {import('../lib/types.js').CoverProps}
 * This module exports nothing at runtime.
 */

/**
 * One object in `covers/registry.json`. Adding this object (plus the
 * `covers/<slug>/` folder) is what turns `/covers/<slug>` on.
 *
 * @typedef {object} RegistryEntry
 * @property {string} slug     Folder name under `covers/` and the URL segment.
 *                             Lowercase kebab-case (`ok-computer`). Only the
 *                             instructor's `_studio` starts with an underscore.
 * @property {string} title    Heading shown on the route: your album's title,
 *                             as DOM text (it was the fork's `<h1>`).
 * @property {string} album    The named album: "Artist — Album (year)".
 * @property {string[]} authors Team members (GitHub handles).
 */

/**
 * A part id, as defined in the route's own `src/parts.js` (`PartId`).
 * `null` means "nothing hovered" / "nothing selected".
 *
 * @typedef {string | null} PartIdValue
 */

/**
 * THE ROUTE CONTRACT. The `/covers/:slug` route component
 * (`src/gallery/CoverRoute.jsx`) owns this state and passes exactly these five
 * props to the default export of `covers/<slug>/src/Cover.jsx`, inside the
 * gallery's `<Canvas>`. They are the same five props the Unit 8 cover fork's
 * `App.jsx` passes, so a fork `Cover.jsx` moves over unchanged.
 *
 * @typedef {object} CoverProps
 * @property {PartIdValue} hovered   Part under the pointer.
 * @property {PartIdValue} selected  Part last clicked (mesh or panel button).
 * @property {boolean} reduced       `prefers-reduced-motion: reduce` is on:
 *                                   stop `useFrame` motion, keep interaction.
 * @property {(id: PartIdValue) => void} onHover   Write `hovered`.
 * @property {(id: PartIdValue) => void} onSelect  Write `selected`.
 */

/**
 * One entry of the route's `PARTS` array (`covers/<slug>/src/parts.js`).
 * The gallery's panel renders one button per part and reads `note` aloud
 * through `aria-live`.
 *
 * @typedef {object} PartInfo
 * @property {string} id
 * @property {string} name
 * @property {string} note
 */

/**
 * The accepted ceiling for one route's tree (`covers/<slug>/src/budget.js`).
 *
 * @typedef {object} Ceiling
 * @property {number} calls
 * @property {number} triangles
 * @property {number} geometries
 * @property {number} textures
 */

/**
 * One `renderer.info` reading, taken about once a second by `BudgetProbe`.
 *
 * @typedef {object} BudgetSample
 * @property {number} calls
 * @property {number} triangles
 * @property {number} geometries
 * @property {number} textures   A texture COUNT, not bytes.
 */

export {};
