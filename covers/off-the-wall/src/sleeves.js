// Fundas de los discos que hay en la mesa del tocadiscos. Son diseños propios
// dibujados con código (solo el título y el año): no reproducen las portadas
// originales, que no pueden ir en un repositorio público (regla D8). Las
// cuatro van en una sola textura, una en cada cuarto, para no gastar más de una.

import { CanvasTexture, PlaneGeometry, SRGBColorSpace } from 'three';

const PX = 512;

/** ABC (1970): letras de colores como cubos de juguete y el nombre del grupo. */
function abc(c, x0, s) {
  const g = c.createLinearGradient(x0, 0, x0, s);
  g.addColorStop(0, '#f6d36b');
  g.addColorStop(1, '#ef9a3a');
  c.fillStyle = g;
  c.fillRect(x0, 0, s, s);
  const colors = ['#d8392b', '#2a7bc9', '#2e9e4f'];
  ['A', 'B', 'C'].forEach((ch, i) => {
    const bx = x0 + s * (0.12 + i * 0.27);
    const by = s * (0.2 + (i % 2) * 0.08);
    c.fillStyle = colors[i];
    c.fillRect(bx, by, s * 0.22, s * 0.22);
    c.fillStyle = '#fff8e8';
    c.font = `700 ${s * 0.18}px Oswald, Impact, sans-serif`;
    c.textAlign = 'center';
    c.fillText(ch, bx + s * 0.11, by + s * 0.18);
  });
  c.fillStyle = '#4a1c10';
  c.font = `600 ${s * 0.1}px Oswald, Impact, sans-serif`;
  c.fillText('THE JACKSON 5', x0 + s / 2, s * 0.74);
  c.font = `${s * 0.06}px Oswald, sans-serif`;
  c.fillText('ABC · 1970', x0 + s / 2, s * 0.85);
}

/** Christmas Album (1970): rojo con copos de nieve y letras de felicitación. */
function christmas(c, x0, s) {
  c.fillStyle = '#a3241d';
  c.fillRect(x0, 0, s, s);
  c.strokeStyle = 'rgb(255 255 255 / 0.55)';
  c.lineWidth = s * 0.008;
  const flakes = [
    [0.15, 0.15, 0.06],
    [0.82, 0.2, 0.08],
    [0.3, 0.42, 0.04],
    [0.7, 0.5, 0.05],
    [0.12, 0.7, 0.05],
    [0.88, 0.78, 0.04],
  ];
  for (const [fx, fy, r] of flakes) {
    for (let k = 0; k < 3; k += 1) {
      const a = (k * Math.PI) / 3;
      c.beginPath();
      c.moveTo(x0 + s * (fx - Math.cos(a) * r), s * (fy - Math.sin(a) * r));
      c.lineTo(x0 + s * (fx + Math.cos(a) * r), s * (fy + Math.sin(a) * r));
      c.stroke();
    }
  }
  c.fillStyle = '#2f7a3a';
  c.fillRect(x0, s * 0.56, s, s * 0.06);
  c.fillStyle = '#fff4e2';
  c.textAlign = 'center';
  c.font = `${s * 0.11}px Yellowtail, cursive`;
  c.fillText('Jackson 5', x0 + s / 2, s * 0.32);
  c.font = `600 ${s * 0.085}px Oswald, Impact, sans-serif`;
  c.fillText('CHRISTMAS ALBUM', x0 + s / 2, s * 0.78);
  c.font = `${s * 0.055}px Oswald, sans-serif`;
  c.fillText('1970', x0 + s / 2, s * 0.88);
}

/** The Jacksons (1976): crema con franjas de colores de los setenta y el nombre. */
function jacksons(c, x0, s) {
  c.fillStyle = '#f2e6cc';
  c.fillRect(x0, 0, s, s);
  ['#c9962a', '#d8662b', '#a3241d', '#5a2a6e'].forEach((col, i) => {
    c.fillStyle = col;
    c.fillRect(x0, s * (0.5 + i * 0.07), s, s * 0.05);
  });
  c.fillStyle = '#3a1d14';
  c.textAlign = 'center';
  c.font = `${s * 0.08}px Oswald, sans-serif`;
  c.fillText('THE', x0 + s / 2, s * 0.2);
  c.font = `700 ${s * 0.16}px Oswald, Impact, sans-serif`;
  c.fillText('JACKSONS', x0 + s / 2, s * 0.38);
  c.font = `${s * 0.06}px Oswald, sans-serif`;
  c.fillText('Epic · 1976', x0 + s / 2, s * 0.9);
}

/** Off the Wall (1979): pared de ladrillo y el título a tiza (sin la foto). */
function offTheWall(c, x0, s) {
  c.fillStyle = '#b1a89c';
  c.fillRect(x0, 0, s, s);
  const bw = s / 7;
  const bh = s / 18;
  const tones = ['#8a4430', '#7b3f33', '#955236', '#6c372d', '#83432f'];
  for (let r = 0; r < 18; r += 1) {
    for (let k = -1; k < 8; k += 1) {
      c.fillStyle = tones[(r * 3 + k * 7 + 50) % tones.length];
      c.fillRect(x0 + k * bw + (r % 2) * bw * 0.5 + 2, r * bh + 2, bw - 4, bh - 4);
    }
  }
  c.fillStyle = '#f5f1e8';
  c.textAlign = 'left';
  c.font = `${s * 0.09}px "Architects Daughter", cursive`;
  c.fillText('MICHAEL', x0 + s * 0.06, s * 0.13);
  c.fillText('JACKSON', x0 + s * 0.06, s * 0.24);
  c.font = `${s * 0.11}px "Architects Daughter", cursive`;
  c.fillText('OFF', x0 + s * 0.06, s * 0.4);
  c.fillText('THE', x0 + s * 0.08, s * 0.52);
  c.fillText('WALL', x0 + s * 0.05, s * 0.64);
  c.fillRect(x0 + s * 0.06, s * 0.27, s * 0.3, s * 0.008);
  c.fillRect(x0 + s * 0.06, s * 0.67, s * 0.2, s * 0.008);
}

function paint(canvas) {
  const c = canvas.getContext('2d');
  abc(c, 0, PX);
  christmas(c, PX, PX);
  jacksons(c, PX * 2, PX);
  offTheWall(c, PX * 3, PX);
}

/** Textura con las cuatro fundas: ABC, Christmas, The Jacksons y Off the Wall. */
export function createSleeves() {
  const canvas = document.createElement('canvas');
  canvas.width = PX * 4;
  canvas.height = PX;
  paint(canvas);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** Vuelve a pintar las fundas (cuando han cargado las letras). */
export function repaintSleeves(texture) {
  paint(texture.image);
  texture.needsUpdate = true;
}

/** Plano de funda que usa el cuarto `slot` (0 ABC, 1 Christmas, 2 The Jacksons, 3 Off the Wall). */
export function sleeveGeometry(slot) {
  const g = new PlaneGeometry(0.31, 0.31);
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i += 1) uv.setX(i, (uv.getX(i) + slot) / 4);
  return g;
}
