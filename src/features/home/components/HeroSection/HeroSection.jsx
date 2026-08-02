import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import './HeroSection.css';

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="container hero__inner">
        <p className="eyebrow">MMMUT Hockey — Official Platform</p>
        <h1 className="hero__title">
          Every Match. Every Milestone.
          <br />
          One Team.
        </h1>
        <span className="hero__rule" aria-hidden="true" />
        <p className="hero__subtitle">
          From the first whistle to the final shot — follow the players, the matches,
          and the moments that define MMMUT Hockey, all in one place.
        </p>
        <div className="hero__actions">
          <Link className="btn btn-primary" to={ROUTES.MATCHES}>
            View Schedule
          </Link>
          <Link className="btn btn-outline" to={ROUTES.PLAYERS}>
            Meet the Team
          </Link>
        </div>
      </div>
    </section>
  );
}
