// covers/_studio/src/Cover.jsx — instructor reference route.
//
// X9 STUB. It exists so the glob and the build cover _studio from day one; the
// finished reference scene (picture, sleeve shader, KTX2 switch, measured
// budget) replaces it in X10. It is not in covers/registry.json yet, so it has
// no route. Original geometry only: no album art (D8).
//
// It honours the same route contract as every student cover: a default export
// that takes the gallery's five props and renders no <Canvas>.

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PartId } from './parts.js';

const IDLE = {
  stage: '#2b2723',
  sleeve: '#cfc6ba',
  vinyl: '#141210',
};
const ACCENT = '#e36a2c';
const HOVER = '#f6e2bc';

function colorFor(id, hovered, selected) {
  if (selected === id) return ACCENT;
  if (hovered === id) return HOVER;
  return IDLE[id];
}

function bindPart(id, onHover, onSelect) {
  return {
    onPointerOver: (event) => {
      event.stopPropagation();
      onHover(id);
    },
    onPointerOut: (event) => {
      event.stopPropagation();
      onHover(null);
    },
    onClick: (event) => {
      event.stopPropagation();
      onSelect(id);
    },
  };
}

/**
 * One placeholder motion, so the stub exercises `reduced` the way every cover
 * must: the disc drifts, and stops under `prefers-reduced-motion`.
 *
 * @param {import('../../../src/lib/types.js').CoverProps} props
 */
export default function Cover({ hovered, selected, reduced, onHover, onSelect }) {
  const disc = useRef(null);
  const phase = useRef(0);

  useFrame((_, delta) => {
    const node = disc.current;
    if (!node || reduced) return;
    phase.current += Math.min(delta, 0.05);
    node.position.x = 0.3 + 0.08 * Math.sin(phase.current * 0.6);
  });

  return (
    <group position={[0, -0.4, 0]}>
      <mesh {...bindPart(PartId.stage, onHover, onSelect)}>
        <boxGeometry args={[2.2, 0.06, 1.4]} />
        <meshStandardMaterial color={colorFor(PartId.stage, hovered, selected)} roughness={0.9} />
      </mesh>
      <mesh position={[-0.35, 0.68, 0]} {...bindPart(PartId.sleeve, onHover, onSelect)}>
        <boxGeometry args={[1.24, 1.24, 0.02]} />
        <meshStandardMaterial color={colorFor(PartId.sleeve, hovered, selected)} roughness={0.7} />
      </mesh>
      <mesh
        ref={disc}
        position={[0.3, 0.68, -0.03]}
        rotation={[Math.PI / 2, 0, 0]}
        {...bindPart(PartId.vinyl, onHover, onSelect)}
      >
        <cylinderGeometry args={[0.6, 0.6, 0.01, 64]} />
        <meshStandardMaterial color={colorFor(PartId.vinyl, hovered, selected)} roughness={0.4} />
      </mesh>
    </group>
  );
}
