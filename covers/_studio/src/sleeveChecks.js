// covers/_studio/src/sleeveChecks.js — the studio switch's three checks, run on
// the texture the sleeve actually uses, in this browser, on this GPU:
//
//   1. colorSpace: `texture.colorSpace === SRGBColorSpace`. Catches a missing or
//      wrong sRGB label (a washed-out sleeve). It CANNOT see a conversion that
//      was baked into the pixels at encode time, so:
//   2. colour: the texture is drawn 1:1 into a small sRGB render target and two
//      flat patches are read back (the orange disc, the grey square) and
//      compared with the PNG file's own pixels (palette.js; the PNG was painted
//      from those values). A baked brightening (X8 cold review S1:
//      227,106,44 → 242,173,115) fails here even when check 1 passes.
//   3. orientation: the same read-back at the bottom-left corner square. It is
//      green (uv 0,0) when the picture lands upright, magenta (uv 0,1) when it
//      lands upside down. The UV labels on the sleeve show the same thing.
//
// Nothing here fixes anything. A failure means: re-encode (scripts/encode-cover.mjs),
// never `1.0 - vUv.y`, never deleting `#include <colorspace_fragment>`.

import {
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  SRGBColorSpace,
  Scene,
  WebGLRenderTarget,
} from 'three';
import { gpuBytes } from '../../../src/lib/gpuBytes.js';
import { PROBE, SLEEVE } from './palette.js';

/** Largest per-channel difference (0–255) still read as "the same colour after codec loss". */
export const COLOUR_TOLERANCE = 16;

/** Largest per-channel difference at which a corner square still counts as "that corner's colour". */
const ORIENTATION_TOLERANCE = 80;

/**
 * '#e36a2c' → [227, 106, 44]
 *
 * @param {string} hex
 * @returns {[number, number, number]}
 */
export function rgbOf(hex) {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Largest per-channel difference between two colours.
 *
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
export function channelDelta(a, b) {
  return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));
}

/**
 * Draws `texture` once, texel for pixel, into a SLEEVE.size² sRGB render target
 * and reads back the PROBE points. Everything it allocates is disposed before
 * it returns, so `renderer.info.memory.textures` (a count) is the same after
 * the call as before it.
 *
 * Read-back rows count from the BOTTOM (WebGL), picture rows from the TOP, so
 * picture row y is read at target row (size − 1 − y). When the picture lands
 * upright, plane uv (0,0) — bottom-left — shows picture pixel (0, size − 1).
 *
 * @param {import('three').WebGLRenderer} gl
 * @param {import('three').Texture} texture
 * @returns {Record<keyof typeof PROBE, [number, number, number]>}
 */
export function sampleTexture(gl, texture) {
  const size = SLEEVE.size;
  // An sRGB target stores screen colours, so the read-back is comparable with the PNG's own bytes.
  const target = new WebGLRenderTarget(size, size, { colorSpace: SRGBColorSpace, depthBuffer: false });
  const camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
  camera.position.z = 1;
  const geometry = new PlaneGeometry(1, 1);
  const material = new MeshBasicMaterial({ map: texture, toneMapped: false });
  const scene = new Scene();
  scene.add(new Mesh(geometry, material));

  const previous = gl.getRenderTarget();
  const pixel = new Uint8Array(4);
  /** @type {Record<string, [number, number, number]>} */
  const out = {};
  try {
    gl.setRenderTarget(target);
    gl.render(scene, camera);
    for (const [id, point] of Object.entries(PROBE)) {
      gl.readRenderTargetPixels(target, point.x, size - 1 - point.y, 1, 1, pixel);
      out[id] = [pixel[0], pixel[1], pixel[2]];
    }
  } finally {
    gl.setRenderTarget(previous);
    target.dispose();
    geometry.dispose();
    material.dispose();
  }
  return out;
}

/**
 * @typedef {object} SleeveReading
 * @property {string} mode            'png' | 'etc1s' | 'uastc'
 * @property {number} gpuAll          GPU bytes, all mip levels (computed).
 * @property {number} gpuLevel0       GPU bytes, level 0 only (computed).
 * @property {number} levels          Mip levels counted in gpuAll.
 * @property {string} format          `texture.format`, by name.
 * @property {string} colorSpace      `texture.colorSpace` as loaded.
 * @property {boolean} colorSpaceOk   colorSpace === SRGBColorSpace.
 * @property {{ id: string, label: string, got: number[], expect: number[], delta: number }[]} colours
 * @property {boolean} colourOk       Every patch within COLOUR_TOLERANCE of the PNG.
 * @property {'upright' | 'upside down' | 'unknown'} orientation
 * @property {number[]} corner        Colour read at the uv 0,0 corner.
 */

/**
 * Runs the three checks and computes the GPU bytes for one loaded sleeve texture.
 *
 * @param {import('three').WebGLRenderer} gl
 * @param {import('three').Texture} texture
 * @param {string} mode
 * @returns {SleeveReading}
 */
export function measureSleeve(gl, texture, mode) {
  const all = gpuBytes(texture);
  const level0 = gpuBytes(texture, { levels: 'level0' });
  const read = sampleTexture(gl, texture);

  const colours = ['disc', 'grey'].map((id) => {
    const expect = rgbOf(PROBE[id].expect);
    return { id, label: PROBE[id].label, got: read[id], expect, delta: channelDelta(read[id], expect) };
  });

  // Nearest of the two corner colours, so a colour shift (check 2's job) does
  // not also read as an orientation failure: a baked brightening moves the
  // green square to about (119,224,178), still far nearer green than magenta.
  const corner = read.u0v0;
  const toBottomLeft = channelDelta(corner, rgbOf(PROBE.u0v0.expect));
  const toTopLeft = channelDelta(corner, rgbOf(PROBE.u0v1.expect));
  let orientation = 'unknown';
  if (toBottomLeft < toTopLeft && toBottomLeft <= ORIENTATION_TOLERANCE) orientation = 'upright';
  else if (toTopLeft < toBottomLeft && toTopLeft <= ORIENTATION_TOLERANCE) orientation = 'upside down';

  return {
    mode,
    gpuAll: all.bytes,
    gpuLevel0: level0.bytes,
    levels: all.levels,
    format: all.format,
    colorSpace: texture.colorSpace,
    colorSpaceOk: texture.colorSpace === SRGBColorSpace,
    colours,
    colourOk: colours.every((c) => c.delta <= COLOUR_TOLERANCE),
    orientation,
    corner,
  };
}
