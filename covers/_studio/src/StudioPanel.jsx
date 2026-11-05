// covers/_studio/src/StudioPanel.jsx — the KTX2 compare switch and its readings.
// Plain DOM (Cover.jsx mounts it through drei's <Html>, beside the Canvas), so
// the switch is keyboard-operable and every number is text a screen reader can
// read. No colour-only cue: each check says "pass" or "FAIL" in words. No
// transitions, so there is nothing for prefers-reduced-motion to stop.

import { COLOUR_TOLERANCE } from './sleeveChecks.js';
import { MODES } from './sleeveKtx2.js';
import './studio.css';

// The panel sits inside the Canvas's event source, so pointer events that
// start on it must not reach R3F (a click would select the mesh behind it) or
// OrbitControls (a drag would orbit). React's listener sits on the panel's own
// root, below that event source, so stopping here is enough.
const stop = (event) => event.stopPropagation();
const ISOLATE = {
  onPointerDown: stop,
  onPointerMove: stop,
  onPointerUp: stop,
  onClick: stop,
  onDoubleClick: stop,
  onContextMenu: stop,
  onWheel: stop,
};

const bytes = (n) => `${n.toLocaleString('en-US')} B`;
const rgb = (c) => `rgb(${c.join(', ')})`;

/**
 * @param {object} props
 * @param {import('./sleeveKtx2.js').SleeveMode} props.mode
 * @param {(mode: import('./sleeveKtx2.js').SleeveMode) => void} props.onMode
 * @param {import('./sleeveChecks.js').SleeveReading | null} props.reading  For the current mode, or null while it loads.
 * @param {number | null} props.fileBytes  Bytes of the current file as fetched (the suitcase).
 * @param {number | null} props.textureCount  renderer.info.memory.textures — a COUNT.
 * @param {string} props.headingId
 */
export default function StudioPanel({ mode, onMode, reading, fileBytes, textureCount, headingId }) {
  const current = reading && reading.mode === mode ? reading : null;
  const flat = mode === 'flat';

  let summary = 'Loading the sleeve…';
  if (flat) summary = 'Flat sleeve, no picture: the texture count before a picture loads.';
  else if (current) {
    const failed = [
      !current.colorSpaceOk && 'colorSpace',
      !current.colourOk && 'colour',
      current.orientation !== 'upright' && 'orientation',
    ].filter(Boolean);
    summary = failed.length
      ? `${mode.toUpperCase()}: FAIL — ${failed.join(', ')}. Re-encode; do not patch the shader.`
      : `${mode.toUpperCase()}: every check passes.`;
  }

  return (
    <section className="studio-panel" aria-labelledby={headingId} {...ISOLATE}>
      {/* A <details>, open by default, so the panel can be folded away on a small screen. */}
      <details open>
        <summary>
          <h2 id={headingId}>Sleeve picture: KTX2 compare</h2>
        </summary>
        <fieldset>
          <legend>Load the sleeve as</legend>
          {MODES.map((item) => (
            <label key={item.id}>
              <input
                type="radio"
                name="studio-sleeve-mode"
                value={item.id}
                checked={mode === item.id}
                onChange={() => onMode(item.id)}
              />
              <span className="mode">{item.label}</span> <span className="hint">{item.hint}</span>
            </label>
          ))}
        </fieldset>

        <dl>
          <dt>file bytes (suitcase)</dt>
          <dd>{flat ? '—' : fileBytes === null ? '…' : bytes(fileBytes)}</dd>

          <dt>GPU bytes (room), computed</dt>
          <dd>
            {flat || !current ? (
              '—'
            ) : (
              <>
                {bytes(current.gpuAll)} <span className="hint">all {current.levels} levels</span>
                <br />
                {bytes(current.gpuLevel0)} <span className="hint">level 0 only</span>
              </>
            )}
          </dd>

          <dt>texture.format</dt>
          <dd>{flat || !current ? '—' : <code>{current.format}</code>}</dd>

          <dt>
            renderer.info.memory.textures <span className="hint">(a count, not bytes)</span>
          </dt>
          <dd>{textureCount ?? '…'}</dd>

          <dt>colorSpace check</dt>
          <dd>
            {flat || !current ? (
              '—'
            ) : (
              <>
                <code>{current.colorSpace}</code> {current.colorSpaceOk ? '=== SRGBColorSpace: pass' : '!== SRGBColorSpace: FAIL'}
              </>
            )}
          </dd>

          <dt>colour vs the PNG file</dt>
          <dd>
            {flat || !current
              ? '—'
              : current.colours.map((c) => (
                  <span key={c.id} className="row">
                    {c.label}: {rgb(c.got)} vs {rgb(c.expect)}, Δ{c.delta}{' '}
                    {c.delta <= COLOUR_TOLERANCE ? 'pass' : 'FAIL'}
                  </span>
                ))}
          </dd>

          <dt>orientation (corner at uv 0,0)</dt>
          <dd>
            {flat || !current
              ? '—'
              : `${rgb(current.corner)}: ${current.orientation === 'upright' ? 'green, upright: pass' : `${current.orientation}: FAIL`}`}
          </dd>
        </dl>

        <p className="summary" aria-live="polite">
          {summary}
        </p>
        <p className="hint">
          GPU bytes and texture.format belong to this browser and GPU: the transcoder picks the format the device
          offers. Colour tolerance Δ ≤ {COLOUR_TOLERANCE} per channel (codec loss).
        </p>
      </details>
    </section>
  );
}
