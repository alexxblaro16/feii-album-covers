import { useLoader, useThree } from '@react-three/fiber';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';

/**
 * Where `KTX2Loader` finds the Basis transcoder pair: the ONE copy vendored at
 * the repo-root `public/basis/` (see public/basis/README.md). Built from
 * BASE_URL, so it still resolves when the gallery is served from a subfolder
 * (`BASE_PATH=/feii-album-covers/ npm run build`). Never a bare '/basis/'.
 */
export const TRANSCODER_PATH = import.meta.env.BASE_URL + 'basis/';

/**
 * Loads one `.ktx2` file (ETC1S or UASTC inside) as a texture, with the shared
 * transcoder. Same loader as the KTX2/Basis satellite's packed-sleeve Excerpt;
 * only the transcoder path differs, because the aggregator vendors one copy for
 * every route.
 *
 * - R3F's `useLoader` keeps one loader per class, so every route shares one
 *   `KTX2Loader` (and one transcoder worker pool), and it caches each file.
 * - `detectSupport(gl)` asks this GPU which packed formats it can sample; the
 *   transcoder picks one (record `texture.format`: it belongs to the device).
 * - The loader sets `texture.colorSpace` from the file's own colour
 *   description. This hook does not touch it: CHECK it
 *   (`texture.colorSpace === SRGBColorSpace` for a sleeve picture).
 * - A packed texture is not flipped on upload (`flipY` stays false). Encode
 *   the file flipped (`scripts/encode-cover.mjs` does); never `1.0 - vUv.y`.
 *
 * Do not swap in Drei's `useKTX2`: in drei 10.7.9 it loads a different copy of
 * the loader and defaults to a CDN transcoder path.
 *
 * Keep the bundle ESM (Vite's default). KTX2Loader evaluates
 * `new URL('../libs/basis/…', import.meta.url)` at module load, which throws
 * in an IIFE/CJS bundle or a CJS test runner; use Vitest if a test imports it.
 *
 * @param {string} url The `.ktx2` file, e.g. `new URL('../public/sleeve-etc1s.ktx2', import.meta.url).href`.
 * @returns {import('three').CompressedTexture}
 */
export function useKTX2Texture(url) {
  const gl = useThree((state) => state.gl);
  return useLoader(KTX2Loader, url, (loader) => {
    loader.setTranscoderPath(TRANSCODER_PATH);
    loader.detectSupport(gl);
  });
}
