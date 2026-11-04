# renderer.info — cover

<!-- Template (Unit 8). Replace every ellipsis. Numbers come from the gallery
     panel on YOUR route, read on YOUR machine. The beacon's 6 / 1368 belong to
     the beacon; do not copy them here. Change the tree → change this table and
     CEILING in src/budget.js in the same PR. -->

Album: ...
Scene: ... (what is in the tree), shadows off, DPR cap [1, 1.5] (the gallery's).
Unit cap, any scene: desktop ≤ 200 calls, mobile ≤ 80.
Accepted ceiling for this tree: calls ≤ ..., triangles ≤ ..., geometries ≤ ..., textures ≤ ...

Pins: three@0.185.1, @react-three/fiber@9.8.2, @react-three/drei@10.7.9, react@19.3.1 (this repo's package.json).

| Run | Machine, date | Shadows | calls | triangles | geometries | textures | Accepted |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cover (task1, flat sleeve) | ... | off | ... | ... | ... | ... | ... |
| cover + sleeve picture (task2) | ... | off | ... | ... | ... | ... | ... |
| cover + KTX2 sleeve (task3) | ... | off | ... | ... | ... | ... | ... |

`memory.textures` is a texture **count**, not bytes. With every map null it already reads 1 (three's empty placeholder); the sleeve picture is one more.
