// Recuerdo de los Jackson 5 en la pared derecha del plató, junto al
// tocadiscos: un cuadro con el nombre del grupo, cinco siluetas con afro
// (Michael, el pequeño, delante) y un disco de oro de "The Jacksons" (1976,
// el primer disco del grupo ya como The Jacksons, en Epic) con su
// placa. Diseño propio dibujado con código: no reproduce ninguna portada.
// Coste: 6 llamadas (marco, lámina, fondo del premio, disco, surcos y
// etiqueta) y una textura.

import { useEffect, useMemo, useRef } from 'react';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  CanvasTexture,
  BoxGeometry,
  CylinderGeometry,
  MeshStandardMaterial,
  PlaneGeometry,
  RingGeometry,
  SRGBColorSpace,
} from 'three';

const W = 1.4;
const H = 1.0;
const PX = 1024;
// Pared derecha del estudio (x = 4,3), mirando hacia dentro.
const POSITION = [4.27, 1.75, 4.6];
const ROT_Y = -Math.PI / 2;
// El disco de oro: a la derecha de la lámina, centro y radio en metros.
const DISC = { x: 0.36, y: -0.02, r: 0.16 };

/** Surcos del disco: anillos finos un poco más oscuros, fundidos en uno. */
function grooves() {
  const rings = [];
  for (let r = 0.065; r < DISC.r - 0.008; r += 0.0075) rings.push(new RingGeometry(r, r + 0.0022, 64));
  const g = mergeGeometries(rings);
  rings.forEach((x) => x.dispose());
  return g;
}

/** Una silueta con afro: cabeza, pelo y cuerpo con los brazos algo abiertos. */
function figure(c, x, base, s) {
  c.beginPath();
  c.arc(x, base - 230 * s, 46 * s, 0, Math.PI * 2); // afro
  c.fill();
  c.beginPath();
  c.ellipse(x, base - 200 * s, 24 * s, 30 * s, 0, 0, Math.PI * 2); // cara
  c.fill();
  c.beginPath();
  c.moveTo(x - 46 * s, base - 160 * s);
  c.lineTo(x + 46 * s, base - 160 * s);
  c.lineTo(x + 36 * s, base - 40 * s);
  c.lineTo(x + 30 * s, base);
  c.lineTo(x - 30 * s, base);
  c.lineTo(x - 36 * s, base - 40 * s);
  c.closePath();
  c.fill();
  // Brazos.
  c.lineWidth = 16 * s;
  c.lineCap = 'round';
  for (const k of [-1, 1]) {
    c.beginPath();
    c.moveTo(x + k * 42 * s, base - 150 * s);
    c.lineTo(x + k * 70 * s, base - 70 * s);
    c.stroke();
  }
}

function paint(canvas) {
  const c = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  // Fondo de cartel de los setenta: degradado naranja a amarillo y rayos.
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#f2a33a');
  g.addColorStop(1, '#f6d36b');
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);
  c.save();
  c.translate(w * 0.3, h * 0.62);
  c.fillStyle = 'rgb(255 255 255 / 0.13)';
  for (let i = 0; i < 18; i += 1) {
    c.rotate((Math.PI * 2) / 18);
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(900, -40);
    c.lineTo(900, 40);
    c.closePath();
    c.fill();
  }
  c.restore();
  // Título.
  c.fillStyle = '#5a1f12';
  c.textAlign = 'left';
  c.font = `600 ${h * 0.13}px Oswald, Impact, sans-serif`;
  c.fillText('THE JACKSON 5', w * 0.05, h * 0.16);
  c.font = `${h * 0.045}px Oswald, sans-serif`;
  c.fillText('Jackie · Tito · Jermaine · Marlon · Michael', w * 0.05, h * 0.24);
  // Las cinco siluetas; Michael, el pequeño, delante en el centro.
  c.fillStyle = '#3b170e';
  c.strokeStyle = '#3b170e';
  const base = h * 0.95;
  [
    [0.1, 1.05],
    [0.42, 1.08],
    [0.18, 1.12],
    [0.34, 1.0],
  ].forEach(([x, s]) => figure(c, w * x, base - 30, s * 1.05));
  c.fillStyle = '#5a1f12';
  c.strokeStyle = '#5a1f12';
  figure(c, w * 0.26, base, 0.82);
  // Placa del disco de oro, bajo el premio (que es una pieza 3D aparte).
  const px = w * (0.5 + DISC.x / W);
  c.fillStyle = '#1b1310';
  c.fillRect(px - w * 0.17, h * 0.83, w * 0.34, h * 0.12);
  c.fillStyle = '#e9c873';
  c.textAlign = 'center';
  c.font = `600 ${h * 0.045}px Oswald, sans-serif`;
  c.fillText('THE JACKSONS', px, h * 0.88);
  c.font = `${h * 0.032}px Oswald, sans-serif`;
  c.fillText('Disco de oro · 1976', px, h * 0.925);
}

/** Vuelve a pintar el lienzo de la textura y avisa a three de que ha cambiado. */
function repaint(texture) {
  paint(texture.image);
  texture.needsUpdate = true;
}

export default function Jackson5() {
  const res = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = PX;
    canvas.height = Math.round((PX * H) / W);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    return {
      texture,
      panel: new PlaneGeometry(W, H),
      frame: new BoxGeometry(W + 0.08, H + 0.08, 0.04),
      disc: new CylinderGeometry(DISC.r, DISC.r, 0.008, 64),
      grooves: grooves(),
      // Etiqueta del centro (naranja de Epic) con el agujero.
      label: new RingGeometry(0.006, 0.055, 48),
      // Fondo de terciopelo negro del premio, con un filo dorado.
      backing: new BoxGeometry(0.42, 0.42, 0.012),
      trim: new BoxGeometry(0.44, 0.44, 0.006),
      labelMat: new MeshStandardMaterial({ color: '#d8662b', roughness: 0.6 }),
      velvet: new MeshStandardMaterial({ color: '#0d0b0c', roughness: 1 }),
      groove: new MeshStandardMaterial({ color: '#8a6a1e', roughness: 0.45, metalness: 0.6 }),
      panelMat: new MeshStandardMaterial({ map: texture, roughness: 0.9 }),
      frameMat: new MeshStandardMaterial({ color: '#141012', roughness: 0.5 }),
      // Oro brillante; como el estudio es oscuro, algo de luz propia (un metal
      // puro no tendría nada que reflejar y saldría negro).
      gold: new MeshStandardMaterial({ color: '#f2c75a', roughness: 0.18, metalness: 0.8, emissive: '#6b4a0e', emissiveIntensity: 0.75 }),
    };
  }, []);
  const ref = useRef(res);

  useEffect(() => {
    let alive = true;
    const r = ref.current;
    repaint(r.texture);
    // Con la letra Oswald ya cargada se vuelve a pintar.
    document.fonts?.load('600 40px Oswald').then(() => alive && repaint(r.texture), () => {});
    return () => {
      alive = false;
      r.texture.dispose();
      r.panel.dispose();
      r.frame.dispose();
      r.disc.dispose();
      r.grooves.dispose();
      r.label.dispose();
      r.backing.dispose();
      r.trim.dispose();
      r.labelMat.dispose();
      r.velvet.dispose();
      r.groove.dispose();
      r.panelMat.dispose();
      r.frameMat.dispose();
      r.gold.dispose();
    };
  }, []);

  return (
    <group position={POSITION} rotation={[0, ROT_Y, 0]}>
      <mesh geometry={res.frame} material={res.frameMat} position={[0, 0, -0.02]} />
      <mesh geometry={res.panel} material={res.panelMat} position={[0, 0, 0.002]} />
      {/* Disco de oro enmarcado como un premio: terciopelo negro con filo
          dorado, el disco con sus surcos y la etiqueta del centro. */}
      <group position={[DISC.x, DISC.y, 0]}>
        <mesh geometry={res.trim} material={res.gold} position={[0, 0, 0.004]} />
        <mesh geometry={res.backing} material={res.velvet} position={[0, 0, 0.01]} />
        <group position={[0, 0, 0.022]}>
          <mesh geometry={res.disc} material={res.gold} rotation={[Math.PI / 2, 0, 0]} />
          <mesh geometry={res.grooves} material={res.groove} position={[0, 0, 0.0045]} />
          <mesh geometry={res.label} material={res.labelMat} position={[0, 0, 0.005]} />
        </group>
      </group>
    </group>
  );
}
