// Michael tal y como sale en la portada: esmoquin negro, camisa blanca,
// pajarita, calcetines blancos, mocasines y la sonrisa.
// Figura modelada solo con código (perfiles de torno y piezas sencillas):
// es una interpretación propia, no un escaneo ni una foto.
//
// Animación (en useFrame, sin estado de React por fotograma):
//  - en reposo respira y balancea un poco el peso;
//  - cuando suena una canción del disco sigue los graves;
//  - cuatro pasos de baile (POSES): la vuelta de dos giros que acaba de
//    puntillas, las puntillas con el brazo arriba, la patada y deslizarse
//    hacia atrás alternando los talones.
// Con prefers-reduced-motion no hay movimiento: se enseña el paso quieto.

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  BufferGeometry,
  CapsuleGeometry,
  CircleGeometry,
  Color,
  DoubleSide,
  Euler,
  Float32BufferAttribute,
  IcosahedronGeometry,
  LatheGeometry,
  Matrix4,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Quaternion,
  SphereGeometry,
  Vector2,
  Vector3,
} from 'three';
import { movePose } from './dances.js';
import { MICHAEL } from './set.js';

// Aplastamiento del torso de delante a atrás (un cuerpo no es un cilindro).
const FLAT = 0.62;
// Altura de la cadera: el resto del cuerpo cuelga de aquí.
const HIP_Y = 0.92;
// Postura de reposo (propia, no calcada de la foto): peso cargado en la
// pierna izquierda, cadera y hombros compensados, cabeza ladeada hacia la
// cámara con la sonrisa, y codos algo doblados, relajado y seguro.
const REST = { hip: 0.035, shoulders: -0.05, headTilt: 0.07, headTurn: 0.08, elbow: -0.38, legOut: 0.045 };

// Perfil de la chaqueta: [radio, altura] desde el bajo hasta el cuello.
const JACKET = [
  [0.0, -0.12],
  [0.188, -0.11],
  [0.198, -0.02],
  [0.184, 0.1],
  [0.19, 0.22],
  [0.214, 0.36],
  [0.228, 0.46],
  [0.218, 0.52],
  [0.16, 0.565],
  [0.075, 0.59],
  [0.0, 0.6],
];

/** Radio de la chaqueta a una altura dada (interpolando el perfil). */
function jacketRadius(y) {
  for (let i = 1; i < JACKET.length; i += 1) {
    const [r1, y1] = JACKET[i];
    const [r0, y0] = JACKET[i - 1];
    if (y <= y1) {
      const t = (y - y0) / (y1 - y0 || 1);
      return r0 + (r1 - r0) * Math.max(0, Math.min(1, t));
    }
  }
  return 0;
}

/**
 * Banda pegada a la superficie de la chaqueta, de y0 a y1, entre dos ángulos
 * que dependen de la altura (0 = el centro del pecho). Sirve para la pechera
 * en V y para las solapas, que así siguen la curva del cuerpo.
 */
function chestBand(y0, y1, from, to, lift) {
  const rows = 14;
  const cols = 10;
  const pos = [];
  const index = [];
  for (let j = 0; j <= rows; j += 1) {
    const y = y0 + ((y1 - y0) * j) / rows;
    const a0 = from(y);
    const a1 = to(y);
    const r = jacketRadius(y) + lift;
    for (let i = 0; i <= cols; i += 1) {
      const a = a0 + ((a1 - a0) * i) / cols;
      pos.push(r * Math.sin(a), y, r * Math.cos(a) * FLAT);
    }
  }
  for (let j = 0; j < rows; j += 1) {
    for (let i = 0; i < cols; i += 1) {
      const a = j * (cols + 1) + i;
      const b = a + cols + 1;
      index.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

/**
 * Pelo afro: una esfera muy subdividida con dos capas de bultos deterministas,
 * una ancha (la forma) y una fina (los rizos). Se fusionan los vértices para
 * que el sombreado sea suave y los rizos se vean por la luz, no por facetas.
 */
function afroGeometry() {
  const base = new IcosahedronGeometry(0.17, 18);
  base.deleteAttribute('normal');
  base.deleteAttribute('uv');
  const g = mergeVertices(base);
  base.dispose();
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i += 1) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const len = Math.hypot(x, y, z);
    const nx = x / len;
    const ny = y / len;
    const nz = z / len;
    // Ruido barato y estable: la misma dirección da siempre el mismo bulto,
    // así los vértices repetidos de la malla no se separan. La forma general
    // es casi una bola (el afro de 1979 era redondo y uniforme); los rizos,
    // pequeños y apretados.
    const broad = Math.sin(nx * 5.1 + ny * 2.3) * Math.cos(ny * 4.7 - nz * 3.2) * 0.015;
    const curls =
      Math.sin(nx * 83.3 + ny * 27.9) * Math.cos(ny * 77.1 - nz * 33.4) * Math.sin(nz * 69.7 + nx * 23.1) * 0.03 +
      Math.sin(nx * 151.7 - nz * 41.3) * Math.cos(ny * 139.2 + nx * 19.6) * 0.012;
    // Hueco de la cara: delante y por debajo de la frente el pelo se mete
    // hacia dentro, para que el afro enmarque la cara en vez de taparla.
    const front = Math.max(0, Math.min(1, (nz - 0.05) / 0.45));
    const low = Math.max(0, Math.min(1, (0.4 - ny) / 0.3));
    const face = front * low;
    // Por debajo de la nuca se cierra hacia el cuello.
    const neck = Math.max(0, Math.min(1, (-0.45 - ny) / 0.35));
    const k = (1 + broad + curls) * (1 - 0.52 * face) * (1 - 0.35 * neck);
    p.setXYZ(i, nx * 0.17 * k, ny * 0.17 * k, nz * 0.17 * k);
  }
  g.computeVertexNormals();
  return g;
}

/** Coloca una geometría (posición, giro y escala) para fundirla con otras. */
function place(geo, pos, rot = [0, 0, 0], scale = [1, 1, 1]) {
  const m = new Matrix4().compose(
    new Vector3(...pos),
    new Quaternion().setFromEuler(new Euler(...rot)),
    new Vector3(...scale),
  );
  geo.applyMatrix4(m);
  return geo;
}

/** Funde varias piezas en una sola geometría y libera las piezas sueltas. */
function fuse(parts) {
  const g = mergeGeometries(parts);
  parts.forEach((x) => x.dispose());
  return g;
}

/**
 * Piezas de la cara agrupadas por material: piel (cráneo, mandíbula, orejas,
 * párpados, pómulos y nariz), blanco de los ojos, iris, pelo fino (cejas y
 * patillas), labios y dientes.
 */
function headGeometries() {
  const sides = [-1, 1];
  return {
    headSkin: fuse([
      place(new SphereGeometry(0.105, 32, 24), [0, 0, 0], [0, 0, 0], [0.86, 1.1, 0.96]),
      place(new SphereGeometry(0.1, 28, 20), [0, -0.04, 0.014], [0, 0, 0], [0.84, 0.82, 0.9]),
      ...sides.flatMap((s) => [
        place(new SphereGeometry(0.03, 12, 10), [s * 0.096, -0.005, -0.005], [0, 0, 0], [0.45, 1, 0.75]),
        // Párpado de arriba: da la mirada sonriente.
        place(new SphereGeometry(0.019, 14, 8), [s * 0.036, 0.027, 0.091], [0, 0, s * 0.12], [1.35, 0.28, 0.5]),
        // Pómulo marcado.
        place(new SphereGeometry(0.022, 14, 10), [s * 0.045, -0.016, 0.06], [0, 0, 0], [1, 0.7, 0.55]),
      ]),
      // Nariz fina: puente estrecho y punta pequeña.
      place(new SphereGeometry(0.012, 12, 10), [0, 0.006, 0.1], [0, 0, 0], [0.55, 1.6, 0.6]),
      place(new SphereGeometry(0.014, 14, 10), [0, -0.014, 0.106], [0, 0, 0], [1.25, 0.8, 0.8]),
    ]),
    // Ojos grandes y algo almendrados, con el iris oscuro casi entero.
    eyeWhites: fuse(
      sides.map((s) => place(new SphereGeometry(0.018, 14, 10), [s * 0.036, 0.014, 0.086], [0, 0, s * 0.12], [1.3, 0.78, 0.6])),
    ),
    irises: fuse(sides.map((s) => place(new SphereGeometry(0.0105, 12, 10), [s * 0.035, 0.014, 0.096], [0, 0, 0], [1, 1, 0.7]))),
    hairBits: fuse(
      sides.flatMap((s) => [
        // Cejas gruesas y arqueadas.
        place(new CapsuleGeometry(0.005, 0.03, 4, 8), [s * 0.038, 0.046, 0.092], [0, s * 0.25, Math.PI / 2 - s * 0.16]),
        // Patillas: el pelo baja por delante de la oreja.
        place(new SphereGeometry(0.03, 12, 10), [s * 0.088, -0.005, 0.03], [0, 0, 0], [0.5, 1.4, 0.9]),
      ]),
    ),
    // La sonrisa amplia: boca abierta en media luna con los dientes de arriba.
    lips: fuse([
      place(new CircleGeometry(0.04, 28, Math.PI, Math.PI), [0, -0.046, 0.097], [-0.3, 0, 0], [1, 0.62, 1]),
      place(new CapsuleGeometry(0.006, 0.062, 4, 8), [0, -0.0435, 0.097], [0, 0, Math.PI / 2], [0.55, 1.25, 0.6]),
    ]),
    teeth: place(new CircleGeometry(0.038, 28, Math.PI, Math.PI), [0, -0.0465, 0.0985], [-0.3, 0, 0], [0.92, 0.36, 1]),
  };
}

/** Pernera del pantalón (torno): de la cadera al bajo, algo más estrecha abajo. */
function trouserGeometry() {
  const pts = [
    [0.0, 0.0],
    [0.088, -0.02],
    [0.092, -0.12],
    [0.08, -0.38],
    [0.068, -0.46],
    [0.066, -0.7],
    [0.064, -0.76],
    [0.0, -0.765],
  ].map(([r, y]) => new Vector2(r, y));
  return new LatheGeometry(pts, 32);
}

/** Materiales compartidos de la figura (se crean una vez y se liberan al salir). */
function useMaterials() {
  const mats = useMemo(
    () => ({
      // Paño negro del esmoquin: rugoso, con un poco de "sheen" de lana.
      wool: new MeshPhysicalMaterial({
        color: '#111013',
        roughness: 0.78,
        sheen: 0.6,
        sheenRoughness: 0.6,
        sheenColor: new Color('#3a3740'),
      }),
      // Raso de solapas y pajarita: brilla con la luz del estudio.
      satin: new MeshPhysicalMaterial({
        color: '#0b0a0c',
        roughness: 0.28,
        clearcoat: 0.6,
        clearcoatRoughness: 0.35,
        side: DoubleSide,
      }),
      shirt: new MeshStandardMaterial({ color: '#f3f1ec', roughness: 0.62, side: DoubleSide }),
      sock: new MeshStandardMaterial({ color: '#fbfaf6', roughness: 0.85 }),
      // Piel: tono cálido con algo de "sheen" para que no parezca plástico.
      skin: new MeshPhysicalMaterial({
        color: '#8a5537',
        roughness: 0.52,
        sheen: 0.35,
        sheenRoughness: 0.5,
        sheenColor: new Color('#c98a66'),
      }),
      hair: new MeshStandardMaterial({ color: '#1a120d', roughness: 0.9 }),
      leather: new MeshPhysicalMaterial({ color: '#0d0c0c', roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.2 }),
      teeth: new MeshStandardMaterial({ color: '#f7f2e8', roughness: 0.3 }),
      lips: new MeshStandardMaterial({ color: '#5e2f22', roughness: 0.45 }),
      eyeWhite: new MeshStandardMaterial({ color: '#f1ece4', roughness: 0.25 }),
      iris: new MeshStandardMaterial({ color: '#1c100a', roughness: 0.2 }),
    }),
    [],
  );
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);
  return mats;
}

/** Geometrías hechas a mano (torno, banda del pecho, pelo); se liberan al salir. */
function useGeometries() {
  const geos = useMemo(() => {
    const vFrom = (y) => -vWidth(y);
    const vTo = (y) => vWidth(y);
    return {
      jacket: new LatheGeometry(JACKET.map(([r, y]) => new Vector2(r, y)), 64),
      // Pechera en V: estrecha abajo, ancha junto al cuello.
      shirtV: chestBand(0.26, 0.585, vFrom, vTo, 0.0035),
      lapelL: chestBand(0.2, 0.56, (y) => vWidth(y), (y) => vWidth(y) + lapelWidth(y), 0.006),
      lapelR: chestBand(0.2, 0.56, (y) => -vWidth(y) - lapelWidth(y), (y) => -vWidth(y), 0.006),
      trouser: trouserGeometry(),
      afro: afroGeometry(),
      ...headGeometries(),
    };
  }, []);
  useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);
  return geos;
}

/** Media abertura (en radianes) de la V de la camisa a cada altura. */
function vWidth(y) {
  const t = Math.max(0, Math.min(1, (y - 0.26) / (0.585 - 0.26)));
  return 0.02 + t * 0.42;
}

/** Anchura de la solapa a cada altura: se ensancha en el pecho y se cierra arriba. */
function lapelWidth(y) {
  const t = Math.max(0, Math.min(1, (y - 0.2) / 0.36));
  return 0.05 + Math.sin(t * Math.PI) * 0.17;
}

/** Brazo: hombro, codo, puño blanco de la camisa y mano. */
function Arm({ side, mats, armRef, elbowRef }) {
  return (
    <group ref={armRef} position={[side * 0.232, 0.5, -0.005]}>
      <mesh position={[0, -0.15, 0]} material={mats.wool} castShadow>
        <capsuleGeometry args={[0.064, 0.22, 8, 20]} />
      </mesh>
      <group ref={elbowRef} position={[0, -0.31, 0]}>
        <mesh position={[0, -0.12, 0]} material={mats.wool} castShadow>
          <capsuleGeometry args={[0.056, 0.2, 8, 20]} />
        </mesh>
        <mesh position={[0, -0.255, 0]} material={mats.shirt} castShadow>
          <cylinderGeometry args={[0.049, 0.047, 0.035, 20]} />
        </mesh>
        {/* Mano: palma, cuatro dedos algo doblados hacia dentro y el pulgar delante. */}
        <mesh position={[0, -0.315, 0.004]} scale={[0.72, 0.95, 0.42]} material={mats.skin} castShadow>
          <sphereGeometry args={[0.05, 20, 16]} />
        </mesh>
        {[-0.021, -0.007, 0.007, 0.02].map((x, i) => (
          <mesh
            key={x}
            position={[x * side, -0.372 + Math.abs(i - 1.5) * 0.004, 0.012]}
            rotation={[0.35, 0, 0]}
            material={mats.skin}
          >
            <capsuleGeometry args={[0.0085, 0.042 - Math.abs(i - 1.5) * 0.006, 4, 8]} />
          </mesh>
        ))}
        <mesh position={[-side * 0.022, -0.315, 0.028]} rotation={[0.5, 0, side * 0.5]} material={mats.skin}>
          <capsuleGeometry args={[0.01, 0.03, 4, 8]} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Cabeza. Las piezas pequeñas de la cara se funden en una malla por material
 * (headGeometries): así la cabeza cuesta 7 llamadas de dibujo en vez de ~25.
 */
function Head({ mats, geos }) {
  return (
    <group>
      <mesh geometry={geos.headSkin} material={mats.skin} castShadow />
      <mesh geometry={geos.eyeWhites} material={mats.eyeWhite} />
      <mesh geometry={geos.irises} material={mats.iris} />
      <mesh geometry={geos.hairBits} material={mats.hair} />
      <mesh geometry={geos.lips} material={mats.lips} />
      <mesh geometry={geos.teeth} material={mats.teeth} />
      {/* Afro redondo que rodea la cabeza y enmarca la cara (el hueco va en la geometría). */}
      <mesh geometry={geos.afro} position={[0, 0.045, -0.012]} scale={[1.17, 1.06, 1.08]} material={mats.hair} castShadow />
    </group>
  );
}

/**
 * Pierna: pernera, calcetín blanco y mocasín (que gira desde la punta).
 * Toda la pierna cuelga de un pivote en la cadera, para poder dar la patada.
 */
function Leg({ side, mats, geos, shoeRef, legRef }) {
  return (
    <group ref={legRef} position={[side * 0.098, HIP_Y, 0]}>
      <group position={[0, -HIP_Y, 0]}>
        <mesh geometry={geos.trouser} position={[0, HIP_Y, 0]} material={mats.wool} castShadow />
        <mesh position={[0, 0.115, 0]} material={mats.sock} castShadow>
          <cylinderGeometry args={[0.047, 0.044, 0.11, 20]} />
        </mesh>
        {/* Pivote en la punta del pie: al ponerse de puntillas se levanta el talón. */}
        <group ref={shoeRef} position={[side * 0.012, 0, 0.17]}>
          {/* Mocasín: cápsula tumbada a lo largo del pie y aplastada. */}
          <mesh position={[0, 0.034, -0.12]} rotation={[Math.PI / 2, 0, 0]} scale={[1.05, 1, 0.66]} material={mats.leather} castShadow>
            <capsuleGeometry args={[0.047, 0.17, 6, 18]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/**
 * @param {{
 *   move: { name: string, at: number } | null,
 *   playing: boolean,
 *   reduced: boolean,
 *   level: () => number,
 *   onStep: () => void,
 *   onHover: (on: boolean) => void,
 * }} props
 */
export default function Michael({ move, playing, reduced, level, onStep, onHover }) {
  const mats = useMaterials();
  const geos = useGeometries();
  const body = useRef(null);
  const torso = useRef(null);
  const head = useRef(null);
  const armL = useRef(null);
  const armR = useRef(null);
  const elbowL = useRef(null);
  const elbowR = useRef(null);
  const shoeL = useRef(null);
  const shoeR = useRef(null);
  const legL = useRef(null);
  const legR = useRef(null);
  const beat = useRef(0);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const p = movePose(move, reduced);
    const idle = reduced ? 0 : 1;
    // Pulso de la música: energía de los graves (bombo y bajo), suavizada.
    const target = playing && !reduced ? level() : 0;
    beat.current += (target - beat.current) * 0.35;
    const pulse = beat.current;

    body.current.position.y = p.lift + pulse * 0.035 + Math.sin(t * 1.6) * 0.002 * idle;
    body.current.position.z = p.back;
    body.current.rotation.y = p.turn;
    torso.current.rotation.z = REST.shoulders + Math.sin(t * 0.7) * 0.012 * idle + p.tilt;
    torso.current.rotation.x = p.lean;
    torso.current.scale.y = 1 + Math.sin(t * 1.6) * 0.004 * idle;
    head.current.rotation.y = REST.headTurn + p.headY + Math.sin(t * 0.5) * 0.05 * idle;
    head.current.rotation.z = REST.headTilt;
    head.current.rotation.x = -pulse * 0.08 + p.headX;

    // Brazos en reposo un poco separados; cada paso los mueve a su manera.
    armR.current.rotation.z = -0.1 + p.armRZ - pulse * 0.08;
    armR.current.rotation.x = -0.05 + p.armRX;
    elbowR.current.rotation.x = REST.elbow + p.elbowR;
    armL.current.rotation.z = 0.1 + p.armLZ + pulse * 0.08;
    armL.current.rotation.x = -0.05 + p.armLX;
    elbowL.current.rotation.x = REST.elbow - 0.06 + p.elbowL;

    legR.current.rotation.x = p.legR;
    // La pierna libre, algo abierta; el cuerpo se inclina sobre la que carga.
    legR.current.rotation.z = -REST.legOut;
    body.current.rotation.z = REST.hip;
    legL.current.rotation.x = p.legL;
    shoeL.current.rotation.x = p.toeL;
    shoeR.current.rotation.x = p.toeR;
  });

  return (
    <group
      position={[MICHAEL.x, 0, MICHAEL.z]}
      onClick={(e) => {
        e.stopPropagation();
        onStep();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(true);
      }}
      onPointerOut={() => onHover(false)}
    >
      <group ref={body}>
        <Leg side={-1} mats={mats} geos={geos} shoeRef={shoeR} legRef={legR} />
        <Leg side={1} mats={mats} geos={geos} shoeRef={shoeL} legRef={legL} />
        <group ref={torso} position={[0, HIP_Y, 0]}>
          <mesh geometry={geos.jacket} scale={[1, 1, FLAT]} material={mats.wool} castShadow receiveShadow />
          <mesh geometry={geos.shirtV} material={mats.shirt} />
          <mesh geometry={geos.lapelL} material={mats.satin} castShadow />
          <mesh geometry={geos.lapelR} material={mats.satin} castShadow />
          {/* Botón del esmoquin a la altura de la cintura. */}
          <mesh position={[0, 0.2, jacketRadius(0.2) * FLAT + 0.006]} material={mats.satin}>
            <sphereGeometry args={[0.011, 12, 8]} />
          </mesh>
          {/* Pajarita: dos lazos y el nudo. */}
          <group position={[0, 0.565, jacketRadius(0.565) * FLAT + 0.035]}>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.028, 0, 0]} rotation={[0, 0, (s * Math.PI) / 2]} scale={[1, 1, 0.45]} material={mats.satin}>
                <coneGeometry args={[0.022, 0.05, 16]} />
              </mesh>
            ))}
            <mesh material={mats.satin}>
              <sphereGeometry args={[0.012, 12, 8]} />
            </mesh>
          </group>
          {/* Cuello de la camisa y cuello. */}
          <mesh position={[0, 0.6, 0.005]} material={mats.shirt}>
            <cylinderGeometry args={[0.058, 0.064, 0.05, 24, 1, true]} />
          </mesh>
          <mesh position={[0, 0.645, 0]} material={mats.skin} castShadow>
            <cylinderGeometry args={[0.046, 0.052, 0.11, 20]} />
          </mesh>
          <group ref={head} position={[0, 0.765, 0.008]}>
            <Head mats={mats} geos={geos} />
          </group>
          <Arm side={1} mats={mats} armRef={armL} elbowRef={elbowL} />
          <Arm side={-1} mats={mats} armRef={armR} elbowRef={elbowR} />
        </group>
      </group>
    </group>
  );
}
