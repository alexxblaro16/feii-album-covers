// /covers/off-the-wall — Michael Jackson, Off the Wall (1979).
// La portada como plató 3D: se abre en el encuadre de la portada y se puede
// rodear a Michael, ponerse detrás de él y descubrir la sesión de fotos.
// React lleva el estado y el DOM (título, botones, textos); Scene.jsx, el 3D.
// Todo está modelado con código: no hay ninguna foto de la portada original.

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import BudgetProbe from '../../../src/lib/BudgetProbe.jsx';
import { withinCeiling } from '../../../src/lib/budget.js';
import usePrefersReducedMotion from '../../../src/lib/usePrefersReducedMotion.js';
import { CEILING } from './budget.js';
import { createGroove } from './groove.js';
import Scene from './Scene.jsx';
import { FOV, VIEWS, coverPosition } from './set.js';
import './route.css';

const SCOPE = 'route-off-the-wall';
const FONTS = 'https://fonts.googleapis.com/css2?family=Yellowtail&family=Oswald:wght@400;600&display=swap';
const DPR = [1, 1.5];

const TRACKS = [
  "Don't Stop 'Til You Get Enough",
  'Rock with You',
  "Workin' Day and Night",
  'Get on the Floor',
  'Off the Wall',
  'Girlfriend',
  "She's Out of My Life",
  "I Can't Help It",
  "It's the Falling in Love",
  'Burn This Disco Out',
];

/** Lo que se cuenta según desde dónde se mire (se lee en voz alta con aria-live). */
const CAPTIONS = {
  cover: 'La portada: Michael sonríe delante de la pared de ladrillo, con esmoquin, pajarita y calcetines blancos.',
  front: 'Arrastra para girar, usa la rueda para acercarte y WASD o las flechas para caminar por el plató.',
  side: 'De lado ya no es una foto: la pared es de ladrillo de verdad, uno a uno, y Michael tiene volumen.',
  behind:
    'Por detrás de Michael: el plató. La cámara en su trípode, las ventanas de luz y el reflector, lo que nunca sale en la portada.',
};

export default function Route() {
  const reduced = usePrefersReducedMotion();
  const [view, setView] = useState(/** @type {{ name: string, at: number } | null} */ (null));
  const [zone, setZone] = useState('cover');
  const [stepAt, setStepAt] = useState(/** @type {number | null} */ (null));
  const [flashAt, setFlashAt] = useState(/** @type {number | null} */ (null));
  const [flashing, setFlashing] = useState(false);
  const [groove, setGroove] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [budget, setBudget] = useState(null);
  // En el móvil el panel empieza plegado para dejar ver a Michael.
  const [panelOpen, setPanelOpen] = useState(() => !window.matchMedia('(max-width: 720px)').matches);
  const [notice, setNotice] = useState('');
  const music = useMemo(() => createGroove(), []);
  const timers = useRef(/** @type {number[]} */ ([]));

  // Clase de ámbito, fuentes y limpieza completa al salir de la ruta.
  useEffect(() => {
    document.documentElement.classList.add(SCOPE);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONTS;
    document.head.appendChild(link);
    const pending = timers.current;
    return () => {
      document.documentElement.classList.remove(SCOPE);
      link.remove();
      pending.forEach((id) => window.clearTimeout(id));
      music.stop();
      document.body.style.cursor = 'auto';
    };
  }, [music]);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
  }, [hovered]);

  const later = (fn, ms) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  // `at` cuenta las peticiones: repetir la misma vista vuelve a llevar la cámara.
  const goTo = (name) => setView((v) => ({ name, at: (v?.at ?? 0) + 1 }));

  const step = useCallback(() => {
    setStepAt(performance.now() / 1000);
    setNotice('Michael se pone de puntillas y saluda.');
  }, []);

  const takePhoto = () => {
    goTo('cover');
    // Primero llega la cámara al encuadre de la portada; después, el destello.
    later(
      () => {
        setFlashAt(performance.now() / 1000);
        setFlashing(true);
        setNotice('Foto hecha: así se ve la portada desde la cámara del plató.');
        later(() => setFlashing(false), 700);
      },
      reduced ? 0 : 1500,
    );
  };

  const toggleGroove = async () => {
    if (groove) {
      music.stop();
      setGroove(false);
      setNotice('Groove apagado.');
    } else {
      await music.start();
      setGroove(true);
      setNotice('Suena un groove disco hecho en el navegador. Michael lleva el ritmo.');
    }
  };

  const verdict = withinCeiling(budget, CEILING);
  const showBudget = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('budget');
  const initial = useMemo(() => coverPosition(window.innerWidth, window.innerHeight), []);

  return (
    <div className={`otw ${zone === 'cover' ? 'otw--framed' : ''}`}>
      <Canvas
        className="otw__canvas"
        shadows="percentage"
        dpr={DPR}
        camera={{ position: initial, fov: FOV, near: 0.05, far: 40 }}
        aria-label="Escena 3D: Michael Jackson delante de una pared de ladrillo, en un plató de fotos"
      >
        <Suspense fallback={null}>
          <Scene
            view={view}
            stepAt={stepAt}
            flashAt={flashAt}
            groove={groove}
            beat={music.beat}
            reduced={reduced}
            onZone={setZone}
            onStep={step}
            onHover={setHovered}
          />
        </Suspense>
        <BudgetProbe onSample={setBudget} />
      </Canvas>

      {/* Encuadre cuadrado de la portada: aparece cuando se mira de frente. */}
      <div className="otw__frame" aria-hidden="true">
        <span className="otw__frame-artist">Michael Jackson</span>
        <span className="otw__frame-title">Off the Wall</span>
      </div>
      <div className={`otw__flash ${flashing ? 'is-on' : ''}`} aria-hidden="true" />

      <aside className={`otw__panel ${panelOpen ? '' : 'is-closed'}`} aria-label="Controles de la portada">
        <header className="otw__head">
          <p className="otw__artist">Michael Jackson</p>
          <h1 className="otw__title">Off the Wall</h1>
          <p className="otw__meta">Epic Records · 1979 · producido por Quincy Jones</p>
          <button
            type="button"
            className="otw__toggle"
            aria-expanded={panelOpen}
            aria-controls="otw-body"
            onClick={() => setPanelOpen((v) => !v)}
          >
            {panelOpen ? 'Ocultar' : 'Controles'}
          </button>
        </header>

        <div id="otw-body" className="otw__body" hidden={!panelOpen}>
          <fieldset className="otw__group">
            <legend>Ir a</legend>
            {Object.entries(VIEWS).map(([name, v]) => (
              <button key={name} type="button" aria-pressed={zone === name} onClick={() => goTo(name)}>
                {v.label}
              </button>
            ))}
          </fieldset>

          <fieldset className="otw__group">
            <legend>Hacer</legend>
            <button type="button" onClick={step}>
              Hacer un paso
            </button>
            <button type="button" onClick={takePhoto}>
              Hacer la foto
            </button>
            <button type="button" aria-pressed={groove} onClick={toggleGroove}>
              {groove ? 'Parar el groove' : 'Poner el groove'}
            </button>
          </fieldset>

          <p className="otw__caption" aria-live="polite">
            {CAPTIONS[zone]}
          </p>
          <p className="otw__notice" aria-live="polite">
            {notice}
          </p>
          <p className="otw__help">
            Ratón o dedo: girar · rueda o pellizco: acercar · <kbd>W</kbd>
            <kbd>A</kbd>
            <kbd>S</kbd>
            <kbd>D</kbd> o flechas: caminar · clic en Michael: un paso
          </p>

          <details className="otw__tracks">
            <summary>Canciones del disco</summary>
            <ol>
              {TRACKS.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
          </details>

          {showBudget ? (
            <p className={verdict === false ? 'otw__budget is-over' : 'otw__budget'}>
              {budget
                ? `calls ${budget.calls} · triangles ${budget.triangles} · geometries ${budget.geometries} · textures ${budget.textures}`
                : 'Midiendo…'}
              {verdict === true ? ' · dentro del techo' : ''}
              {verdict === false ? ' · por encima del techo' : ''}
            </p>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
