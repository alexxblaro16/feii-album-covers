import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { covers } from './registry.js';

/**
 * Collapsed-by-default project switcher. Fixed overlay — does not consume route
 * layout height (D26). Keyboard: Tab into trigger; Enter/Space toggles; Escape
 * closes; ArrowUp/ArrowDown move focus inside the list.
 */
export default function ProjectSelector() {
  const { slug: activeSlug } = useParams();
  const navigate = useNavigate();
  const listId = useId();
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);

  const active = covers.find((c) => c.slug === activeSlug) ?? null;
  const label = active ? active.title : 'Projects';

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (covers.length === 0) return null;

  const onListKeyDown = (event) => {
    const items = event.currentTarget.querySelectorAll('[data-project-link]');
    const idx = [...items].indexOf(document.activeElement);
    if (event.key === 'ArrowDown' && idx < items.length - 1) {
      event.preventDefault();
      items[idx + 1].focus();
    }
    if (event.key === 'ArrowUp' && idx > 0) {
      event.preventDefault();
      items[idx - 1].focus();
    }
    if (event.key === 'Enter' || event.key === ' ') {
      const target = document.activeElement;
      if (target instanceof HTMLAnchorElement && target.dataset.projectLink) {
        event.preventDefault();
        navigate(target.getAttribute('href') ?? '/');
        close();
      }
    }
  };

  return (
    <div className={`project-select${open ? ' project-select--open' : ''}`}>
      <button
        ref={triggerRef}
        type="button"
        className="project-select__trigger"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="project-select__label">{label}</span>
        <span className="project-select__hint" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
      </button>
      {open ? (
        <nav id={listId} className="project-select__panel" aria-label="All projects" onKeyDown={onListKeyDown}>
          <ul className="project-select__list">
            {covers.map((cover) => (
              <li key={cover.slug}>
                <Link
                  to={`/covers/${cover.slug}`}
                  data-project-link
                  className={cover.slug === activeSlug ? 'is-active' : undefined}
                  onClick={() => close()}
                >
                  <span className="project-select__title">{cover.title}</span>
                  <span className="project-select__slug">/covers/{cover.slug}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
