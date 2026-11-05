// covers/_studio/src/Route.jsx — instructor reference endpoint (D26).
// Reference route: sleeve shader + KTX2 compare. Not a prescribed student layout.

import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import BudgetProbe from '../../../src/lib/BudgetProbe.jsx';
import { withinCeiling } from '../../../src/lib/budget.js';
import usePrefersReducedMotion from '../../../src/lib/usePrefersReducedMotion.js';
import { SCENE } from '../../../src/theme/tokens.js';
import { CEILING } from './budget.js';
import { PARTS } from './parts.js';
import StudioScene from './StudioScene.jsx';
import './studio.css';

const CAMERA = { position: [2.15, 1.35, 2.55], fov: 40 };
const DPR = [1, 1.5];
const LOOK_AT = [0, 0.35, 0];

export default function Route() {
  const reduced = usePrefersReducedMotion();
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [budget, setBudget] = useState(null);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);

  useEffect(() => {
    document.documentElement.classList.add('route-_studio');
    return () => document.documentElement.classList.remove('route-_studio');
  }, []);

  const part = PARTS.find((item) => item.id === selected);
  const verdict = withinCeiling(budget, CEILING);

  return (
    <div className="studio-route stage">
      <Canvas camera={CAMERA} dpr={DPR}>
        <color attach="background" args={[SCENE.background]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[4, 6, 2]} intensity={2.4} />
        <directionalLight position={[-3, 2.2, -2]} intensity={0.55} />
        <Suspense fallback={null}>
          <StudioScene
            hovered={hovered}
            selected={selected}
            reduced={reduced}
            onHover={setHovered}
            onSelect={setSelected}
          />
        </Suspense>
        <BudgetProbe onSample={setBudget} />
        <OrbitControls enablePan={false} target={LOOK_AT} />
      </Canvas>
      <aside className="readout">
        <h1>Studio reference — Signal &amp; Grain</h1>
        <p className="meta">Original sleeve made for this repository (not an album cover)</p>
        {PARTS.length > 0 ? (
          <ul className="parts" aria-label="Parts of the cover">
            {PARTS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  aria-pressed={selected === item.id}
                  onClick={() => setSelected(item.id)}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <p aria-live="polite">
          {part ? part.note : 'Click a mesh or a button. Both write the same state.'}
        </p>
        <p className="meta">Hover: {hovered ?? '—'}</p>
        <p className={verdict === false ? 'budget over' : 'budget'}>
          {budget
            ? `calls ${budget.calls}/${CEILING.calls} · triangles ${budget.triangles}/${CEILING.triangles} · geometries ${budget.geometries} · textures ${budget.textures}`
            : 'Sampling…'}
          {verdict === true ? ' · within ceiling' : ''}
          {verdict === false ? ' · over ceiling' : ''}
        </p>
      </aside>
    </div>
  );
}
