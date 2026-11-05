// covers/<slug>/src/sleevePicture.js — the Cover shaders "own photo" version,
// moved onto a route (task2). Cover.jsx does not import this file at task1.
//
// THE PICTURE RULE. In the fork, Vite served the fork's root public/ folder from
// the site root, so the fork loaded its photo by an absolute path at the root.
// On the aggregator there is no shared root folder for your photo: each route
// keeps its own pictures in covers/<slug>/public/. Reference them RELATIVE TO
// THIS FILE with `new URL(..., import.meta.url)`:
//   - it still points at your folder after you copy _template to covers/<slug>/;
//   - Vite copies the file into the build and rewrites the URL (with a content
//     hash), so it also works when the gallery is served from a subfolder;
//   - a typo shows up as a build warning and a 404, not as someone else's picture.
// Never write a root path for your picture: every team would fight over one file.
//
// The KTX2 task (task3) references its .ktx2 file the same way. The Basis
// transcoder is NOT yours to copy: the gallery vendors one shared copy at the
// repo-root public/basis/, and the shared loader (src/lib/ktx2.js,
// useKTX2Texture) builds its path from import.meta.env.BASE_URL.

import { useTexture } from '@react-three/drei';
import { SRGBColorSpace } from 'three';

/** covers/<slug>/public/sleeve.png, resolved from this file's own location. */
export const SLEEVE_URL = new URL('../public/sleeve.png', import.meta.url).href;

function tagScreenColours(texture) {
  // A photo holds screen colours. This tag tells the GPU to unpack them before the maths.
  texture.colorSpace = SRGBColorSpace;
}

/**
 * Loads the sleeve picture from this route's own `public/` folder. The Canvas
 * waits, blank, until the file has arrived (the gallery's Suspense boundary).
 *
 * Replace `public/sleeve.png` with your own square picture and keep the name,
 * or change the file name in SLEEVE_URL. The placeholder shipped in _template
 * is original art made for this repo; it is not an album cover.
 *
 * @returns {import('three').Texture} The texture to pass to the material as `map`.
 */
export function useSleevePicture() {
  return useTexture(SLEEVE_URL, tagScreenColours);
}
