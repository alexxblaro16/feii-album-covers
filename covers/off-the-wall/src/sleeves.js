// Las cuatro portadas comparten un atlas para mantener una sola textura en GPU.
import { CanvasTexture, PlaneGeometry, RingGeometry, SRGBColorSpace } from 'three';

export const COVER_URLS = [
  new URL('../public/abc.jpg', import.meta.url).href,
  new URL('../public/christmas.jpg', import.meta.url).href,
  new URL('../public/the-jacksons.jpg', import.meta.url).href,
  new URL('../public/monitor-cover.jpg', import.meta.url).href,
];

const PX = 512;

/** @param {import('three').Texture[]} covers */
export function createSleeves(covers) {
  const canvas = document.createElement('canvas');
  canvas.width = PX * covers.length;
  canvas.height = PX;
  const context = canvas.getContext('2d');
  covers.forEach((cover, index) => context.drawImage(cover.image, index * PX, 0, PX, PX));
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** Plano de funda: 0 ABC, 1 Christmas, 2 The Jacksons, 3 Off the Wall. */
export function sleeveGeometry(slot) {
  const g = new PlaneGeometry(0.31, 0.31);
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i += 1) uv.setX(i, (uv.getX(i) + slot) / 4);
  return g;
}

/** Etiqueta circular con agujero y UV de un rectángulo de la textura. */
export function labelGeometry(innerRadius, outerRadius, rect) {
  const geometry = new RingGeometry(innerRadius, outerRadius, 64);
  const uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i += 1) {
    uv.setXY(i, rect.x + uv.getX(i) * rect.width, rect.y + uv.getY(i) * rect.height);
  }
  return geometry;
}

export function sleeveLabelGeometry(slot) {
  return labelGeometry(0.0045, 0.055, { x: slot / 4, y: 0, width: 0.25, height: 1 });
}

export function setSleeveLabelSlot(geometry, slot) {
  const uv = geometry.attributes.uv;
  const position = geometry.attributes.position;
  for (let i = 0; i < uv.count; i += 1) {
    uv.setX(i, (slot + (position.getX(i) / 0.055 + 1) / 2) / 4);
  }
  uv.needsUpdate = true;
}
