// covers/off-the-wall/src/budget.js — techo aceptado para el árbol de esta ruta.
//
// Medido el 2026-11-11 con el BudgetProbe de la galería (panel ?budget), en
// Microsoft Edge (ANGLE D3D11, Intel UHD Graphics del i7-13620H), 1440x900.
// Ver docs/renderer-info.md.
// Cambiar el árbol obliga a cambiar este techo y la tabla en el mismo PR.

// Medido el 2026-11-12 en Intel UHD (panel ?budget), con el atrezo del plató,
// el cuadro de los Jackson 5, el tocadiscos con sus fundas y el monitor en
// directo: Portada 80 calls, De lado 79, El plató 86, Tocadiscos 43, Los
// Jackson 5 41 y Por detrás de Michael 107 (la más alta: ahí se ven a la vez el
// plató, el monitor y el tocadiscos). Hasta 199 278 triángulos, 104 geometrías
// y 12 texturas. Todo por debajo del tope de escritorio (200 calls).
/** @type {import('../../../src/lib/types.js').Ceiling | null} */
export const CEILING = { calls: 110, triangles: 205000, geometries: 110, textures: 12 };
