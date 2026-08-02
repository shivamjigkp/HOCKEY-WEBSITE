import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';

/**
 * Animates a numeric value from 0 up to `target` once the returned ref
 * scrolls into view. Used for statistics counters (see MASTER_PROMPT
 * ANIMATIONS section — "Statistics Counter" is an approved Framer Motion
 * use case).
 *
 * @param {number} target - final value to count up to
 * @param {{ duration?: number }} options
 * @returns {{ ref: import('react').RefObject, value: number }}
 */
export function useCountUp(target, { duration = 1.4 } = {}) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setValue(Number.isFinite(target) ? target : 0);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return;

        // Guard against animating to an invalid target (e.g. settings
        // haven't finished loading yet and target is still undefined).
        // Only commit hasAnimated once we actually have a real number,
        // so a later re-render with the correct value still animates
        // in — instead of freezing on "NaN" forever.
        if (!Number.isFinite(target)) return;

        hasAnimated.current = true;
        const controls = animate(0, target, {
          duration,
          ease: 'easeOut',
          onUpdate: (latest) => setValue(Math.round(latest)),
        });
        node.__countUpControls = controls;
      },
      { threshold: 0.4 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      node.__countUpControls?.stop();
    };
  }, [target, duration]);

  return { ref, value };
}
