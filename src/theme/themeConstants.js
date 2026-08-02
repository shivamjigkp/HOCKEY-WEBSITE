/**
 * Non-CSS theme constants.
 *
 * CSS variables (src/styles/variables.css + themes.css) remain the source
 * of truth for all styling. This file exists only for the rare case where
 * JavaScript itself needs a theme-aware value — e.g. Framer Motion
 * `animate` props, which cannot read CSS custom properties directly.
 *
 * Keep this file minimal. If a value can be expressed in CSS, it belongs
 * in styles/, not here.
 */

export const THEME_NAMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const MOTION_EASE_STANDARD = [0.4, 0, 0.2, 1];
