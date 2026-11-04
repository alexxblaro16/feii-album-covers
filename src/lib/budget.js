/**
 * Course caps, any scene: desktop ≤ 200 draw calls, mobile ≤ 80. A route's own
 * CEILING (in `covers/<slug>/src/budget.js`) is the tighter, accepted row for
 * that route's tree.
 */
export const COURSE_CAP = { desktopCalls: 200, mobileCalls: 80 };

/**
 * Tri-state verdict for the panel. Same rule as the Unit 8 sandbox's
 * `withinCeiling`, except the ceiling is passed in, because each route
 * brings its own.
 *
 *   null  — still sampling, or the route has no CEILING yet
 *   true  — within the route's ceiling
 *   false — over it
 *
 * @param {import('./types.js').BudgetSample | null} sample
 * @param {import('./types.js').Ceiling | null | undefined} ceiling
 * @returns {boolean | null}
 */
export function withinCeiling(sample, ceiling) {
  if (!ceiling || !sample || sample.calls === 0) return null;
  return (
    sample.calls <= ceiling.calls &&
    sample.triangles <= ceiling.triangles &&
    sample.geometries <= ceiling.geometries &&
    sample.textures <= ceiling.textures
  );
}
