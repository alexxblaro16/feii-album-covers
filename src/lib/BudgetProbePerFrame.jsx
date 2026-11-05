import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

/**
 * Unit 9's per-frame probe ("Post-processing is a cost"), for a scene that
 * renders more than once a frame. It reads exactly what the Unit 8 probe
 * (`./BudgetProbe.jsx`) reads; only the counting differs.
 *
 * A post-processing composer calls `gl.render` several times a frame, and
 * three resets `calls` / `triangles` at the start of every `gl.render` while
 * `gl.info.autoReset` is true, so the Unit 8 probe would keep only the last
 * pass (Unit 9 measured `calls 1` with one Bloom, against 23 here). This probe
 * turns auto-reset off, resets once per frame itself, and reports the whole
 * previous frame once a second. Without a composer it reads the same numbers
 * as the Unit 8 probe (Unit 9: 6 / 1368 / 6 / 1 on the beacon).
 *
 * The gallery mounts the Unit 8 probe in every route (`src/gallery/CoverRoute.jsx`)
 * and that stays the default: the reference ships zero passes. To measure a
 * route that adds one pass, the instructor swaps that one import for this file,
 * and the route records both rows (pass off / pass on) in its
 * `docs/renderer-info.md`. Never mount both probes in one Canvas: this one's
 * per-frame reset would hand the other one zeros.
 *
 * Course caps are unchanged (`./budget.js`): desktop ≤ 200 draw calls,
 * mobile ≤ 80. The route's own `CEILING` stays in `covers/<slug>/src/budget.js`.
 *
 * @param {{ onSample: (sample: import('./types.js').BudgetSample) => void }} props
 * @returns {null}
 */
export default function BudgetProbePerFrame({ onSample }) {
  // One change from Unit 9's file: the renderer is reached through `get()` and
  // the frame state, not a `useThree((state) => state.gl)` value, because this
  // repo's lint (eslint-plugin-react-hooks 7, `react-hooks/immutability`)
  // refuses writing to a value a hook returned. Same reads, same reset.
  const get = useThree((state) => state.get);
  const wait = useRef(0);

  useEffect(() => {
    const { info } = get().gl;
    // A composer calls gl.render several times a frame; auto-reset would keep only the last call.
    info.autoReset = false;
    return () => {
      info.autoReset = true;
    };
  }, [get]);

  useFrame(({ gl }, delta) => {
    wait.current += delta;
    if (wait.current >= 1) {
      wait.current = 0;
      // Everything since the last reset: the whole previous frame, every pass included.
      onSample({
        calls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
        geometries: gl.info.memory.geometries,
        textures: gl.info.memory.textures,
      });
    }
    gl.info.reset();
  });

  return null;
}
