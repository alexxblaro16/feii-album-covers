// Neutral starter — default DOM endpoint. Swap in starters/webgl or starters/hybrid
// from covers/_template/starters/ if your team owns a Canvas route from task1.
// See covers/_template/README.md and covers/_studio (reference only, not copy).

import { useEffect, useState } from 'react';
import './route.css';

export default function Route() {
  const [note, setNote] = useState('Replace this layout with your album cover experience.');

  useEffect(() => {
    const scope = 'route-starter';
    document.documentElement.classList.add(scope);
    return () => document.documentElement.classList.remove(scope);
  }, []);

  return (
    <main className="route-starter">
      <h1>Album title (DOM text)</h1>
      <p className="route-starter__lede">{note}</p>
      <div className="route-starter__frame" aria-hidden="true">
        <span className="route-starter__glyph">▢</span>
      </div>
      <div className="route-starter__controls">
        <button type="button" onClick={() => setNote('Artist — Album (year) belongs in title + concept in registry.json.')}>
          Show registry hint
        </button>
      </div>
      <p className="route-starter__meta">
        WebGL, hybrid, or richer DOM: copy a variant from <code>starters/</code> or study{' '}
        <code>covers/_studio</code> as optional reference — not the only valid hand-in.
      </p>
    </main>
  );
}
