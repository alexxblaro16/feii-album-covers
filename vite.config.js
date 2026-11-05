import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The gallery may later be served from a subfolder (for example
// https://<host>/feii-album-covers/). Set BASE_PATH at build time; every path
// the app builds reads import.meta.env.BASE_URL, never a hard-coded '/'.
//   BASE_PATH=/feii-album-covers/ npm run build
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
  },
});
