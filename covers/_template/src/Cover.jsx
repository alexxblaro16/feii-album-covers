// covers/<slug>/src/Cover.jsx — your route's scene. Copied from the Unit 8 lab's
// cover Template, unchanged below this comment, so the cover fork's Cover.jsx
// can replace this file as it is.
//
// Route contract (CONTRIBUTING.md): the gallery's /covers/:slug route owns the
// state and renders <Cover hovered selected reduced onHover onSelect /> inside
// its own <Canvas>, exactly as the fork's App.jsx did. So this file:
//   - default-exports one component that takes those five props;
//   - has no <Canvas>, no BudgetProbe, no router, no state for those five values;
//   - imports only from its own folder (./parts.js, ./sleevePicture.js, …) and npm.
// Its picture lives in ../public/ and is referenced relative to this folder:
// see ./sleevePicture.js. Task1 keeps the sleeve a flat colour (Unit 8).

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PartId } from './parts.js';

const ACCENT = '#e36a2c';
const HOVER = '#f6e2bc';

function colorFor(id, hovered, selected, idle) {
  if (selected === id) return ACCENT;
  if (hovered === id) return HOVER;
  return idle;
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

export default function Cover({ hovered, selected, reduced, onHover, onSelect }) {
  const disc = useRef(null);
  const phase = useRef(0);

  useFrame((_, delta) => {
    const node = disc.current;
    if (!node || reduced) return;
    phase.current += Math.min(delta, 0.05);
    // The disc slides part-way out of the sleeve and back. No allocation, one position write.
    node.position.x = 0.3 + 0.12 * Math.sin(phase.current * 0.8);
  });

  return (
    <group position={[0, -0.4, 0]}>
      <mesh {...bindPart(PartId.stage, onHover, onSelect)}>
        <boxGeometry args={[2.2, 0.06, 1.4]} />
        <meshStandardMaterial
          color={colorFor(PartId.stage, hovered, selected, '#2b2723')}
          roughness={0.9}
        />
      </mesh>

      <mesh position={[-0.35, 0.68, 0]} {...bindPart(PartId.sleeve, onHover, onSelect)}>
        <boxGeometry args={[1.24, 1.24, 0.02]} />
        <meshStandardMaterial
          color={colorFor(PartId.sleeve, hovered, selected, '#cfc6ba')}
          roughness={0.7}
        />
      </mesh>

      <mesh
        ref={disc}
        position={[0.3, 0.68, -0.03]}
        rotation={[Math.PI / 2, 0, 0]}
        {...bindPart(PartId.vinyl, onHover, onSelect)}
      >
        <cylinderGeometry args={[0.6, 0.6, 0.01, 64]} />
        <meshStandardMaterial
          color={colorFor(PartId.vinyl, hovered, selected, '#141210')}
          metalness={0.2}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}
