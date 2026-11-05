import { Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import CanvasErrorBoundary from './CanvasErrorBoundary.jsx';
import ProjectSelector from './ProjectSelector.jsx';
import RouteNav from './RouteNav.jsx';
import { findCover } from './registry.js';

/**
 * `/covers/:slug` — exhibition shell only (D26).
 *
 * Looks up the slug, lazy-loads `covers/<slug>/src/Route.jsx` inside an error
 * boundary, and supplies overlay navigation. The route module owns Canvas,
 * camera, layout, and CSS; this file never mounts a shared `<Canvas>`.
 */
export default function CoverRoute() {
  const { slug } = useParams();
  const cover = findCover(slug);

  if (!cover) {
    return (
      <main className="gallery">
        <h1>No cover at /covers/{slug}</h1>
        <p className="notice">
          {slug === '_template' ? (
            <>
              <code>_template</code> is never a route: copy it to <code>covers/&lt;slug&gt;/</code>.
            </>
          ) : (
            <>
              A route exists only when <code>covers/registry.json</code> lists the slug and{' '}
              <code>covers/{slug}/src/Route.jsx</code> exists.
            </>
          )}{' '}
          See <code>CONTRIBUTING.md</code>.
        </p>
        <p>
          <Link to="/">All covers</Link>
        </p>
      </main>
    );
  }

  const { Route, slug: coverSlug } = cover;

  // key: another slug is another endpoint — unmount disposes WebGL, listeners, route CSS.
  return (
    <div className="route-shell" key={coverSlug}>
      <CanvasErrorBoundary slug={coverSlug}>
        <Suspense fallback={<p className="route-fallback">Loading route…</p>}>
          <Route />
        </Suspense>
      </CanvasErrorBoundary>
      <ProjectSelector />
      <RouteNav slug={coverSlug} />
    </div>
  );
}
