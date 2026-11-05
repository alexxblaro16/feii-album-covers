// _studio — instructor reference route. Ids match covers/_template/src/parts.js.

export const PartId = {
  sleeve: 'sleeve',
  vinyl: 'vinyl',
  stage: 'stage',
};

export const PARTS = [
  {
    id: PartId.sleeve,
    name: 'Sleeve',
    note:
      'An original picture (not an album cover), printed by the sleeve shader: one texture lookup at the sleeve UV, plus a band of light that changes the colour, never the place. Switch PNG, ETC1S and UASTC in the panel on the canvas: file bytes and GPU bytes move; the texture count does not.',
  },
  {
    id: PartId.vinyl,
    name: 'Vinyl',
    note: 'The disc slides part-way out of the sleeve and back: one position write per frame, no allocation. It stops under prefers-reduced-motion; hover and click keep working.',
  },
  {
    id: PartId.stage,
    name: 'Stage',
    note: 'The floor the cover stands on. One box, one standard material, lit by the gallery lights.',
  },
];
