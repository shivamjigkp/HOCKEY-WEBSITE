import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '@/components/Loader/Loader';
import { ROUTES } from '@/constants/routes';
import { getSiteSettings, updateSiteSettings } from '@/services/settings';
import '../adminManage.css';

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

export default function SettingsManage() {
  return (
    <div className="admin-manage">
      <p className="eyebrow">Admin</p>
      <h1 className="admin-manage__title">Settings</h1>

      <SiteInfoForm />

      <div className="admin-manage__form">
        <h2>Admin Users</h2>
        <p className="admin-manage__note">
          Managing who has admin access moved to its own page — only an Owner can grant or
          revoke it there.
        </p>
        <Link to={ROUTES.ADMIN_USERS} className="btn btn-outline">
          Go to Users
        </Link>
      </div>
    </div>
  );
}
