# AI-assisted 3D merge log

<!-- The covenant Template, filled for the studio reference. -->

**Who wrote what.** This whole route (scene, panel, checks, shared loader, encode script, these notes) was drafted by an AI coding agent (Claude, as the cascade phase executor for X10) on 2026-11-05, and landed as one pull request on branch `instructor-studio-x10`. The rows below record what that agent accepted or rejected in its **own** drafts, each with the evidence it ran. They are not a human review. The human decision is the professor's review of the pull request; the agent never approves or merges it.

| Diff | Gate | Decision | Reason |
| --- | --- | --- | --- |
| 1. `SleeveMaterial.jsx` copied from the Cover shaders lesson with the lesson's `extend({ SleeveShader })` | API truth | REJECT | Extend keys are global across routes (Route contract 3); the lesson key would collide with the first student who moves the lesson file. Kept the file byte-for-byte except `extend({ StudioSleeve: SleeveShader })` / `<studioSleeve>`; `npm run lint` lists 1 key, none shared. |
| 2. Unit 9's per-frame `BudgetProbe` pasted unchanged into `src/lib/` | API truth | REJECT | `npm run lint` fails it: `react-hooks/immutability` refuses `gl.info.autoReset = false` on a value `useThree` returned. Rewritten to reach the renderer through `get()` and the frame state; same reads, same per-frame reset. |
| 3. Orientation check: "upright" only if the uv 0,0 corner is within Δ40 of green | literacy | REJECT | Control build: a correctly flipped file with a conversion baked in (`--convert_oetf srgb` on a gAMA 1.0 PNG) read the green square as `rgb(119, 224, 178)` and reported orientation FAIL, blaming the wrong trap. Now: nearest of green / magenta within Δ80; that control reads "upright: pass" and fails only the colour check, and an unflipped control still reads "upside down: FAIL". |
| 4. Compare panel pinned to the Canvas's top-left corner | ui-canvas | REJECT | Screenshot (1280 × 800): the panel covered the sleeve's uv 0,0 label and corner, the very thing the orientation check asks you to look at. Moved to the top-right, foldable (`<details open>`), pointer events stopped so a click on the panel never selects the mesh behind it or orbits. |
| 5. Keeping every visited picture resident while switching modes | memory | REJECT | Control build without the dispose, same walk: textures PNG 2 → ETC1S 3 → UASTC 4 → Flat 4 → PNG 4 ("over ceiling"), so "the count goes up by one, either format" would look false. The sleeve now disposes the previous picture's GPU copy on mode change; walk reads 1 (Flat) → 2 (any picture) every time. |
| 6. Sleeve picture drawn with ImageMagick `-annotate` | literacy | REJECT | This ImageMagick build has no FreeType: the type silently did not render, so the "sharp type" half of the ETC1S/UASTC choice was missing. The sharp layer is now SVG rendered by `rsvg-convert`; verified by eye and by PSNR on the title strip. |
| 7. `encode-cover.mjs` flags as one shell string | API truth | REJECT | Args are arrays (no shell, no quoting bugs); `--assign_oetf`, `srgb` as two array items; `--zcmp 18` on UASTC only (toktx exits 1 for ETC1S + `--zcmp`, checked). |
| 8. `src/lib/ktx2.js`: `useLoader(KTX2Loader, url, …)` with `setTranscoderPath(import.meta.env.BASE_URL + 'basis/')` | API truth | ACCEPT | Root build and `BASE_PATH=/feii-album-covers/` build both fetched the transcoder from `<base>basis/` (the vendored pair), never three's hashed default copy; every check passed in both. |
| 9. Sheen motion under `prefers-reduced-motion` | motion | ACCEPT | Emulated reduce: two screenshots 900 ms apart were byte-identical; without it they differ. Hover, click and the switch still work. |

At least two REJECT rows: yes (1–7).
