import { NavLink } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found container">
      <p className="eyebrow">Icing called</p>
      <h1>404</h1>
      <p className="not-found__message">
        This page went wide of the net. It doesn&apos;t exist, or it&apos;s been moved.
      </p>
      <NavLink to={ROUTES.HOME} className="btn btn-primary">
        Back to Home
      </NavLink>
    </div>
  );
}
