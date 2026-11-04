import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { applyTokens } from './theme/tokens.js';
import './index.css';
import App from './App.jsx';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Missing #root mount node');
}

applyTokens(document.documentElement);

// The site may be served from a subfolder (vite.config.js `base`). Vite exposes
// it as BASE_URL with a trailing slash; the router wants it without one.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

createRoot(root).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
