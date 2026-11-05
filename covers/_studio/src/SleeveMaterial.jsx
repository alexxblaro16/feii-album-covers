// covers/_studio/src/SleeveMaterial.jsx — the Cover shaders satellite's
// `src/SleeveMaterial.jsx`, unchanged below this header EXCEPT the R3F `extend`
// key: `SleeveShader` → `StudioSleeve` (and the element `<sleeveShader>` →
// `<studioSleeve>`). Extend keys are global across every route (Route contract
// item 3); the lesson's key belongs to no route, so the studio takes its own.
// The sheen is the studio's one authored effect: it changes the answer (the
// colour after the lookup), never the place (vUv), so the picture stays printed.

import { useRef } from 'react';
import { extend, useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

// The band moves 0.4 per second along a diagonal that runs from -0.5 to 2.5: 3.0 / 0.4 = 7.5 s.
const SWEEP_SECONDS = 7.5;

/*
 * Purpose: print the sleeve picture on the mesh and sweep one band of light across it.
 * Inputs: uMap (the sleeve picture), uTime (seconds, wrapped), uHot (0 or 1, from React state).
 * Coordinate space: UV. vUv says where on the picture this pixel is, copied from the mesh.
 * Performance: one texture lookup per pixel. No loop, no discard.
 */
const SleeveShader = shaderMaterial(
  { uMap: null, uTime: 0, uHot: 0 },
  /* glsl */ `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* glsl */ `
    uniform sampler2D uMap;
    uniform float uTime;
    uniform float uHot;
    varying vec2 vUv;

    void main() {
      vec4 picture = texture2D(uMap, vUv);

      float diagonal = vUv.x + vUv.y;
      float sweep = uTime * 0.4 - 0.5;
      float sheen = 1.0 - smoothstep(0.0, 0.12, abs(diagonal - sweep));

      vec3 color = picture.rgb * (1.0 + 0.15 * uHot);
      color = mix(color, vec3(1.0), sheen * 0.35);
      gl_FragColor = vec4(color, 1.0);

      #include <colorspace_fragment>
    }
  `,
  (material) => {
    material.precision = 'mediump';
  },
);

extend({ StudioSleeve: SleeveShader });

/**
 * The sleeve's material. It looks up the picture at the mesh's UV and sweeps
 * one band of light across it.
 *
 * @param {object} props
 * @param {import('three').Texture} props.map The sleeve picture.
 * @param {boolean} props.hot True while the sleeve is hovered or selected.
 * @param {boolean} props.reduced True under prefers-reduced-motion. The band then waits off the picture.
 * @returns {JSX.Element} A material element; put it inside the sleeve's `<mesh>`.
 */
export default function SleeveMaterial({ map, hot, reduced }) {
  const material = useRef(null);

  useFrame((_, delta) => {
    const node = material.current;
    if (!node) return;
    if (reduced) {
      // uTime 0 puts the band at -0.5, off the picture. The picture itself still renders.
      node.uTime = 0;
      return;
    }
    // Wrap once per crossing, so uTime stays small enough for a mediump float.
    node.uTime = (node.uTime + Math.min(delta, 0.05)) % SWEEP_SECONDS;
  });

  return <studioSleeve ref={material} uMap={map} uHot={hot ? 1 : 0} />;
}
