import { useCursorFx } from '@/hooks/useCursorFx';
import './CursorToggle.css';

/**
 * Lets people turn the custom cursor effects off (MASTER_PROMPT: "Allow
 * disabling cursor effects if required"). Only rendered when the device
 * actually supports them (see useCursorFx/CursorContext) — there's
 * nothing to toggle on a touchscreen.
 */
export default function CursorToggle() {
  const { isSupported, isEnabled, toggleCursorFx } = useCursorFx();

  if (!isSupported) return null;

  return (
    <button
      type="button"
      className="cursor-toggle"
      onClick={toggleCursorFx}
      aria-label={isEnabled ? 'Turn off cursor effects' : 'Turn on cursor effects'}
      aria-pressed={isEnabled}
      title={isEnabled ? 'Cursor effects: on' : 'Cursor effects: off'}
    >
      <span className="cursor-toggle__track">
        <span className="cursor-toggle__thumb" />
      </span>
    </button>
  );
}
