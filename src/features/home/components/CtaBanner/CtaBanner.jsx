import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import './CtaBanner.css';

export default function CtaBanner() {
  return (
    <section className="cta-banner">
      <div className="container cta-banner__inner">
        <h2 className="cta-banner__title">Follow every shift, every season.</h2>
        <p className="cta-banner__subtitle">
          Schedules, results, and highlights — get in touch or explore the full gallery.
        </p>
        <div className="cta-banner__actions">
          <Link className="btn btn-primary" to={ROUTES.CONTACT}>
            Contact the Team
          </Link>
          <Link className="btn btn-outline" to={ROUTES.GALLERY}>
            Browse Gallery
          </Link>
        </div>
      </div>
    </section>
  );
}
