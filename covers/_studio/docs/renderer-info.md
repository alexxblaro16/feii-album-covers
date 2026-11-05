# renderer.info — cover

<!-- The Unit 8 renderer-info Template, filled for the studio reference. Numbers
     come from the gallery panel on /covers/_studio (the shared Unit 8
     BudgetProbe, ~1 Hz, previous frame). -->

Album: none. Studio reference "Signal & Grain", an original sleeve made for this repository (D8).
Scene: stage (box), sleeve (box, `StudioSleeve` shader material sampling `uMap`), vinyl (cylinder, 64 segments), the gallery's three lights and `OrbitControls`; the compare panel is DOM (drei `<Html>`), not geometry. Shadows off, DPR cap [1, 1.5] (the gallery's).
Unit cap, any scene: desktop ≤ 200 calls, mobile ≤ 80.
Accepted ceiling for this tree: calls ≤ 3, triangles ≤ 280, geometries ≤ 3, textures ≤ 2 (`src/budget.js`).

Pins: three@0.185.1, @react-three/fiber@9.8.2, @react-three/drei@10.7.9, react@19.3.1 (this repo's package.json).

| Run | Machine, date | Shadows | calls | triangles | geometries | textures | Accepted |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cover (task1, flat sleeve) — switch on Flat | Apple M4 Max, headless Chrome 156, SwiftShader (software, no GPU), 2026-11-05 | off | 3 | 280 | 3 | 1 | yes (baseline) |
| cover + sleeve picture (task2) — switch on PNG | same | off | 3 | 280 | 3 | 2 | yes |
| cover + KTX2 sleeve (task3) — switch on ETC1S | same | off | 3 | 280 | 3 | 2 | yes |
| cover + KTX2 sleeve (task3) — switch on UASTC | same | off | 3 | 280 | 3 | 2 | yes (CEILING row) |

`memory.textures` is a texture **count**, not bytes. With every map null it already reads 1 (three's empty placeholder); the sleeve picture is one more, whatever its format (PNG 1,398,100 GPU bytes, ETC1S 174,776, UASTC 349,552: see `ktx2-note.md`). The switch disposes the previous picture's GPU copy, so the count stays 2 across modes instead of climbing.

The shader material swap is not a new draw: calls, triangles and geometries are the same with the flat standard material and with the sheen shader. The panel's colour and orientation checks render once into a temporary 512² target when a mode loads and dispose it at once; they add no texture or geometry to the steady reading above.

Post-processing: zero passes, so the Unit 8 probe is the right instrument. Unit 9's per-frame probe ships beside it in `src/lib/BudgetProbePerFrame.jsx` for a route that adds one pass; it is not mounted here.

SwiftShader says nothing about frame time or phone memory. Calls, triangles and geometries describe the tree and will read the same on a GPU; re-read the panel on a real laptop before quoting a frame rate.
