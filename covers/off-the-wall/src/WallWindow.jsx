// Ventana alta en la pared, a la derecha de Michael, como en la portada: en
// el encuadre solo asoma su borde izquierdo, con un marco fino y oscuro y el
// cielo detrás, azul arriba, casi blanco en medio y un verde difuminado abajo. Al girar la cámara se ve
// entera. Modelada con código (interpretación propia, no sacada de la foto).
// Coste: 2 llamadas (el marco va fundido en una sola geometría) y ninguna
// textura: el degradado del cielo va en los colores de los vértices.

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BoxGeometry, Color, Float32BufferAttribute, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry } from 'three';
import { WALL } from './set.js';
import { shotRig } from './shotRig.js';

// Medidas (m) y sitio en la pared: el borde izquierdo queda justo dentro del
// lado derecho del encuadre de la portada y la parte de abajo, a la altura
// del pecho de Michael.
const W = 1.05;
const H = 2.3;
// Marco fino, como en la foto.
const BAR = 0.025;
const LEFT = 1.06;
const BOTTOM = 0.97;
const POS = [LEFT + W / 2, BOTTOM + H / 2];
// En la foto de cintura para arriba la ventana ocupa la franja derecha, del
// borde de arriba hasta la altura de las manos, como en esa versión del disco.
const HALF_POS = [0.54 + W / 2, 0.8 + H / 2];
// Cara delantera de los ladrillos.
const FRONT = WALL.z + 0.11;

// Cielo de la ventana, de arriba abajo: azul, blanco y verde al fondo.
const SKY = ['#3a7cc8', '#5f9fdb', '#9cc6e2', '#a6cf9c', '#6aac63'];

/** Marco fino: cuatro listones fundidos en uno. */
function frameGeometry() {
  const bar = (w, h, x, y, d = 0.045) => {
    const g = new BoxGeometry(w, h, d);
    g.translate(x, y, d / 2);
    return g;
  };
  const parts = [
    bar(W + BAR, BAR, 0, H / 2),
    bar(W + BAR, BAR, 0, -H / 2),
    bar(BAR, H, -W / 2, 0),
    bar(BAR, H, W / 2, 0),
  ];
  const g = mergeGeometries(parts);
  parts.forEach((p) => p.dispose());
  return g;
}

/** Cristal con el degradado del cielo en los vértices. */
function skyGeometry() {
  const rows = SKY.length * 3;
  const g = new PlaneGeometry(W, H, 1, rows);
  const pos = g.attributes.position;
  const colors = [];
  const c = new Color();
  const stops = SKY.map((s) => new Color(s));
  for (let i = 0; i < pos.count; i += 1) {
    // 0 arriba, 1 abajo.
    const t = Math.max(0, Math.min(1, (H / 2 - pos.getY(i)) / H));
    const f = t * (stops.length - 1);
    const a = Math.min(stops.length - 2, Math.floor(f));
    c.copy(stops[a]).lerp(stops[a + 1], f - a);
    colors.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new Float32BufferAttribute(colors, 3));
  return g;
}

export default function WallWindow() {
  const res = useMemo(
    () => ({
      frame: frameGeometry(),
      glass: skyGeometry(),
      // Marco metálico oscuro, como el de la foto.
      paint: new MeshStandardMaterial({ color: '#3d3c3a', roughness: 0.45, metalness: 0.5 }),
      // El cielo es luz: no le afectan las luces del estudio.
      // Sin el mapeo de tonos de la escena: si no, el azul se lavaba casi a blanco.
      pane: new MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
    }),
    [],
  );
  useEffect(
    () => () => {
      res.frame.dispose();
      res.glass.dispose();
      res.paint.dispose();
      res.pane.dispose();
    },
    [res],
  );

  const group = useRef(/** @type {import('three').Group | null} */ (null));
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const [x, y] = shotRig.half ? HALF_POS : POS;
    g.position.set(x, y, FRONT);
  });

  return (
    <group ref={group} position={[POS[0], POS[1], FRONT]}>
      {/* El cristal queda un poco hundido respecto a los ladrillos. */}
      <mesh geometry={res.glass} material={res.pane} position={[0, 0, 0.004]} />
      <mesh geometry={res.frame} material={res.paint} receiveShadow />
    </group>
  );
}
