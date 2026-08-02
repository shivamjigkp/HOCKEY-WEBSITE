import { useEffect, useRef } from 'react';
import { useCursorFx } from '@/hooks/useCursorFx';
import './CursorEffects.css';

const INTERACTIVE_SELECTOR = 'a, button, .btn, input, textarea, select, [role="button"]';
const MAGNETIC_SELECTOR = '.btn';
const MAGNETIC_PULL = 0.35; // fraction of the offset the button moves toward the pointer

/**
 * Premium custom cursor (MASTER_PROMPT "CURSOR EFFECTS"): a glow ring that
 * trails the pointer with easing ("Smooth Cursor" + "Cursor Glow"), a dot
 * that tracks it exactly, both expanding on hover of interactive elements
 * ("Interactive Cursor" + "Hover Expansion" + "Pointer Transformations"),
 * plus a magnetic pull on `.btn` elements ("Magnetic Buttons").
 *
 * Renders nothing — and does none of the work below — unless
 * useCursorFx().isActive is true (fine-pointer device, motion allowed,
 * and the user hasn't turned it off via CursorToggle). All DOM writes
 * happen imperatively via refs/rAF, never React state, so this never
 * triggers a re-render on mouse move.
 */
export default function CursorEffects() {
  const { isActive } = useCursorFx();
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (!isActive) return undefined;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return undefined;

    document.body.classList.add('cursor-fx-active');

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...pointer };
    let magneticEl = null;
    let rafId;

    function resetMagnetic() {
      if (magneticEl) {
        magneticEl.style.transform = '';
        magneticEl = null;
      }
    }

    function handlePointerMove(e) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;

      const interactive = e.target.closest?.(INTERACTIVE_SELECTOR);
      dot.classList.toggle('cursor-dot--hover', Boolean(interactive));
      ring.classList.toggle('cursor-ring--hover', Boolean(interactive));

      const magneticTarget = e.target.closest?.(MAGNETIC_SELECTOR) ?? null;
      if (magneticTarget !== magneticEl) resetMagnetic();
      magneticEl = magneticTarget;

      if (magneticEl) {
        const rect = magneticEl.getBoundingClientRect();
        const offsetX = (pointer.x - (rect.left + rect.width / 2)) * MAGNETIC_PULL;
        const offsetY = (pointer.y - (rect.top + rect.height / 2)) * MAGNETIC_PULL;
        magneticEl.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      }
    }

    function handlePointerDown() {
      dot.classList.add('cursor-dot--active');
      ring.classList.add('cursor-ring--active');
    }

    function handlePointerUp() {
      dot.classList.remove('cursor-dot--active');
      ring.classList.remove('cursor-ring--active');
    }

    function handleLeaveWindow() {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    }

    function handleEnterWindow() {
      dot.style.opacity = '';
      ring.style.opacity = '';
    }

    // rAF loop: dot tracks the pointer exactly, the ring eases toward it
    // (lerp) for the trailing "smooth cursor" feel. Kept lightweight —
    // no external animation library needed for a per-frame lerp.
    function tick() {
      dot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;

      ringPos.x += (pointer.x - ringPos.x) * 0.18;
      ringPos.y += (pointer.y - ringPos.y) * 0.18;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;

      rafId = requestAnimationFrame(tick);
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('mouseleave', handleLeaveWindow);
    document.addEventListener('mouseenter', handleEnterWindow);
    rafId = requestAnimationFrame(tick);

    return () => {
      document.body.classList.remove('cursor-fx-active');
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handleLeaveWindow);
      document.removeEventListener('mouseenter', handleEnterWindow);
      cancelAnimationFrame(rafId);
      resetMagnetic();
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="cursor-fx" aria-hidden="true">
      <div ref={ringRef} className="cursor-ring" />
      <div ref={dotRef} className="cursor-dot" />
    </div>
  );
}
