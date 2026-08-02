import { useEffect, useState } from 'react';
import Loader from '@/components/Loader/Loader';
import { useAuth } from '@/hooks/useAuth';
import { getAllUsers, setUserRole } from '@/services/users';
import '../adminManage.css';
import './UsersManage.css';

const ROLE_OPTIONS = ['viewer', 'admin', 'superadmin'];

// Display-only relabeling — the stored value is still 'superadmin' (see
// schema_phase22.sql: the column CHECK constraint, is_superadmin(), and
// every RLS policy that calls it all use this exact string). Renaming the
// stored value itself would mean updating the constraint, the function,
// and re-running a migration against every existing row — this achieves
// the same "call it Owner" ask without that risk.
const ROLE_LABELS = { viewer: 'Viewer', admin: 'Admin', superadmin: 'Owner' };

export default function UsersManage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  function load() {
    setIsLoading(true);
    return getAllUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRoleChange(targetUser, newRole) {
    if (newRole === targetUser.role) return;
    const message =
      newRole === 'viewer'
        ? `Revoke admin access from ${targetUser.email}?`
        : `Make ${targetUser.email} ${ROLE_LABELS[newRole]}?`;
    if (!window.confirm(message)) return;
    setSavingId(targetUser.id);
    setError('');
    try {
      const updated = await setUserRole(targetUser.id, newRole);
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? { ...u, role: updated.role } : u)));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="admin-manage">
      <p className="eyebrow">Admin</p>
      <h1 className="admin-manage__title">Users</h1>
      <p className="admin-manage__note">
        Only an Owner can see this page. Granting or revoking admin access here is the only way
        roles change — a regular admin cannot promote or demote anyone.
      </p>

      {error && <p className="admin-manage__error">{error}</p>}

      {isLoading ? (
        <Loader label="Loading users" />
      ) : users.length === 0 ? (
        <p className="admin-manage__empty">No accounts yet.</p>
      ) : (
        <div className="admin-manage__list">
          {users.map((u) => (
            <div key={u.id} className="admin-manage__row users-manage__row">
              <div>
                <p className="admin-manage__row-title">{u.email}</p>
                <p className="admin-manage__row-meta">
                  {u.full_name || 'No name set'}
                  {u.id === user?.id && ' · This is you'}
                </p>
              </div>

              <div className="users-manage__role-control">
                <span
                  className={
                    u.role === 'superadmin'
                      ? 'admin-manage__tag admin-manage__tag--live'
                      : u.role === 'admin'
                        ? 'admin-manage__tag'
                        : 'admin-manage__tag admin-manage__tag--completed'
                  }
                >
                  {ROLE_LABELS[u.role] || u.role}
                </span>

                <select
                  value={u.role}
                  disabled={u.id === user?.id || savingId === u.id}
                  onChange={(e) => handleRoleChange(u, e.target.value)}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
