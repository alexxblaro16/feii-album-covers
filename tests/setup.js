import '@testing-library/jest-dom/vitest';

// R3F Canvas expects ResizeObserver in jsdom.
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
