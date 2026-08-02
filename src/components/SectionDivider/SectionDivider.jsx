import './SectionDivider.css';

/**
 * Signature element: echoes the pitch's center circle and halfway line.
 * Used to separate major page sections in place of generic numbered badges.
 */
export default function SectionDivider({ label }) {
  return (
    <div className="section-divider" role="separator">
      <span className="section-divider__line" />
      <span className="section-divider__dot" />
      {label && <span className="section-divider__label eyebrow">{label}</span>}
      <span className="section-divider__line" />
    </div>
  );
}
