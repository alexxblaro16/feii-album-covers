// covers/_studio/src/Cover.jsx — the instructor's reference route, /covers/_studio.
//
// Students copy covers/_template/ to light THEIR route; they do not fork this
// folder. It shows the whole chain on one original sleeve (D8: palette.js and
// tools/make-sleeve.mjs; no album art):
//   - a composed tree: stage, sleeve, vinyl; hover and click write the
//     gallery's state through the five contract props (Route contract 1);
//   - the Cover shaders sleeve material (SleeveMaterial.jsx, registered under
//     the studio-unique key StudioSleeve — Route contract 3), sampling uMap;
//   - the KTX2/Basis hello-world: a Flat / PNG / ETC1S / UASTC switch with the
//     two numbers, file bytes (suitcase) and computed GPU bytes (room), the
//     texture COUNT, texture.format, and the colorSpace / colour / orientation
//     checks (sleeveChecks.js).
//
// Contract: default export, the gallery's five props, no <Canvas>, no
// BudgetProbe, no state for hovered/selected/reduced. The switch's own mode is
// studio state, which the contract allows.

import { Suspense, useCallback, useEffect, useId, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { SCENE_COLOR } from './palette.js';
import { PartId } from './parts.js';
import SleeveMaterial from './SleeveMaterial.jsx';
import { measureSleeve } from './sleeveChecks.js';
import { SLEEVE_KTX2_URL, useSleeveKtx2 } from './sleeveKtx2.js';
import { SLEEVE_URL, useSleevePicture } from './sleevePicture.js';
import StudioPanel from './StudioPanel.jsx';

const IDLE = {
  [PartId.stage]: SCENE_COLOR.stage,
  [PartId.sleeve]: SCENE_COLOR.sleeve,
  [PartId.vinyl]: SCENE_COLOR.vinyl,
};
const FILE_URL = { png: SLEEVE_URL, ...SLEEVE_KTX2_URL };

// drei <Html> pins the panel to the Canvas's top-right corner instead of a 3D
// point, clear of the sleeve. PANEL_PX = the panel's width plus its margins
// (studio.css); on a narrow Canvas it falls back to the left edge.
const PANEL_PX = 328;
const pinTopRight = (_object, _camera, size) => [Math.max(0, size.width - PANEL_PX), 0];

function colorFor(id, hovered, selected) {
  if (selected === id) return SCENE_COLOR.accent;
  if (hovered === id) return SCENE_COLOR.hover;
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
 * Bytes of one file as the browser fetched it: the suitcase. (Vite serves the
 * same bytes in dev and in the build; the build only renames the file.)
 *
 * @param {string | null} url
 * @returns {number | null}
 */
function useFileBytes(url) {
  const [state, setState] = useState({ url: null, bytes: null });
  useEffect(() => {
    if (!url) return undefined;
    let live = true;
    fetch(url)
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        if (live) setState({ url, bytes: buffer.byteLength });
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [url]);
  return state.url === url ? state.bytes : null;
}

/**
 * Reads `renderer.info.memory.textures` about once a second and lifts it only
 * when it changes. A COUNT of textures alive on the GPU, not bytes.
 *
 * @param {{ onCount: (count: number) => void }} props
 * @returns {null}
 */
function TextureCount({ onCount }) {
  const wait = useRef(1);
  const last = useRef(-1);
  useFrame(({ gl }, delta) => {
    wait.current += delta;
    if (wait.current < 1) return;
    wait.current = 0;
    const count = gl.info.memory.textures;
    if (count !== last.current) {
      last.current = count;
      onCount(count);
    }
  });
  return null;
}

/**
 * The sleeve material for one loaded picture, plus its measurement. When the
 * mode changes, the old picture's GPU copy is freed (dispose), so the texture
 * count reads one sleeve picture, whichever format; three uploads it again if
 * the switch comes back to it.
 *
 * @param {object} props
 * @param {import('three').Texture} props.picture
 * @param {string} props.mode
 * @param {boolean} props.hot
 * @param {boolean} props.reduced
 * @param {(reading: import('./sleeveChecks.js').SleeveReading) => void} props.onReading
 */
function MeasuredSleeve({ picture, mode, hot, reduced, onReading }) {
  const get = useThree((state) => state.get);
  useEffect(() => {
    const reading = measureSleeve(get().gl, picture, mode);
    console.info(`[_studio] ${mode}`, JSON.stringify(reading));
    onReading(reading);
    return () => picture.dispose();
  }, [get, picture, mode, onReading]);
  return <SleeveMaterial map={picture} hot={hot} reduced={reduced} />;
}

/** PNG path: decoded and unpacked on upload (useTexture, ./sleevePicture.js). */
function PngSleeve(props) {
  const picture = useSleevePicture();
  return <MeasuredSleeve picture={picture} mode="png" {...props} />;
}

/** Packed path: ETC1S or UASTC through the shared KTX2Loader (./sleeveKtx2.js). */
function Ktx2Sleeve({ mode, ...props }) {
  const picture = useSleeveKtx2(mode);
  return <MeasuredSleeve picture={picture} mode={mode} {...props} />;
}

/**
 * @param {import('../../../src/lib/types.js').CoverProps} props
 */
export default function Cover({ hovered, selected, reduced, onHover, onSelect }) {
  const disc = useRef(null);
  const phase = useRef(0);
  const headingId = useId();
  const [mode, setMode] = useState('png');
  const [reading, setReading] = useState(null);
  const [textureCount, setTextureCount] = useState(null);
  const onReading = useCallback((next) => setReading(next), []);
  const fileBytes = useFileBytes(FILE_URL[mode] ?? null);

  useFrame((_, delta) => {
    const node = disc.current;
    if (!node || reduced) return;
    phase.current += Math.min(delta, 0.05);
    // The disc slides part-way out of the sleeve and back. No allocation, one position write.
    node.position.x = 0.3 + 0.12 * Math.sin(phase.current * 0.8);
  });

  const hot = hovered === PartId.sleeve || selected === PartId.sleeve;
  const flatSleeve = <meshStandardMaterial color={colorFor(PartId.sleeve, hovered, selected)} roughness={0.7} />;

  let sleeve = flatSleeve;
  if (mode === 'png') sleeve = <PngSleeve hot={hot} reduced={reduced} onReading={onReading} />;
  if (mode === 'etc1s' || mode === 'uastc') {
    sleeve = <Ktx2Sleeve key={mode} mode={mode} hot={hot} reduced={reduced} onReading={onReading} />;
  }

  return (
    <group position={[0, -0.4, 0]}>
      <mesh {...bindPart(PartId.stage, onHover, onSelect)}>
        <boxGeometry args={[2.2, 0.06, 1.4]} />
        <meshStandardMaterial color={colorFor(PartId.stage, hovered, selected)} roughness={0.9} />
      </mesh>

      <mesh position={[-0.35, 0.68, 0]} {...bindPart(PartId.sleeve, onHover, onSelect)}>
        <boxGeometry args={[1.24, 1.24, 0.02]} />
        {/* A packed file loads the first time its mode is picked; the flat sleeve stands in. */}
        <Suspense fallback={flatSleeve}>{sleeve}</Suspense>
      </mesh>

      <mesh
        ref={disc}
        position={[0.3, 0.68, -0.03]}
        rotation={[Math.PI / 2, 0, 0]}
        {...bindPart(PartId.vinyl, onHover, onSelect)}
      >
        <cylinderGeometry args={[0.6, 0.6, 0.01, 64]} />
        <meshStandardMaterial
          color={colorFor(PartId.vinyl, hovered, selected)}
          metalness={0.2}
          roughness={0.4}
        />
      </mesh>

      <TextureCount onCount={setTextureCount} />

      <Html calculatePosition={pinTopRight} zIndexRange={[20, 0]}>
        <StudioPanel
          mode={mode}
          onMode={setMode}
          reading={reading}
          fileBytes={fileBytes}
          textureCount={textureCount}
          headingId={headingId}
        />
      </Html>
    </group>
  );
}
