import { useEffect } from 'react';
import './route-dom.css';

export default function Route() {
  useEffect(() => {
    document.documentElement.classList.add('route-dom-starter');
    return () => document.documentElement.classList.remove('route-dom-starter');
  }, []);

  return (
    <main className="dom-starter">
      <h1>Album title</h1>
      <p>Artist — Album (year) in registry <code>concept</code>; this heading is DOM text.</p>
      <figure className="dom-starter__poster">
        <div className="dom-starter__art" aria-hidden="true" />
        <figcaption>Replace with your layout — no WebGL required.</figcaption>
      </figure>
    </main>
  );
}
