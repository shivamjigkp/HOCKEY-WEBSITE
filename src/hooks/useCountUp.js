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
  const hasIntersected = useRef(false);
  const controlsRef = useRef(null);
  const valueRef = useRef(0);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setValue(Number.isFinite(target) ? target : 0);
      return undefined;
    }

    function startAnimation() {
      if (!Number.isFinite(target)) return;
      controlsRef.current?.stop();
      // Animate from wherever it currently is (0 the first time; the
      // previous target if this runs again after settings finish
      // loading) rather than always restarting from 0 — the element
      // may have already been in view with a placeholder value when
      // the real Supabase value arrives.
      controlsRef.current = animate(valueRef.current, target, {
        duration,
        ease: 'easeOut',
        onUpdate: (latest) => {
          valueRef.current = latest;
          setValue(Math.round(latest));
        },
      });
    }

    // Element was already in view from an earlier effect run (e.g. the
    // target just changed from a placeholder default to the real
    // fetched value) — animate to the new target immediately instead of
    // waiting for another intersection event that may never fire again.
    if (hasIntersected.current) {
      startAnimation();
      return () => controlsRef.current?.stop();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        hasIntersected.current = true;
        startAnimation();
      },
      { threshold: 0.4 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      controlsRef.current?.stop();
    };
  }, [target, duration]);

  return { ref, value };
}
