import './Loader.css';

export default function Loader({ label = 'Loading' }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader__ball" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
