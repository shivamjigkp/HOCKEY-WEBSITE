import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import './HeroSection.css';

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="container hero__inner">
        <p className="eyebrow">MMMUT Hockey Club</p>
        <h1 className="hero__title">
          Building Champions.
          <br />
          Inspiring Excellence.
        </h1>
        <p className="hero__tagline">Play. Compete. Achieve.</p>
        <span className="hero__rule" aria-hidden="true" />
        <p className="hero__subtitle">
          Discover your potential, sharpen your skills, and embrace the spirit of teamwork. At
          MMMUT Hockey Club, every practice, every match, and every challenge brings you one step
          closer to excellence. Join us and be part of a legacy of passion, dedication, and
          success.
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
