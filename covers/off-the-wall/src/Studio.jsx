// Lo que nunca sale en la portada: el plató de la sesión de fotos.
// Se descubre al ponerse detrás de Michael o al pedir la vista "El plató":
// cámara en trípode, dos ventanas de luz, un reflector y la marca en el suelo.
// Al hacer la foto, las ventanas de luz destellan (prop `flash`).
//
// Rendimiento: el plató se monta una vez como un árbol de three y se "hornea":
// todas las piezas con el mismo material se funden en una sola geometría. Son
// 7 llamadas de dibujo en vez de unas 25, y así la vista "El plató" cabe en el
// tope de móvil. Nada del plató proyecta sombra.

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  BoxGeometry,
  CircleGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
} from 'three';

/** Materiales del plató (uno por grupo horneado). */
function makeMaterials() {
  return {
    metal: new MeshStandardMaterial({ color: '#2b2b2e', roughness: 0.35, metalness: 0.85 }),
    black: new MeshStandardMaterial({ color: '#141416', roughness: 0.55, side: DoubleSide }),
    body: new MeshStandardMaterial({ color: '#1d1d20', roughness: 0.4, metalness: 0.3 }),
    glass: new MeshStandardMaterial({ color: '#0a1420', roughness: 0.05, metalness: 0.6 }),
    silver: new MeshStandardMaterial({ color: '#cfd2d6', roughness: 0.25, metalness: 0.9, side: DoubleSide }),
    tape: new MeshStandardMaterial({ color: '#e8c33a', roughness: 0.7 }),
    // Tela difusora de las ventanas de luz: emite, y el destello la sube.
    diffuser: new MeshStandardMaterial({ color: '#ffffff', emissive: '#fff4e2', emissiveIntensity: 1.6, side: DoubleSide }),
  };
}

/** Pieza suelta con su posición y giro; `mat` dice en qué grupo se funde. */
function part(parent, geometry, mat, position = [0, 0, 0], rotation = [0, 0, 0]) {
  const m = new Mesh(geometry);
  m.position.set(...position);
  m.rotation.set(...rotation);
  m.userData.mat = mat;
  parent.add(m);
  return m;
}

function node(parent, position = [0, 0, 0], rotation = [0, 0, 0]) {
  const g = new Group();
  g.position.set(...position);
  g.rotation.set(...rotation);
  parent.add(g);
  return g;
}

/** Pie de estudio de tres patas con una columna central. */
function stand(parent, height) {
  for (let i = 0; i < 3; i += 1) {
    const leg = node(parent, [0, 0, 0], [0, (i / 3) * Math.PI * 2, 0]);
    part(leg, new CylinderGeometry(0.011, 0.011, 0.5, 8), 'metal', [0, 0.19, 0.16], [-0.72, 0, 0]);
  }
  part(parent, new CylinderGeometry(0.016, 0.02, height, 10), 'metal', [0, height / 2, 0]);
}

/** Ventana de luz (softbox) que apunta a Michael. */
function softbox(parent, position, rotationY) {
  const g = node(parent, position, [0, rotationY, 0]);
  stand(g, 1.7);
  const head = node(g, [0, 1.75, 0], [0.12, 0, 0]);
  // Caja negra de tela en forma de pirámide; el difusor blanco la cierra delante.
  part(head, new CylinderGeometry(0.36, 0.08, 0.34, 4, 1), 'black', [0, 0, -0.18], [Math.PI / 2, Math.PI / 4, 0]);
  part(head, new PlaneGeometry(0.5, 0.5), 'diffuser', [0, 0, -0.01]);
}

/** Cámara de medio formato sobre trípode, mirando a Michael. */
function camera(parent) {
  const g = node(parent, [0.9, 0, 3.9], [0, Math.PI + 0.23, 0]);
  stand(g, 1.0);
  const body = node(g, [0, 1.07, 0]);
  part(body, new BoxGeometry(0.15, 0.13, 0.12), 'body');
  part(body, new BoxGeometry(0.1, 0.05, 0.09), 'black', [0, 0.085, -0.01]);
  part(body, new CylinderGeometry(0.042, 0.048, 0.12, 20), 'black', [0, 0, 0.11], [Math.PI / 2, 0, 0]);
  part(body, new CylinderGeometry(0.036, 0.036, 0.006, 20), 'glass', [0, 0, 0.172], [Math.PI / 2, 0, 0]);
}

/** Monta el plató y funde las piezas por material. */
function bakeStudio() {
  const root = new Group();
  softbox(root, [-2.1, 0, 2.7], Math.PI - 0.66);
  softbox(root, [2.3, 0, 2.2], Math.PI + 0.82);
  camera(root);
  // Reflector plateado en el suelo, a la izquierda de Michael.
  part(root, new CircleGeometry(0.42, 40), 'silver', [-1.7, 0.42, 2.0], [-0.35, 2.44, 0]);
  // Marca en cruz donde se coloca Michael.
  for (const r of [0.6, -0.6]) part(root, new PlaneGeometry(0.32, 0.035), 'tape', [0, 0.002, 0.04], [-Math.PI / 2, 0, r]);

  root.updateMatrixWorld(true);
  /** @type {Record<string, import('three').BufferGeometry[]>} */
  const groups = {};
  root.traverse((o) => {
    if (!o.isMesh) return;
    const g = o.geometry.clone().applyMatrix4(o.matrixWorld);
    o.geometry.dispose();
    (groups[o.userData.mat] ??= []).push(g);
  });
  return Object.fromEntries(
    Object.entries(groups).map(([mat, list]) => {
      const merged = mergeGeometries(list);
      list.forEach((g) => g.dispose());
      return [mat, merged];
    }),
  );
}

/** @param {{ flash: number | null }} props  `flash` = instante (s) de la última foto. */
export default function Studio({ flash }) {
  const res = useMemo(() => ({ mats: makeMaterials(), geos: bakeStudio() }), []);
  useEffect(
    () => () => {
      Object.values(res.mats).forEach((m) => m.dispose());
      Object.values(res.geos).forEach((g) => g.dispose());
    },
    [res],
  );
  // Malla de los difusores: el destello cambia su material a través de la ref.
  const diffuser = useRef(/** @type {import('three').Mesh | null} */ (null));

  useFrame(() => {
    // Destello corto: los difusores suben mucho y vuelven en 0,4 s.
    let k = 0;
    if (flash !== null) {
      const dt = performance.now() / 1000 - flash;
      if (dt >= 0 && dt < 0.4) k = 1 - dt / 0.4;
    }
    if (diffuser.current) diffuser.current.material.emissiveIntensity = 1.6 + k * 10;
  });

  return (
    <group>
      {Object.entries(res.geos).map(([mat, geo]) => (
        <mesh
          key={mat}
          ref={mat === 'diffuser' ? diffuser : undefined}
          geometry={geo}
          material={res.mats[mat]}
          receiveShadow={mat === 'tape'}
        />
      ))}
    </group>
  );
}
