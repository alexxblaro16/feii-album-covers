// Ventana en la pared de ladrillo, a la derecha de Michael: marco pintado con
// travesaño en cruz y cristal verde azulado con un poco de luz de día detrás.
// Modelada con código (interpretación propia, no sacada de la foto).
// Coste: 2 llamadas (el marco va fundido en una sola geometría).

import { useEffect, useMemo } from 'react';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BoxGeometry, Color, MeshPhysicalMaterial, MeshStandardMaterial, PlaneGeometry } from 'three';
import { WALL } from './set.js';

// Medidas (m) y sitio en la pared.
const W = 0.62;
const H = 0.82;
const BAR = 0.045;
const POS = [1.05, 1.42];
// Cara delantera de los ladrillos.
const FRONT = WALL.z + 0.11;

/** Marco: cuatro listones, el alféizar y la cruz del centro, fundidos en uno. */
function frameGeometry() {
  const bar = (w, h, x, y, d = 0.05) => {
    const g = new BoxGeometry(w, h, d);
    g.translate(x, y, d / 2);
    return g;
  };
  const parts = [
    bar(W + BAR, BAR, 0, H / 2), // arriba
    bar(W + BAR, BAR, 0, -H / 2), // abajo
    bar(BAR, H, -W / 2, 0), // izquierda
    bar(BAR, H, W / 2, 0), // derecha
    bar(W + BAR * 3, BAR * 0.8, 0, -H / 2 - BAR * 0.7, 0.08), // alféizar
    bar(BAR * 0.6, H, 0, 0, 0.035), // cruz vertical
    bar(W, BAR * 0.6, 0, 0.06, 0.035), // cruz horizontal
  ];
  const g = mergeGeometries(parts);
  parts.forEach((p) => p.dispose());
  return g;
}

export default function WallWindow() {
  const res = useMemo(
    () => ({
      frame: frameGeometry(),
      glass: new PlaneGeometry(W, H),
      paint: new MeshStandardMaterial({ color: '#d9d4c6', roughness: 0.7 }),
      // Cristal verde azulado: algo de brillo y una luz suave de día detrás.
      pane: new MeshPhysicalMaterial({
        color: '#2f6f6c',
        emissive: new Color('#5fa39b'),
        emissiveIntensity: 0.35,
        roughness: 0.12,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
      }),
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

  return (
    <group position={[POS[0], POS[1], FRONT]}>
      {/* El cristal queda un poco hundido respecto a los ladrillos. */}
      <mesh geometry={res.glass} material={res.pane} position={[0, 0, 0.004]} receiveShadow />
      <mesh geometry={res.frame} material={res.paint} receiveShadow />
    </group>
  );
}
