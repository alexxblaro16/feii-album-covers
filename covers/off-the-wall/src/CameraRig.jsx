// Cámara de la ruta: girar con el ratón o el dedo (OrbitControls), zoom hacia
// el cursor con la rueda o el pellizco, caminar con WASD o las flechas (con
// Mayúsculas se corre), subir y bajar con Q y E, acercarse con + y −, y
// viajar a las vistas con nombre de set.js. La cruceta táctil y los botones
// de zoom del panel mandan las mismas teclas (eventos `otw-key` / `otw-zoom`).
// Nunca se atraviesa la pared ni a Michael. Avisa (onZone) solo cuando cambia
// la zona desde la que se mira: delante, de lado o por detrás.

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { BOUNDS, MICHAEL, VIEWS, coverPosition } from './set.js';

const WALK_SPEED = 1.7; // metros por segundo
const RUN = 2.6; // multiplicador con Mayúsculas
const LIFT_SPEED = 1.1; // subir y bajar, metros por segundo
// Cuánto acerca o aleja cada pulsación de zoom (fracción de la distancia).
const ZOOM_STEP = 0.18;
// El punto al que se mira puede acercarse a la pared, pero no cruzarla.
const WALL_LIMIT = BOUNDS.minZ - 0.2;
const KEYS = {
  KeyW: 'f', ArrowUp: 'f',
  KeyS: 'b', ArrowDown: 'b',
  KeyA: 'l', ArrowLeft: 'l',
  KeyD: 'r', ArrowRight: 'r',
  KeyE: 'u',
  KeyQ: 'd',
};

/** Zona según el ángulo entre la cámara y el frente de Michael. */
function zoneOf(cam) {
  const dx = cam.x - MICHAEL.x;
  const dz = cam.z - MICHAEL.z;
  const angle = Math.abs((Math.atan2(dx, dz) * 180) / Math.PI);
  if (angle > 115) return 'behind';
  if (angle > 55) return 'side';
  if (angle < 14 && dz > 3.4) return 'cover';
  return 'front';
}

/**
 * @param {{
 *   view: { name: string, at: number } | null,
 *   reduced: boolean,
 *   onZone: (zone: string) => void,
 * }} props
 */
export default function CameraRig({ view, reduced, onZone }) {
  const controls = useRef(null);
  const size = useThree((s) => s.size);
  const goal = useRef(null);
  const pressed = useRef(new Set());
  const zone = useRef('');
  const running = useRef(false);
  // Zoom pendiente de los botones o de + y −: se aplica suave en useFrame.
  const zoom = useRef(0);
  // Vectores reutilizados: nada se crea dentro de useFrame.
  const tmp = useRef({ fwd: new Vector3(), right: new Vector3(), move: new Vector3(), up: new Vector3(0, 1, 0) });

  // Al pedir una vista, se fija el destino; useFrame hace el viaje.
  useEffect(() => {
    if (!view) return;
    const v = VIEWS[view.name];
    // La portada depende del tamaño de la pantalla (encuadre cuadrado).
    const pos = view.name === 'cover' ? coverPosition(size.width, size.height) : v.position;
    goal.current = { position: new Vector3(...pos), target: new Vector3(...v.target) };
    // Solo al pedir otra vista: un cambio de tamaño no debe mover la cámara.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // Teclado para caminar. Se ignora si se escribe en un campo o hay modificadores.
  useEffect(() => {
    const down = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      running.current = e.shiftKey;
      if (e.key === '+' || e.code === 'NumpadAdd') zoom.current += 1;
      if (e.key === '-' || e.code === 'NumpadSubtract') zoom.current -= 1;
      const dir = KEYS[e.code];
      if (!dir) return;
      // Las flechas no deben desplazar la página mientras se camina.
      e.preventDefault();
      pressed.current.add(dir);
      goal.current = null;
    };
    const up = (e) => {
      running.current = e.shiftKey;
      const dir = KEYS[e.code];
      if (dir) pressed.current.delete(dir);
    };
    const clear = () => pressed.current.clear();
    // Cruceta táctil: { dir, on } con las mismas direcciones que el teclado.
    const pad = (e) => {
      if (e.detail.on) {
        pressed.current.add(e.detail.dir);
        goal.current = null;
      } else pressed.current.delete(e.detail.dir);
    };
    const zoomBtn = (e) => {
      zoom.current += e.detail;
      goal.current = null;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', clear);
    window.addEventListener('otw-key', pad);
    window.addEventListener('otw-zoom', zoomBtn);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', clear);
      window.removeEventListener('otw-key', pad);
      window.removeEventListener('otw-zoom', zoomBtn);
    };
  }, []);

  useFrame(({ camera }, rawDelta) => {
    const c = controls.current;
    if (!c) return;
    const dt = Math.min(rawDelta, 0.05);
    const { fwd, right, move, up } = tmp.current;

    // 1. Viaje a una vista con nombre (salto directo si hay reducción de movimiento).
    if (goal.current) {
      const k = reduced ? 1 : 1 - Math.exp(-dt * 3.2);
      camera.position.lerp(goal.current.position, k);
      c.target.lerp(goal.current.target, k);
      if (camera.position.distanceTo(goal.current.position) < 0.01) goal.current = null;
    }

    // 2. Caminar: adelante/atrás según hacia dónde mira la cámara, sobre el suelo.
    if (pressed.current.size) {
      camera.getWorldDirection(fwd);
      fwd.y = 0;
      fwd.normalize();
      right.crossVectors(fwd, up).normalize();
      move.set(0, 0, 0);
      if (pressed.current.has('f')) move.add(fwd);
      if (pressed.current.has('b')) move.sub(fwd);
      if (pressed.current.has('r')) move.add(right);
      if (pressed.current.has('l')) move.sub(right);
      if (move.lengthSq() > 0) {
        move.normalize().multiplyScalar(WALK_SPEED * (running.current ? RUN : 1) * dt);
        camera.position.add(move);
        c.target.add(move);
      }
      // Subir (E) y bajar (Q): la cámara y el punto al que mira, juntos.
      const lift = (pressed.current.has('u') ? 1 : 0) - (pressed.current.has('d') ? 1 : 0);
      if (lift) {
        camera.position.y += lift * LIFT_SPEED * dt;
        c.target.y += lift * LIFT_SPEED * dt;
      }
    }

    // 2b. Zoom de los botones y de + y −: acerca o aleja hacia el punto mirado,
    // repartido en varios fotogramas para que sea suave.
    if (Math.abs(zoom.current) > 0.01) {
      const step = reduced ? zoom.current : zoom.current * Math.min(1, dt * 9);
      zoom.current -= step;
      const dist = camera.position.distanceTo(c.target);
      const next = Math.min(c.maxDistance, Math.max(c.minDistance, dist * (1 - step * ZOOM_STEP)));
      move.subVectors(camera.position, c.target).setLength(next);
      camera.position.copy(c.target).add(move);
    }

    // 3. Límites del plató: ni dentro de la pared, ni fuera, ni bajo el suelo.
    const p = camera.position;
    p.x = Math.min(BOUNDS.maxX, Math.max(BOUNDS.minX, p.x));
    p.z = Math.min(BOUNDS.maxZ, Math.max(BOUNDS.minZ, p.z));
    p.y = Math.min(BOUNDS.maxY, Math.max(BOUNDS.minY, p.y));
    // ...ni dentro de Michael: se empuja la cámara hacia fuera de un círculo.
    const dx = p.x - MICHAEL.x;
    const dz = p.z - MICHAEL.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.5 && p.y < 2) {
      const s = 0.5 / (d || 1);
      p.x = MICHAEL.x + dx * s;
      p.z = MICHAEL.z + (d ? dz * s : 0.5);
    }
    const t = c.target;
    t.x = Math.min(BOUNDS.maxX, Math.max(BOUNDS.minX, t.x));
    t.z = Math.min(BOUNDS.maxZ, Math.max(WALL_LIMIT, t.z));
    t.y = Math.min(2.6, Math.max(0.2, t.y));
    c.update();

    // 4. Zona: solo se avisa al cambiar, no en cada fotograma.
    const z = zoneOf(p);
    if (z !== zone.current) {
      zone.current = z;
      onZone(z);
    }
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      target={VIEWS.cover.target}
      enablePan={false}
      enableDamping={!reduced}
      dampingFactor={0.08}
      minDistance={0.35}
      maxDistance={10.5}
      maxPolarAngle={1.53}
      zoomToCursor
      zoomSpeed={0.9}
      rotateSpeed={0.7}
      onStart={() => {
        goal.current = null;
      }}
    />
  );
}
