import { Link } from 'react-router-dom';
import { covers } from './registry.js';

/**
 * Prev / next / all-project links for the exhibition shell (overlay, no layout theft).
 *
 * @param {{ slug: string }} props
 */
export default function RouteNav({ slug }) {
  const index = covers.findIndex((c) => c.slug === slug);
  if (index === -1) return null;

  const prev = index > 0 ? covers[index - 1] : null;
  const next = index < covers.length - 1 ? covers[index + 1] : null;

  return (
    <nav className="route-nav" aria-label="Cover navigation" data-exhibition-nav="route-nav">
      {prev ? (
        <Link className="route-nav__link route-nav__prev" to={`/covers/${prev.slug}`} rel="prev">
          ← {prev.title}
        </Link>
      ) : (
        <span className="route-nav__spacer" />
      )}
      <Link className="route-nav__all" to="/">
        All projects
      </Link>
      {next ? (
        <Link className="route-nav__link route-nav__next" to={`/covers/${next.slug}`} rel="next">
          {next.title} →
        </Link>
      ) : (
        <span className="route-nav__spacer" />
      )}
    </nav>
  );
}
