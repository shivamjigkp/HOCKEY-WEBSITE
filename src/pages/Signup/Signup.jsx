import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SectionDivider from '@/components/SectionDivider/SectionDivider';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import '@/pages/Login/Login.css';

export default function Signup() {
  const { signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  if (isAuthenticated) {
    navigate(ROUTES.HOME, { replace: true });
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const { needsEmailConfirmation } = await signUp(email, password, fullName);
      if (needsEmailConfirmation) {
        setNeedsConfirmation(true);
      } else {
        navigate(ROUTES.HOME, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Could not create your account.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (needsConfirmation) {
    return (
      <div className="login-page">
        <div className="container login-page__container">
          <p className="eyebrow">Account</p>
          <h1 className="login-page__title">Check Your Email</h1>
          <SectionDivider />
          <p className="signup-form__confirm-note">
            We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click it to activate
            your account, then come back and sign in.
          </p>
          <Link to={ROUTES.LOGIN} className="btn btn-outline">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="container login-page__container">
        <p className="eyebrow">Account</p>
        <h1 className="login-page__title">Sign Up</h1>
        <SectionDivider />

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-form__field">
            <span>Full Name</span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
            />
          </label>

          <label className="login-form__field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label className="login-form__field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>

          {error && <p className="login-form__error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        <p className="signup-form__switch">
          Already have an account? <Link to={ROUTES.LOGIN}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
