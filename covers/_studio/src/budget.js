// covers/_studio/src/budget.js — the accepted ceiling for the studio's tree.
//
// Measured 2026-11-05 on the gallery panel (the shared Unit 8 BudgetProbe), in
// headless Chrome 156 on the SwiftShader software renderer (no GPU), with the
// sleeve showing a picture (PNG, ETC1S or UASTC: the same row for all three).
// Flat mode reads textures 1. The same numbers, with the machine, are in
// docs/renderer-info.md. Course caps (src/lib/budget.js): desktop ≤ 200 calls,
// mobile ≤ 80. Change the tree → change this and the renderer-info row together.

/** @type {import('../../../src/lib/types.js').Ceiling} */
export const CEILING = { calls: 3, triangles: 280, geometries: 3, textures: 2 };
