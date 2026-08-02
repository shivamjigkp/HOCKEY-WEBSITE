import { useEffect, useState } from 'react';
import Loader from '@/components/Loader/Loader';
import ImageUploadField from '@/components/ImageUploadField/ImageUploadField';
import { getSponsors, createSponsor, updateSponsor, deleteSponsor } from '@/services/sponsors';
import '../adminManage.css';

const EMPTY_FORM = { name: '', logo: '', website: '', sortOrder: '' };

export default function SponsorsManage() {
  const [sponsors, setSponsors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  function load() {
    setIsLoading(true);
    return getSponsors()
      .then(setSponsors)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function startEdit(sponsor) {
    setEditingId(sponsor.id);
    setForm({
      name: sponsor.name,
      logo: sponsor.logo ?? '',
      website: sponsor.website ?? '',
      sortOrder: sponsor.sortOrder != null ? String(sponsor.sortOrder) : '',
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        sortOrder: form.sortOrder ? Number(form.sortOrder) : 0,
      };
      if (editingId) {
        const updated = await updateSponsor(editingId, payload);
        setSponsors((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
      } else {
        const created = await createSponsor(payload);
        setSponsors((prev) => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this sponsor? This cannot be undone.')) return;
    try {
      await deleteSponsor(id);
      setSponsors((prev) => prev.filter((s) => s.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="admin-manage">
      <p className="eyebrow">Admin</p>
      <h1 className="admin-manage__title">Sponsors</h1>
      <p className="admin-manage__note">
        Sponsors appear as logos in the site footer, lowest sort order first. The strip stays
        hidden on the public site until at least one sponsor exists here.
      </p>

      {error && <p className="admin-manage__error">{error}</p>}

      <form className="admin-manage__form" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Edit Sponsor' : 'New Sponsor'}</h2>

        <label className="admin-manage__field">
          <span>Name</span>
          <input type="text" value={form.name} onChange={handleChange('name')} required />
        </label>

        <ImageUploadField
          label="Logo"
          value={form.logo}
          onChange={(url) => setForm((prev) => ({ ...prev, logo: url }))}
          folder="sponsors"
        />

        <label className="admin-manage__field">
          <span>Website</span>
          <input
            type="url"
            placeholder="https://"
            value={form.website}
            onChange={handleChange('website')}
          />
        </label>

        <label className="admin-manage__field">
          <span>Sort Order</span>
          <input type="number" value={form.sortOrder} onChange={handleChange('sortOrder')} />
        </label>

        <div className="admin-manage__form-actions">
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Sponsor'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="admin-manage__list-heading">Current Sponsors</h2>

      {isLoading ? (
        <Loader label="Loading sponsors" />
      ) : sponsors.length === 0 ? (
        <p className="admin-manage__empty">No sponsors yet.</p>
      ) : (
        <div className="admin-manage__list">
          {sponsors.map((sponsor) => (
            <div key={sponsor.id} className="admin-manage__row">
              <div>
                <p className="admin-manage__row-title">{sponsor.name}</p>
                <p className="admin-manage__row-meta">{sponsor.website || 'No website set'}</p>
              </div>
              <div className="admin-manage__row-actions">
                <button type="button" className="btn btn-outline" onClick={() => startEdit(sponsor)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => handleDelete(sponsor.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
