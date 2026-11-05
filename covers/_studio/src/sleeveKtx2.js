// covers/_studio/src/sleeveKtx2.js — the KTX2/Basis satellite's packed-sleeve
// loader, on a route. Two differences from the lesson's Excerpt, both from the
// aggregator's rules: the file is referenced relative to this route
// (`new URL('../public/…', import.meta.url)`, like ./sleevePicture.js), and the
// transcoder path comes from the shared loader in src/lib/ktx2.js, which points
// at the ONE vendored copy (repo-root public/basis/, path from BASE_URL).
//
// Both files were encoded from ../public/sleeve.png by `npm run encode -- _studio`
// (scripts/encode-cover.mjs): flipped (--lower_left_maps_to_s0t0) and labelled
// sRGB (--assign_oetf srgb), with mipmaps; UASTC also zstd-packed (--zcmp 18).

import { useKTX2Texture } from '../../../src/lib/ktx2.js';

/**
 * The switch's modes, in the order the panel shows them. `flat` is the
 * baseline (no picture), so the texture count can be read before and after a
 * sleeve picture loads.
 *
 * @typedef {'flat' | 'png' | 'etc1s' | 'uastc'} SleeveMode
 */
export const MODES = [
  { id: 'flat', label: 'Flat', hint: 'no picture: the baseline count' },
  { id: 'png', label: 'PNG', hint: 'unpacked on upload' },
  { id: 'etc1s', label: 'ETC1S', hint: 'smaller, lossier' },
  { id: 'uastc', label: 'UASTC', hint: 'larger, cleaner' },
];

/** The two packed files, resolved from this file's own location. */
export const SLEEVE_KTX2_URL = {
  etc1s: new URL('../public/sleeve-etc1s.ktx2', import.meta.url).href,
  uastc: new URL('../public/sleeve-uastc.ktx2', import.meta.url).href,
};

/**
 * Loads the packed sleeve for one mode. The loader sets `colorSpace` from the
 * file and does not flip it on upload; the studio CHECKS both (sleeveChecks.js)
 * instead of patching them.
 *
 * @param {'etc1s' | 'uastc'} mode
 * @returns {import('three').CompressedTexture}
 */
export function useSleeveKtx2(mode) {
  return useKTX2Texture(SLEEVE_KTX2_URL[mode]);
}
