import { useEffect, useState } from 'react';

/**
 * `prefers-reduced-motion: reduce` as a React boolean. Same hook as the
 * Unit 8 sandbox's App.jsx.
 *
 * When it is true, a cover stops its `useFrame` motion (and a shader freezes
 * its clock uniform). Hover, click, and the panel buttons keep working:
 * motion is not interaction.
 *
 * @returns {boolean}
 */
export default function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
