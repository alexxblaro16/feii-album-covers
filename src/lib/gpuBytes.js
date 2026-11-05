// src/lib/gpuBytes.js — the KTX2/Basis satellite's `src/gpuBytes.js`, copied
// unchanged below this header. The studio switch (covers/_studio) reads it; a
// route may import it from here instead of keeping its own copy.
//
// GPU bytes (the room) are COMPUTED from what three.js uploads. They are not the
// file size on disk (the suitcase), and they are not
// `renderer.info.memory.textures`, which is a texture COUNT.

import * as THREE from 'three';

/**
 * Names a three.js format number, so a note can say `RGBAFormat`
 * instead of `1023`.
 *
 * @param {number} format The texture's `format` value.
 * @returns {string} The constant's name, or the number as text if none matches.
 */
export function formatName(format) {
  const match = Object.entries(THREE).find(
    ([name, value]) => name.endsWith('Format') && value === format,
  );
  return match ? match[0] : String(format);
}

/**
 * Computes how many bytes a texture takes on the GPU, from what three.js
 * uploads. This is not the file size on disk.
 *
 * - A KTX2 texture arrives already packed for this GPU: the bytes are the
 *   sum of its transcoded `mipmaps[i].data.byteLength`.
 * - A PNG or JPEG texture is unpacked to a grid: level 0 is
 *   `TextureUtils.getByteLength(width, height, format, type)`, which is
 *   width × height × 4 for an ordinary picture. three.js also makes
 *   smaller copies (mipmaps) when `generateMipmaps` is true, which it is
 *   by default; `levels: 'all'` counts them too.
 *
 * Compare like with like: `'all'` on both sides, or `'level0'` on both.
 *
 * @param {import('three').Texture} texture A loaded texture (wait for it).
 * @param {{ levels?: 'all' | 'level0' }} [options]
 * @returns {{ bytes: number, levels: number, width: number, height: number, format: string }}
 */
export function gpuBytes(texture, { levels = 'all' } = {}) {
  if (texture.isCompressedTexture) {
    const all = texture.mipmaps;
    const counted = levels === 'all' ? all : all.slice(0, 1);
    return {
      bytes: counted.reduce((sum, level) => sum + level.data.byteLength, 0),
      levels: counted.length,
      width: all[0].width,
      height: all[0].height,
      format: formatName(texture.format),
    };
  }

  const image = texture.image;
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const chain =
    levels === 'all' && texture.generateMipmaps
      ? Math.floor(Math.log2(Math.max(width, height))) + 1
      : 1;

  let bytes = 0;
  for (let level = 0; level < chain; level += 1) {
    const w = Math.max(1, Math.floor(width / 2 ** level));
    const h = Math.max(1, Math.floor(height / 2 ** level));
    bytes += THREE.TextureUtils.getByteLength(w, h, texture.format, texture.type);
  }

  return { bytes, levels: chain, width, height, format: formatName(texture.format) };
}
