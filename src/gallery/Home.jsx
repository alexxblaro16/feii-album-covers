import { Link } from 'react-router-dom';
import { covers, missingModules } from './registry.js';

/**
 * Gallery index: one link per lit route, in registry order. Plain links, so
 * the whole gallery is walkable by keyboard and by URL.
 */
export default function Home() {
  return (
    <main className="gallery">
      <h1>Album covers — FE II Units 8–9</h1>
      <p className="lede">
        One route per team at <code>/covers/&lt;slug&gt;</code>. Open a cover to orbit it, hover and
        click its parts, and read its budget.
      </p>

      {missingModules.length > 0 ? (
        <p className="notice warn" role="status">
          In the registry but missing <code>src/Cover.jsx</code>: {missingModules.join(', ')}
        </p>
      ) : null}

      {covers.length === 0 ? (
        <p className="notice">
          No covers yet. A team lights its route by copying <code>covers/_template/</code> to{' '}
          <code>covers/&lt;slug&gt;/</code> and adding one object to <code>covers/registry.json</code>{' '}
          — see <code>CONTRIBUTING.md</code>.
        </p>
      ) : (
        <ul className="cover-list">
          {covers.map((cover) => (
            <li key={cover.slug}>
              <Link to={`/covers/${cover.slug}`}>
                <span className="title">{cover.title}</span>
                <span className="album">{cover.album}</span>
                <span className="slug">/covers/{cover.slug}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
