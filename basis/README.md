# `public/basis/` — the one shared Basis Universal transcoder

`basis_transcoder.js` and `basis_transcoder.wasm` are copied, unchanged, from
`node_modules/three/examples/jsm/libs/basis/` of **three 0.185.1** (this repo's
pin). `KTX2Loader` uses them to turn a `.ktx2` sleeve (ETC1S or UASTC) into a
format this GPU can sample.

- Vendored once, here, for every route. Vite serves the repo-root `public/`
  at the site root, so the files keep their exact names in the build.
- The loader's path is built from `import.meta.env.BASE_URL + 'basis/'`
  (`src/lib/ktx2.js`), so it also works when the gallery is served from a
  subfolder. Never a bare `'/basis/'`, never a CDN copy.
- Routes never copy these files. A route keeps only its own `.ktx2` in
  `covers/<slug>/public/`.
- When the three pin changes, copy both files again from the new version.
  They must match the `KTX2Loader` that loads them.

Vite also emits an unused, hashed copy of the transcoder from three's default
path into `dist/assets/`. That is expected; it is not a second vendoring.

SHA-256 (three 0.185.1):

```
8478b5b6d6b74e7d3082b89f6417321d8d1dc0307f2b30d4484bb11b441696a1  basis_transcoder.js
6cf17dc889352c42e9acf8897107978d127005fe3386c36a0e3845e27967630a  basis_transcoder.wasm
```
