import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * Samples `renderer.info` about once a second and lifts the reading into
 * React. Same probe as the Unit 8 sandbox. The gallery mounts one inside every
 * route's `<Canvas>`, so a route never adds its own.
 *
 * `useFrame` runs before `gl.render`, so a reading describes the previous
 * finished frame. That is fine for a 1 Hz panel.
 *
 * @param {{ onSample: (sample: import('./types.js').BudgetSample) => void }} props
 * @returns {null}
 */
export default function BudgetProbe({ onSample }) {
  const wait = useRef(0);

  useFrame(({ gl }, delta) => {
    wait.current += delta;
    if (wait.current < 1) return;
    wait.current = 0;
    onSample({
      calls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures,
    });
  });

  return null;
}
