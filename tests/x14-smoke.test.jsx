import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CoverRoute from '../src/gallery/CoverRoute.jsx';
import DomRoute from '../covers/_fixture-dom/src/Route.jsx';
import WebglRoute from '../covers/_fixture-webgl/src/Route.jsx';

afterEach(() => {
  document.documentElement.className = '';
  delete document.body.dataset.activeRoute;
});

describe('PHASE-X14 acceptance smoke', () => {
  it('F1: throwing route shows alert; project selector and route nav stay mounted', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={['/covers/_fixture-throw']}>
        <Routes>
          <Route path="/covers/:slug" element={<CoverRoute />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('_fixture-throw');
    });

    expect(document.querySelector('[data-exhibition-nav="project-selector"]')).toBeTruthy();
    expect(document.querySelector('[data-exhibition-nav="route-nav"]')).toBeTruthy();
    expect(screen.getByRole('link', { name: /all projects/i })).toBeInTheDocument();

    errorSpy.mockRestore();
  });

  it('F2: route unmount removes documentElement scope classes', () => {
    const webgl = render(<WebglRoute />);
    expect(document.documentElement.classList.contains('route-_fixture-webgl')).toBe(true);
    webgl.unmount();
    expect(document.documentElement.classList.contains('route-_fixture-webgl')).toBe(false);

    const dom = render(<DomRoute />);
    expect(document.documentElement.classList.contains('route-_fixture-dom')).toBe(true);
    dom.unmount();
    expect(document.documentElement.classList.contains('route-_fixture-dom')).toBe(false);
  });
});
