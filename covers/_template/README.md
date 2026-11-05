# `covers/_template` — copy this to light your route

`_template` is never a route. Copy it once (task1) and work only in your copy.

```bash
git switch main && git pull
git checkout -b cover-<slug>-task1-mesh
cp -R covers/_template covers/<slug>
```

Then add **one** object to `covers/registry.json` (keep the array valid JSON, **sorted by slug**, one object per line):

```json
{ "slug": "<slug>", "title": "<Album title>", "album": "<Artist> — <Album> (<year>)", "authors": ["<github-handle>", "<github-handle>"] }
```

`npm run dev` and open `/covers/<slug>`. That is the whole wiring: you never edit `src/App.jsx`.

## What is in the folder

| File | What it is | Task |
| --- | --- | --- |
| `src/Cover.jsx` | The Unit 8 cover Template. Your fork's `Cover.jsx` replaces it unchanged. | 1 |
| `src/parts.js` | `PartId` + `PARTS`. The gallery panel renders one button per part and reads each `note` aloud. | 1 |
| `src/budget.js` | Your `CEILING` (null until you measure). | 1 |
| `src/sleevePicture.js` | How a route loads its own picture: `new URL('../public/sleeve.png', import.meta.url).href`. | 2 |
| `public/sleeve.png` | Original placeholder (not an album cover). Replace with your own square picture. | 2–3 |
| `docs/*.md` | The four hand-in documents, as Templates. | 1–3 |

## The route contract, as this folder shows it

1. **Props.** The gallery's `/covers/:slug` route owns `hovered`, `selected`, and `reduced` (from `prefers-reduced-motion`) and renders `<Cover hovered selected reduced onHover onSelect />` inside its own `<Canvas>` — the same five props as the Unit 8 fork's `App.jsx`. Your `Cover.jsx` has no `<Canvas>` and no state for those five values.
2. **Pictures.** Your pictures live in `covers/<slug>/public/` and are referenced relative to the file that loads them, as `src/sleevePicture.js` does. Never by a path from the site root.
3. **Materials.** R3F `extend` keys are shared by every route, so a material you add (task2's `SleeveMaterial.jsx`) is registered under a slug-unique key — `extend({ OkComputerSleeve: SleeveShader })` → `<okComputerSleeve …/>` — or with the component form, `const Sleeve = extend(SleeveShader)` → `<Sleeve …/>`. This folder registers none. `npm run lint` fails, naming both slugs, when two routes share a key.

Full contract: [`CONTRIBUTING.md`](../../CONTRIBUTING.md#route-contract).
