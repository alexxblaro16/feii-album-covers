import { Link } from 'react-router-dom';
import { covers, missingModules } from './registry.js';

/**
 * @param {string} slug
 * @param {string} thumbnail filename under covers/<slug>/public/
 */
function thumbnailHref(slug, thumbnail) {
  return new URL(`../../covers/${slug}/public/${thumbnail}`, import.meta.url).href;
}

/**
 * Gallery index: visual exhibition cards with readiness, still plain links for keyboard/URL.
 */
export default function Home() {
  return (
    <main className="gallery">
      <h1>Album covers — FE II Units 8–9</h1>
      <p className="lede">
        One complete student-authored endpoint per team at <code>/covers/&lt;slug&gt;</code>. Formats
        vary (DOM, WebGL, hybrid). <code>covers/_studio</code> is a reference, not the expected answer.
      </p>

      {missingModules.length > 0 ? (
        <p className="notice warn" role="status">
          In the registry but missing <code>src/Route.jsx</code>: {missingModules.join(', ')}
        </p>
      ) : null}

      {covers.length === 0 ? (
        <p className="notice">
          No covers yet. Copy <code>covers/_template/</code> to <code>covers/&lt;slug&gt;/</code> and add
          one object to <code>covers/registry.json</code> — see <code>CONTRIBUTING.md</code>.
        </p>
      ) : (
        <ul className="exhibition">
          {covers.map((cover) => (
            <li key={cover.slug}>
              <Link to={`/covers/${cover.slug}`} className="exhibition__card">
                <img
                  className="exhibition__thumb"
                  src={thumbnailHref(cover.slug, cover.thumbnail)}
                  alt=""
                  width={120}
                  height={120}
                  loading="lazy"
                />
                <span className="exhibition__body">
                  <span className="exhibition__title">{cover.title}</span>
                  <span className="exhibition__concept">{cover.concept}</span>
                  <span className="exhibition__meta">
                    <span className={`exhibition__readiness exhibition__readiness--${cover.readiness}`}>
                      {cover.readiness}
                    </span>
                    <span className="exhibition__tags">{cover.tags.join(' · ')}</span>
                  </span>
                  <span className="exhibition__slug">/covers/{cover.slug}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
