import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import './AdminModeToggle.css';

/**
 * ⚠️ TEMPORARY: this is a client-side-only toggle with no real
 * authentication behind it — anyone with the site open can flip it.
 * It exists only so add/remove/reorder controls can be built and used
 * *now*. Phase 7 replaces this entirely with Supabase Auth + a real
 * Admin Dashboard; every component reading `isAdminMode` should keep
 * working unchanged when that happens (just swap what sets the flag).
 */
export function useAdminMode() {
  const [isAdminMode, setIsAdminMode] = useLocalStorageState('mmmut_admin_mode', false);
  return [isAdminMode, setIsAdminMode];
}

export default function AdminModeToggle() {
  const [isAdminMode, setIsAdminMode] = useAdminMode();

  return (
    <div className="admin-mode-toggle">
      <label className="admin-mode-toggle__label">
        <input
          type="checkbox"
          checked={isAdminMode}
          onChange={(e) => setIsAdminMode(e.target.checked)}
        />
        <span>Admin Mode {isAdminMode ? '(ON — edits are live in your browser)' : '(off)'}</span>
      </label>
    </div>
  );
}
