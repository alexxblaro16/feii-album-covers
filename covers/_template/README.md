# `covers/_template` — copy this to light your route

`_template` is never a route. Copy it once (task1) and work only in your copy.

```bash
git switch main && git pull
git checkout -b cover-<slug>-task1-mesh
cp -R covers/_template covers/<slug>
```

Then add **one** object to `covers/registry.json` (valid JSON, **sorted by slug**, one object per line):

```json
{ "slug": "<slug>", "title": "<Album title>", "authors": ["<github-handle>"], "concept": "<Artist> — <Album> (<year>). One-line pitch for the gallery.", "thumbnail": "thumbnail.svg", "tags": ["dom"], "readiness": "wip" }
```

Replace `public/thumbnail.svg` with your own square preview when you have art. `npm run dev` → `/covers/<slug>`.

## Neutral starters (D26)

| Path | Role |
| --- | --- |
| `src/Route.jsx` | Default **DOM** endpoint (no mandated sleeve/vinyl stage). |
| `starters/dom/` | Alternate DOM poster starter. |
| `starters/webgl/` | Route-owned `<Canvas>` starter. |
| `starters/hybrid/` | DOM + Canvas split starter. |
| `docs/*.md` | Evidence templates (shader / KTX2 / budget — **N/A honestly** if your route never uses those technologies). |

`covers/_studio` is **one reference** (sleeve shader + KTX2). Copy `_template`, not `_studio`.

Full contract: [`CONTRIBUTING.md`](../../CONTRIBUTING.md#route-contract).
