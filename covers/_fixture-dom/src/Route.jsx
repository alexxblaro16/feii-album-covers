// Instructor fixture — DOM-first endpoint (no WebGL).

import { useEffect, useState } from 'react';
import './fixture-dom.css';

const SWATCHES = ['#f4d06f', '#ff6b6b', '#4ecdc4', '#556270'];

export default function Route() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    document.documentElement.classList.add('route-_fixture-dom');
    return () => document.documentElement.classList.remove('route-_fixture-dom');
  }, []);

  const color = SWATCHES[index % SWATCHES.length];

  return (
    <main className="fixture-dom" style={{ '--accent': color }}>
      <h1>Fixture — DOM poster</h1>
      <p className="fixture-dom__lede">
        A route may skip WebGL entirely. Layout, type, and interaction live in your module.
      </p>
      <div className="fixture-dom__poster" aria-hidden="true">
        <span className="fixture-dom__glyph">◎</span>
      </div>
      <div className="fixture-dom__controls">
        <button type="button" onClick={() => setIndex((i) => i - 1)}>
          Previous swatch
        </button>
        <button type="button" onClick={() => setIndex((i) => i + 1)}>
          Next swatch
        </button>
      </div>
      <p className="fixture-dom__meta">Active colour: {color}</p>
    </main>
  );
}
