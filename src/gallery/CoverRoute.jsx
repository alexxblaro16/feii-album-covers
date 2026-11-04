import { Suspense, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import BudgetProbe from '../lib/BudgetProbe.jsx';
import { withinCeiling } from '../lib/budget.js';
import usePrefersReducedMotion from '../lib/usePrefersReducedMotion.js';
import { SCENE } from '../theme/tokens.js';
import CanvasErrorBoundary from './CanvasErrorBoundary.jsx';
import { findCover } from './registry.js';

// Same camera, DPR cap, and target as the Unit 8 sandbox, so a fork's
// Cover.jsx is framed here exactly as it was framed there.
const CAMERA = { position: [2.15, 1.35, 2.55], fov: 40 };
const DPR = [1, 1.5];
const LOOK_AT = [0, 0.35, 0];

/**
 * `/covers/:slug`. Looks the slug up in the registry; an unknown slug has no
 * route and gets a plain DOM message instead of a Canvas.
 */
export default function CoverRoute() {
  const { slug } = useParams();
  const cover = findCover(slug);

  if (!cover) {
    return (
      <main className="gallery">
        <h1>No cover at /covers/{slug}</h1>
        <p className="notice">
          {slug === '_template' ? (
            <>
              <code>_template</code> is never a route: copy it to <code>covers/&lt;slug&gt;/</code>.
            </>
          ) : (
            <>
              A route exists only when <code>covers/registry.json</code> lists the slug and{' '}
              <code>covers/{slug}/src/Cover.jsx</code> exists.
            </>
          )}{' '}
          See <code>CONTRIBUTING.md</code>.
        </p>
        <p>
          <Link to="/">All covers</Link>
        </p>
      </main>
    );
  }

  // key: another slug is another scene, so state and the WebGL context start fresh.
  return <CoverStage key={cover.slug} cover={cover} />;
}

/**
 * THE ROUTE CONTRACT (see CONTRIBUTING.md, "Route contract").
 *
 * This component owns the state the Unit 8 cover fork's App.jsx owned —
 * `hovered`, `selected`, and `reduced` (from `prefers-reduced-motion`) — and
 * passes the SAME five props to the route's default-export `Cover`, inside a
 * Canvas it supplies. `Cover.jsx` therefore has no `<Canvas>`, no state of its
 * own for these values, and no `BudgetProbe`: a fork `Cover.jsx` moves over
 * unchanged. The panel (parts buttons, `aria-live` note, budget line) lives
 * here too and reads the route's own `parts.js` and `budget.js`.
 *
 * @param {{ cover: import('./registry.js').GalleryCover }} props
 */
function CoverStage({ cover }) {
  const { Cover, parts, ceiling, slug, title, album, authors } = cover;
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

  const part = parts.find((item) => item.id === selected);
  const verdict = withinCeiling(budget, ceiling);

  return (
    <div className="stage">
      <CanvasErrorBoundary slug={slug}>
        <Canvas camera={CAMERA} dpr={DPR}>
          <color attach="background" args={[SCENE.background]} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[4, 6, 2]} intensity={2.4} />
          <directionalLight position={[-3, 2.2, -2]} intensity={0.55} />
          {/* The cover's chunk, and any useTexture inside it, suspend here. */}
          <Suspense fallback={null}>
            <Cover
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
      </CanvasErrorBoundary>
      <aside className="readout">
        <p className="crumb">
          <Link to="/">← All covers</Link>
        </p>
        <h1>{title}</h1>
        <p className="meta">
          {album}
          {authors.length > 0 ? ` · ${authors.join(', ')}` : ''}
        </p>
        {parts.length > 0 ? (
          <ul className="parts" aria-label="Parts of the cover">
            {parts.map((item) => (
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
            ? `calls ${budget.calls}${ceiling ? `/${ceiling.calls}` : ''} · triangles ${budget.triangles}${ceiling ? `/${ceiling.triangles}` : ''} · geometries ${budget.geometries} · textures ${budget.textures}`
            : 'Sampling…'}
          {verdict === true ? ' · within ceiling' : ''}
          {verdict === false ? ' · over ceiling' : ''}
          {budget && !ceiling ? ' · no CEILING in src/budget.js yet' : ''}
        </p>
      </aside>
    </div>
  );
}
