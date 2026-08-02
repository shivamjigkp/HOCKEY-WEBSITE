import { useEffect, useState } from 'react';
import Loader from '@/components/Loader/Loader';
import ImageUploadField from '@/components/ImageUploadField/ImageUploadField';
import { getOfficials, createOfficial, updateOfficial, deleteOfficial } from '@/services/officials';
import '../adminManage.css';

const EMPTY_FORM = { name: '', role: '', photoUrl: '' };

export default function OfficialsManage() {
  const [officials, setOfficials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  function load() {
    setIsLoading(true);
    return getOfficials()
      .then(setOfficials)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function startEdit(official) {
    setEditingId(official.id);
    setForm({
      name: official.name,
      role: official.role,
      photoUrl: official.photoUrl ?? '',
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
      if (editingId) {
        const updated = await updateOfficial(editingId, form);
        setOfficials((prev) => prev.map((o) => (o.id === editingId ? updated : o)));
      } else {
        const created = await createOfficial(form);
        setOfficials((prev) => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this official? This cannot be undone.')) return;
    try {
      await deleteOfficial(id);
      setOfficials((prev) => prev.filter((o) => o.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="admin-manage">
      <p className="eyebrow">Admin</p>
      <h1 className="admin-manage__title">Officials</h1>

      {error && <p className="admin-manage__error">{error}</p>}

      <form className="admin-manage__form" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Edit Official' : 'New Official'}</h2>

        <label className="admin-manage__field">
          <span>Name</span>
          <input type="text" value={form.name} onChange={handleChange('name')} required />
        </label>

        <label className="admin-manage__field">
          <span>Role</span>
          <input
            type="text"
            value={form.role}
            onChange={handleChange('role')}
            placeholder="e.g. Head Coach, Physiotherapist, Manager"
            required
          />
        </label>

        <ImageUploadField
          value={form.photoUrl}
          onChange={(url) => setForm((prev) => ({ ...prev, photoUrl: url }))}
          folder="officials"
        />

        <div className="admin-manage__form-actions">
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Official'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="admin-manage__list-heading">All Officials</h2>

      {isLoading ? (
        <Loader label="Loading officials" />
      ) : officials.length === 0 ? (
        <p className="admin-manage__empty">No officials yet.</p>
      ) : (
        <div className="admin-manage__list">
          {officials.map((official) => (
            <div key={official.id} className="admin-manage__row">
              <div>
                <p className="admin-manage__row-title">{official.name}</p>
                <p className="admin-manage__row-meta">{official.role}</p>
              </div>
              <div className="admin-manage__row-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => startEdit(official)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => handleDelete(official.id)}
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
