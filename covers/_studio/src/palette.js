// covers/_studio/src/palette.js — the studio's own colour and layout decisions.
//
// One source for every colour the studio uses: the scene (Cover.jsx), the
// original sleeve picture (tools/make-sleeve.mjs paints public/sleeve.png from
// these values), and the runtime checks (sleeveChecks.js samples the patches
// below and compares them). Gallery chrome colours are not here: they live in
// src/theme/tokens.js. Plain data, no React, so the Node tool can import it.

/** Scene colours: album decisions for the studio's own tree. */
export const SCENE_COLOR = {
  stage: '#2b2723',
  sleeve: '#cfc6ba',
  vinyl: '#141210',
  accent: '#e36a2c',
  hover: '#f6e2bc',
};

/**
 * The original sleeve picture (D8: made for this repository, not an album
 * cover). A blurred, grainy "photographic" ground, so ETC1S vs UASTC is a real
 * choice, with sharp type and flat patches on top.
 */
export const SLEEVE = {
  size: 512,
  // Gradient map for the grainy ground: dark → mid → warm.
  ground: ['#0d1b2a', '#1f3a5f', '#c9783f'],
  disc: '#e36a2c',
  grey: '#808080',
  ink: '#f4efe6',
  title: 'SIGNAL & GRAIN',
  subtitle: 'studio reference · side A · original art',
  // One flat square per corner, each a different colour, so orientation can be
  // checked by reading a colour, not only by reading a label.
  corner: {
    u0v0: '#2fbf71', // bottom-left  — green
    u0v1: '#d63fa3', // top-left     — magenta
    u1v1: '#f2c230', // top-right    — yellow
    u1v0: '#29a8d6', // bottom-right — cyan
  },
};

/**
 * Where the runtime checks read the picture, in PICTURE pixels: x from the
 * left, y from the TOP (the way an image editor counts). sleeveChecks.js turns
 * them into UV. Each point sits inside a flat patch, well away from its edges,
 * so ETC1S block loss and filtering do not decide the result.
 */
export const PROBE = {
  disc: { x: 256, y: 360, expect: SLEEVE.disc, label: 'orange disc' },
  grey: { x: 72, y: 362, expect: SLEEVE.grey, label: 'grey patch' },
  u0v0: { x: 30, y: 482, expect: SLEEVE.corner.u0v0, label: 'corner uv 0,0' },
  u0v1: { x: 30, y: 30, expect: SLEEVE.corner.u0v1, label: 'corner uv 0,1' },
};
