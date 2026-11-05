# feii-album-covers

The FE II class aggregator for the [Units 8–9 assignment](https://ruvebal.github.io/web-atelier-udit/lessons/en/feii/units-8-9-assignment/): a **web 3D version of your favourite album cover**, handed in as pull requests that light your team's route.

One repository, one gallery, one route per team at `/covers/<slug>`. The instructor runs `npm run dev` once and walks every cover by URL. Students never get a separate assignment repo and never replace the router: a team adds **one folder** (`covers/<slug>/`) and **one registry object**, and its route turns on.

`react-template` remains the Units 8–9 **lesson sandbox** (the beacon). Practise there or in CodeSandbox; hand in here.

**Start with [`CONTRIBUTING.md`](CONTRIBUTING.md)** — branch pattern, PR ritual, route contract. Before your first AI prompt, read the [AI-assisted 3D covenant](https://ruvebal.github.io/web-atelier-udit/lessons/en/feii/ai-assisted-3d-covenant/).

## Run it

```bash
npm ci
npm run dev        # http://localhost:5173/ — the gallery index
npm run lint       # ESLint + registry schema check
npm run build      # production build into dist/
```

Pins match `react-template`: `react` / `react-dom` 19.3.1, `three` 0.185.1, `@react-three/fiber` 9.8.2, `@react-three/drei` 10.7.9, `react-router-dom` 7.18.5. JavaScript + JSDoc; no TypeScript.

To serve from a subfolder, build with `BASE_PATH=/feii-album-covers/ npm run build` (and preview with the same variable). The router's `basename` and every built path come from `import.meta.env.BASE_URL`.

## Route contract (summary)

The full text is in [`CONTRIBUTING.md`](CONTRIBUTING.md#route-contract).

1. **Props.** The gallery's `/covers/:slug` route (`src/gallery/CoverRoute.jsx`) owns `hovered`, `selected`, and `reduced` (from `prefers-reduced-motion`) and renders `<Cover hovered selected reduced onHover onSelect />` inside its own `<Canvas>` — the same five props the Unit 8 cover fork's `App.jsx` passes. A fork's `Cover.jsx` moves over unchanged; it never renders a `<Canvas>`.
2. **Pictures.** Each route keeps its pictures in `covers/<slug>/public/` and references them relative to the loading module — `new URL('../public/sleeve.png', import.meta.url).href` — never by a path from the site root.
3. **Materials.** R3F `extend` keys are shared by every route. Register a material under a slug-unique key (`extend({ OkComputerSleeve: SleeveShader })` → `<okComputerSleeve …/>`) or use the component form (`const Sleeve = extend(SleeveShader)` → `<Sleeve …/>`). `npm run lint` fails when two slugs share a key.

`covers/_template/` shows 1 and 2.

## Layout

```
src/
  main.jsx                 BrowserRouter (basename from BASE_URL), tokens → CSS vars
  App.jsx                  instructor-owned router: / and /covers/:slug
  gallery/
    Home.jsx               index: one link per registered cover
    CoverRoute.jsx         THE ROUTE: owns state, Canvas, panel; passes the five props
    registry.js            registry.json + import.meta.glob('../../covers/*/src/Cover.jsx')
    CanvasErrorBoundary.jsx
  lib/                     BudgetProbe, budget verdict, reduced-motion hook, JSDoc typedefs
  theme/tokens.js          colour tokens (single source)
covers/
  registry.json            [{ slug, title, album, authors }]
  _template/               copy to covers/<slug>/ — never a route
  _studio/                 instructor reference route (stub until the reference scene lands)
scripts/
  check-registry.mjs       registry schema + sort, unique R3F extend keys (runs in npm run lint)
  encode-cover.mjs         PNG → ETC1S + UASTC KTX2 (stub; fails loudly without toktx)
.cursor/rules/             00-project, 20-r3f-patterns, 30-shaders, 40-asset-pipeline, 50-performance
.github/
  pull_request_template.md contract · acceptance · checks · a11y · rights · AI Review Log
  workflows/lint-and-build.yml   npm ci → lint → build (no deploy, no secrets)
```

A slug is a route only when it is both in `covers/registry.json` **and** has `covers/<slug>/src/Cover.jsx`.

## Collaboration

The TTOD contribution ritual, mapped onto cover routes: branch `cover-<slug>-task<N>-<short-topic-name>` from `main`; change only your slug plus one registry object; the PR template with its **AI Review Log**; the `lint-and-build` check and **one human approval** (a course rule: the instructor merges only through PRs; see [`CONTRIBUTING.md`](CONTRIBUTING.md) step 6); small staged PRs (task1 mesh → task2 shader → task3 KTX2 → task4 cross-cover); at least one PR into another slug and one formal review outside your own. Bots and assistants may comment; they never approve or merge. Details: [`CONTRIBUTING.md`](CONTRIBUTING.md). Contribution epigraph: Tao of Development `qa-007`.

No MCP servers, MCP shopping, Stitch, 21st.dev, or other assistant servers, design generators, or editor plugins are homework here. The covenant is the student contract; everything else is optional.

## Rights

This repository is private because it holds classroom artwork and sleeve photographs. **Private is not a licence.** Each route declares its picture's right in `docs/ktx2-note.md`: a photograph of a physical album the team owns, or a named licence. `_studio` uses original or PD/CC art only. The `_template` placeholder (`covers/_template/public/sleeve.png`) is original art made for this repository.

## Instructor notes

- **Review loop** (TTOD [`reviewing-cohort-prs.md`](https://github.com/ruvebal/ttod/blob/main/docs/public/guides/reviewing-cohort-prs.md)): check student PRs out in one sibling worktree, never in the teaching clone — `git fetch origin && git worktree add --detach ../feii-album-covers-review origin/main` (detached, because `main` is already checked out in the teaching clone), then `gh pr checkout <n>` there. Humans run `gh pr review --approve | --request-changes`; merge with `gh pr merge --squash`. A local model may comment; there is no cloud review workflow.
- **Merge rule (D23, option d):** `lint-and-build` must pass and one human must approve. This is a course rule, enforced by the instructor merging only through PRs. GitHub branch protection is not available on this plan: the branch-protection and rulesets APIs return `403 Upgrade to GitHub Pro or make this repository public` for this private personal repository, and the repository stays on the personal account. Collaborators on a personal repository get push access, including to `main`, so a student could push or force-push `main`; CONTRIBUTING step 6 forbids it, and the commit history and Actions log show it. Keep a local mirror. `lint-and-build` runs on every PR and every push to `main`.
- **CODEOWNERS** requests the instructor's review for `src/`, `scripts/`, `covers/_studio/`, `covers/_template/`, `.github/`, `.cursor/`, the README and CONTRIBUTING, `index.html`, `.gitignore`, and the package and build config. Without branch protection it requests a review; it does not block a merge. Student slugs are not instructor-owned.
- **Shared assets**: the Basis transcoder will be vendored once at the repo-root `public/basis/` (path built from `import.meta.env.BASE_URL`) when the KTX2 loader lands; it is not in the repository yet. Routes never copy it.
