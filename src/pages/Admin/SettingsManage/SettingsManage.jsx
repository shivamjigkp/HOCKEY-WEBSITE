import { useEffect, useState } from 'react';
import Loader from '@/components/Loader/Loader';
import { useAuth } from '@/hooks/useAuth';
import { getSiteSettings, updateSiteSettings } from '@/services/settings';
import { listProfiles, updateUserRole } from '@/services/adminUsers';
import '../adminManage.css';

const ROLES = ['viewer', 'editor', 'admin'];

function SiteInfoForm() {
  const [form, setForm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    getSiteSettings().then(setForm);
  }, []);

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleNumberChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: Number(e.target.value) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);
    setStatus('');
    try {
      await updateSiteSettings(form);
      setStatus('Saved.');
    } catch (err) {
      setStatus(err.message || 'Could not save settings.');
    } finally {
      setIsSaving(false);
    }
  }

  if (!form) return <Loader label="Loading site settings" />;

  return (
    <form className="admin-manage__form" onSubmit={handleSubmit}>
      <h2>Site Info</h2>
      <p className="admin-manage__note">
        Shown in the Footer and on the Contact page across the whole site.
      </p>

      <label className="admin-manage__field">
        <span>Contact Email</span>
        <input
          type="email"
          value={form.contactEmail}
          onChange={handleChange('contactEmail')}
          required
        />
      </label>

      <label className="admin-manage__field">
        <span>Instagram URL</span>
        <input type="url" value={form.instagram} onChange={handleChange('instagram')} />
      </label>

      <label className="admin-manage__field">
        <span>Facebook URL</span>
        <input type="url" value={form.facebook} onChange={handleChange('facebook')} />
      </label>

      <label className="admin-manage__field">
        <span>YouTube URL</span>
        <input type="url" value={form.youtube} onChange={handleChange('youtube')} />
      </label>

      <h2>Homepage Stats</h2>
      <p className="admin-manage__note">
        Shown in the stats strip on the homepage (Est., National Titles, Active Players, Alumni
        Gone Pro).
      </p>

      <label className="admin-manage__field">
        <span>Founded Year</span>
        <input
          type="number"
          value={form.foundedYear}
          onChange={handleNumberChange('foundedYear')}
          required
        />
      </label>

      <label className="admin-manage__field">
        <span>National Titles</span>
        <input
          type="number"
          min="0"
          value={form.nationalTitles}
          onChange={handleNumberChange('nationalTitles')}
          required
        />
      </label>

      <label className="admin-manage__field">
        <span>Active Players</span>
        <input
          type="number"
          min="0"
          value={form.activePlayers}
          onChange={handleNumberChange('activePlayers')}
          required
        />
      </label>

      <label className="admin-manage__field">
        <span>Alumni Gone Pro</span>
        <input
          type="number"
          min="0"
          value={form.alumniPro}
          onChange={handleNumberChange('alumniPro')}
          required
        />
      </label>

      <h2>Appearance</h2>
      <p className="admin-manage__note">
        Sets the page background color in light mode only — dark mode is unaffected. Changes
        apply site-wide as soon as they&apos;re saved.
      </p>

      <label className="admin-manage__field">
        <span>Light Mode Background Color</span>
        <div className="admin-manage__color-field">
          <input
            type="color"
            value={form.themeBgLight || '#f5f6f6'}
            onChange={handleChange('themeBgLight')}
            aria-label="Light mode background color"
          />
          <span className="admin-manage__color-value">{form.themeBgLight || 'Default'}</span>
          {form.themeBgLight && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setForm((prev) => ({ ...prev, themeBgLight: '' }))}
            >
              Reset to Default
            </button>
          )}
        </div>
      </label>

      {status && <p className="admin-manage__note">{status}</p>}

      <div className="admin-manage__form-actions">
        <button type="submit" className="btn btn-primary" disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save Site Info'}
        </button>
      </div>
    </form>
  );
}

function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  function load() {
    setIsLoading(true);
    return listProfiles()
      .then(setProfiles)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRoleChange(profile, role) {
    setSavingId(profile.id);
    setError('');
    try {
      const updated = await updateUserRole(profile.id, role);
      setProfiles((prev) => prev.map((p) => (p.id === profile.id ? updated : p)));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <>
      <h2 className="admin-manage__list-heading">Admin Users</h2>
      <p className="admin-manage__note">
        Controls who can sign in to /admin. New sign-ups default to &quot;viewer&quot; (no admin
        access) until raised here.
      </p>

      {error && <p className="admin-manage__error">{error}</p>}

      {isLoading ? (
        <Loader label="Loading users" />
      ) : profiles.length === 0 ? (
        <p className="admin-manage__empty">No accounts yet.</p>
      ) : (
        <div className="admin-manage__list">
          {profiles.map((profile) => {
            const isSelf = profile.id === currentUser?.id;
            return (
              <div key={profile.id} className="admin-manage__row">
                <div>
                  <p className="admin-manage__row-title">
                    {profile.email || profile.full_name || profile.id}
                  </p>
                  <p className="admin-manage__row-meta">
                    {profile.role}
                    {isSelf ? ' · this is you' : ''}
                  </p>
                </div>
                <div className="admin-manage__row-actions">
                  <label className="admin-manage__field">
                    <select
                      value={profile.role}
                      disabled={isSelf || savingId === profile.id}
                      onChange={(e) => handleRoleChange(profile, e.target.value)}
                      aria-label={`Role for ${profile.email || profile.id}`}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default function SettingsManage() {
  return (
    <div className="admin-manage">
      <p className="eyebrow">Admin</p>
      <h1 className="admin-manage__title">Settings</h1>

      <SiteInfoForm />
      <AdminUsers />
    </div>
  );
}
