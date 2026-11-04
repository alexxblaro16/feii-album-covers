/**
 * Design tokens for the gallery chrome and the shared Canvas. This file is the
 * single source of colour for instructor-owned code: `main.jsx` writes the
 * `--fe-*` CSS custom properties from it, `index.css` only reads `var(--fe-*)`,
 * and the route stage reads `SCENE` for the Canvas background.
 *
 * Values match the Unit 8 sandbox, so a cover looks the same here as it did in
 * the fork. A route's own colours live in its own `Cover.jsx`: they are album
 * decisions, not gallery tokens.
 */
export const COLOR = {
  ground: '#161411',
  ink: '#f4efe6',
  inkMuted: 'rgb(244 239 230 / 0.72)',
  rule: 'rgb(244 239 230 / 0.16)',
  outline: 'rgb(244 239 230 / 0.35)',
  accent: '#e36a2c',
  onAccent: '#1a120c',
  warn: '#ffb4a2',
};

export const SCENE = {
  background: COLOR.ground,
};

/**
 * Writes every COLOR token onto :root as `--fe-<kebab-name>`.
 *
 * @param {HTMLElement} root
 */
export function applyTokens(root) {
  for (const [name, value] of Object.entries(COLOR)) {
    const kebab = name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
    root.style.setProperty(`--fe-${kebab}`, value);
  }
}
