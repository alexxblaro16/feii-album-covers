# Shader note

<!-- The Unit 9 shader-note Template (line 7 from Cover shaders), filled for the
     studio's sleeve material, src/SleeveMaterial.jsx. -->

1. Vertex vs fragment: the vertex shader only copies the mesh's `uv` into `vUv` and places the vertex (`projectionMatrix * modelViewMatrix * position`); every decision about colour is in the fragment shader, once per pixel.
2. Uniform: `uTime` (seconds, wrapped every 7.5 s) moves the band, and `uHot` (0 or 1) lifts the picture while the sleeve is hovered or selected. React writes them (`useFrame` for `uTime`, the `hot` prop for `uHot`), so they are uniforms, not constants in the GLSL. `uMap` is the third uniform: the picture.
3. Coordinate space: uv. The band runs along `vUv.x + vUv.y`, so it sweeps across the printed sleeve and stays on it as the camera orbits. In view space or `gl_FragCoord` the band would slide across the sleeve with the camera.
4. Precision: `mediump`, set as `material.precision`; `uTime` is wrapped with `% SWEEP_SECONDS` so it never grows past what mediump holds.
5. Effect: a sheen, `mix(color, vec3(1.0), sheen * 0.35)` with `sheen = 1.0 - smoothstep(0.0, 0.12, abs(diagonal - sweep))`: one band of light crossing the sleeve on the diagonal. Under `prefers-reduced-motion` `uTime` is held at 0, which parks the band off the picture; the picture still renders.
6. Post-pass: zero.
7. Sampler: uMap is the studio's original "Signal & Grain" sleeve (made for this repository, no licence needed beyond that; `tools/make-sleeve.mjs`), loaded as PNG, ETC1S or UASTC by the panel switch; the shader is the same for all three. It is looked up at vUv, the sleeve's own UV, so the picture stays printed when the camera orbits. My effect changes the answer, not the place, in the line `color = mix(color, vec3(1.0), sheen * 0.35);` — the lookup `texture2D(uMap, vUv)` is never offset.

Notes for the reviewer:
- The file is the Cover shaders lesson's `SleeveMaterial.jsx`, unchanged except the R3F `extend` key, which is `StudioSleeve` (element `<studioSleeve>`), not the lesson's shared `SleeveShader` (Route contract 3).
- `#include <colorspace_fragment>` stays last; the colour lines are what the panel's colour check relies on (PNG disc read back at `rgb(227, 106, 44)`, Δ0).
- Orientation is fixed in the file, never here: there is no `1.0 - vUv.y` (the `.ktx2` files are encoded with `--lower_left_maps_to_s0t0`).
- Not the bulb: Unit 9's rim follows the angle between surface and camera, so on a sleeve it would brighten and fade as you orbit and never read the picture. This effect reads the picture once per pixel and paints on top of it.
