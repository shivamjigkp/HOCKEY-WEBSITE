import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import Loader from '@/components/Loader/Loader';

/**
 * Wrap any route element needing a signed-in user. Pass `requireAdmin` to
 * additionally require role 'admin' or 'superadmin' (see profiles table
 * in schema_phase7.sql / schema_phase22.sql), or `requireSuperAdmin` for
 * the stricter 'superadmin'-only check (used for the Users page — only a
 * superadmin can grant or revoke admin access). A signed-in user who
 * fails either check sees an inline "Access Denied" message rather than
 * being bounced back to Login, since they *are* authenticated, just not
 * authorized for this route.
 */
export default function ProtectedRoute({ children, requireAdmin = false, requireSuperAdmin = false }) {
  const { isAuthenticated, isAdmin, isSuperAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader label="Checking session" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  const isDenied = requireSuperAdmin ? !isSuperAdmin : requireAdmin && !isAdmin;

  if (isDenied) {
    return (
      <div className="container" style={{ paddingBlock: 'var(--space-8)', textAlign: 'center' }}>
        <p className="eyebrow">Access Denied</p>
        <h1 style={{ marginTop: 'var(--space-4)' }}>
          {requireSuperAdmin ? 'Owner access required' : 'Admin access required'}
        </h1>
        <p style={{ marginTop: 'var(--space-3)', color: 'var(--text-secondary)' }}>
          Your account doesn&apos;t have permission for this page.
        </p>
      </div>
    );
  }

  return children;
}
