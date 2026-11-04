import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './gallery/Home.jsx';

/**
 * Instructor-owned router. Students never edit this file to add a cover.
 *
 * Every cover is one route, `/covers/:slug`. The route is on when BOTH exist:
 *   1. an object with that `slug` in `covers/registry.json`, and
 *   2. the module `covers/<slug>/src/Cover.jsx`.
 * `src/gallery/registry.js` finds the modules with
 * `import.meta.glob('../../covers/*\/src/Cover.jsx')` and joins them to the
 * registry. A slug that is not in the registry has no route.
 *
 * The route component is lazy, so three.js and R3F stay out of the index page.
 */
const CoverRoute = lazy(() => import('./gallery/CoverRoute.jsx'));

export default function App() {
  return (
    <Suspense fallback={<p className="route-fallback">Loading cover…</p>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/covers/:slug" element={<CoverRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
