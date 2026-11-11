// Monitor de plató detrás de la cámara: enseña en directo lo que está
// grabando la cámara del trípode (la escena 3D vista desde su objetivo), con
// un piloto rojo de "REC". Es la propia escena renderizada a una textura, no
// la foto de la portada.
//
// Rendimiento: la imagen del monitor es una segunda pasada de render a una
// textura de 512 px. Solo se hace cuando el monitor está dentro de la vista y
// de cara a la cámara, y en escritorio cada 2 fotogramas. En pantallas
// pequeñas o táctiles se pinta una sola vez (imagen fija), para no doblar las
// llamadas de dibujo en el móvil. `renderer.info` se reinicia en cada render,
// así que esta pasada no sale en el panel ?budget: se mide aparte
// (docs/renderer-info.md).

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  BoxGeometry,
  CylinderGeometry,
  Frustum,
  Matrix4,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  SRGBColorSpace,
  SphereGeometry,
  Vector3,
  WebGLRenderTarget,
} from 'three';

const SIZE = 512;
const SCREEN = 0.62;
// Junto a la cámara del trípode, fuera del encuadre de la portada y girado
// hacia quien mira el plató (sin tapar a Michael desde ninguna vista).
const POSITION = [-0.95, 0, 4.25];
const ROT_Y = -0.73;

export default function LiveMonitor() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const res = useMemo(() => {
    const target = new WebGLRenderTarget(SIZE, SIZE);
    target.texture.colorSpace = SRGBColorSpace;
    // La cámara del trípode: mismo sitio que el objetivo, mirando a Michael.
    const lens = new PerspectiveCamera(27, 1, 0.1, 30);
    lens.position.set(0.86, 1.08, 3.7);
    lens.lookAt(0, 1.1, 0);
    lens.updateMatrixWorld();
    return {
      target,
      lens,
      screenMat: new MeshBasicMaterial({ map: target.texture, toneMapped: false }),
      body: new MeshStandardMaterial({ color: '#18181b', roughness: 0.5, metalness: 0.4 }),
      rec: new MeshBasicMaterial({ color: '#ff2a1f', toneMapped: false }),
      geo: {
        screen: new PlaneGeometry(SCREEN, SCREEN),
        case: new BoxGeometry(SCREEN + 0.06, SCREEN + 0.06, 0.07),
        pole: new CylinderGeometry(0.018, 0.022, 1.0, 10),
        foot: new CylinderGeometry(0.22, 0.24, 0.03, 20),
        dot: new SphereGeometry(0.014, 10, 8),
      },
    };
  }, []);
  useEffect(
    () => () => {
      res.target.dispose();
      res.screenMat.dispose();
      res.body.dispose();
      res.rec.dispose();
      Object.values(res.geo).forEach((g) => g.dispose());
    },
    [res],
  );

  const group = useRef(/** @type {import('three').Group | null} */ (null));
  const screen = useRef(/** @type {import('three').Mesh | null} */ (null));
  const dot = useRef(/** @type {import('three').Mesh | null} */ (null));
  const frame = useRef(0);
  const painted = useRef(false);
  const tmp = useRef({ frustum: new Frustum(), m: new Matrix4(), n: new Vector3(), d: new Vector3() });
  // Pantallas pequeñas o táctiles: una sola pintada, sin directo.
  const live = useRef(window.matchMedia('(pointer: fine) and (min-width: 721px)').matches);

  useFrame(({ camera, clock }) => {
    // Piloto de grabación: parpadea una vez por segundo.
    if (dot.current) dot.current.visible = clock.elapsedTime % 1 < 0.6;
    frame.current += 1;
    if (!screen.current || !group.current) return;
    if (live.current ? frame.current % 2 : painted.current) return;

    // ¿Se ve el monitor y está de cara? Si no, no hace falta pintarlo.
    const t = tmp.current;
    t.m.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    t.frustum.setFromProjectionMatrix(t.m);
    if (painted.current && !t.frustum.intersectsObject(screen.current)) return;
    screen.current.getWorldDirection(t.n);
    t.d.copy(camera.position).sub(screen.current.getWorldPosition(t.d.set(0, 0, 0)));
    if (painted.current && t.n.dot(t.d) <= 0) return;

    group.current.visible = false;
    const prev = gl.getRenderTarget();
    gl.setRenderTarget(res.target);
    gl.render(scene, res.lens);
    gl.setRenderTarget(prev);
    group.current.visible = true;
    painted.current = true;
  });

  return (
    <group ref={group} position={POSITION} rotation={[0, ROT_Y, 0]}>
      <mesh geometry={res.geo.foot} material={res.body} position={[0, 0.015, 0]} />
      <mesh geometry={res.geo.pole} material={res.body} position={[0, 0.5, 0]} />
      <group position={[0, 1.32, 0]} rotation={[-0.06, 0, 0]}>
        <mesh geometry={res.geo.case} material={res.body} position={[0, 0, -0.04]} />
        <mesh ref={screen} geometry={res.geo.screen} material={res.screenMat} />
        {/* Piloto "REC" en la esquina del marco. */}
        <mesh ref={dot} geometry={res.geo.dot} material={res.rec} position={[-SCREEN / 2 + 0.035, SCREEN / 2 + 0.012, 0.001]} />
      </group>
    </group>
  );
}
