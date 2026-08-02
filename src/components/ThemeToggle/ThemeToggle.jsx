import { useTheme } from '@/hooks/useTheme';
import './ThemeToggle.css';

function SunIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="4.5" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2.5v2.5M12 19v2.5M21.5 12H19M5 12H2.5M18.5 5.5 16.8 7.2M7.2 16.8 5.5 18.5M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5" />
      </g>
    </svg>
  );
}

function MoonIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" aria-hidden="true" {...props}>
      <path
        d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      title={isDark ? 'Dark mode' : 'Light mode'}
    >
      <span className="theme-toggle__track">
        <SunIcon className="theme-toggle__icon theme-toggle__icon--sun" />
        <MoonIcon className="theme-toggle__icon theme-toggle__icon--moon" />
        <span className="theme-toggle__thumb">
          {isDark ? <MoonIcon /> : <SunIcon />}
        </span>
      </span>
    </button>
  );
}
