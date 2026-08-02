import { useEffect, useState } from 'react';
import Loader from '@/components/Loader/Loader';
import ImageUploadField from '@/components/ImageUploadField/ImageUploadField';
import { getAlumni, createAlumnus, updateAlumnus, deleteAlumnus } from '@/services/alumni';
import '../adminManage.css';

const EMPTY_FORM = { name: '', role: '', photoUrl: '' };

export default function AlumniManage() {
  const [alumni, setAlumni] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  function load() {
    setIsLoading(true);
    return getAlumni()
      .then(setAlumni)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function startEdit(alumnus) {
    setEditingId(alumnus.id);
    setForm({
      name: alumnus.name,
      role: alumnus.role ?? '',
      photoUrl: alumnus.photoUrl ?? '',
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
        const updated = await updateAlumnus(editingId, form);
        setAlumni((prev) => prev.map((a) => (a.id === editingId ? updated : a)));
      } else {
        const created = await createAlumnus(form);
        setAlumni((prev) => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this alumnus? This cannot be undone.')) return;
    try {
      await deleteAlumnus(id);
      setAlumni((prev) => prev.filter((a) => a.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="admin-manage">
      <p className="eyebrow">Admin</p>
      <h1 className="admin-manage__title">Alumni</h1>

      {error && <p className="admin-manage__error">{error}</p>}

      <form className="admin-manage__form" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Edit Alumnus' : 'New Alumnus'}</h2>

        <label className="admin-manage__field">
          <span>Name</span>
          <input type="text" value={form.name} onChange={handleChange('name')} required />
        </label>

        <label className="admin-manage__field">
          <span>Batch / Current Role (optional)</span>
          <input
            type="text"
            value={form.role}
            onChange={handleChange('role')}
            placeholder="e.g. B.Tech 2018 · Software Engineer, TCS"
          />
        </label>

        <ImageUploadField
          value={form.photoUrl}
          onChange={(url) => setForm((prev) => ({ ...prev, photoUrl: url }))}
          folder="alumni"
        />

        <div className="admin-manage__form-actions">
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Alumnus'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="admin-manage__list-heading">All Alumni</h2>

      {isLoading ? (
        <Loader label="Loading alumni" />
      ) : alumni.length === 0 ? (
        <p className="admin-manage__empty">No alumni yet.</p>
      ) : (
        <div className="admin-manage__list">
          {alumni.map((alumnus) => (
            <div key={alumnus.id} className="admin-manage__row">
              <div>
                <p className="admin-manage__row-title">{alumnus.name}</p>
                <p className="admin-manage__row-meta">{alumnus.role || '—'}</p>
              </div>
              <div className="admin-manage__row-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => startEdit(alumnus)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => handleDelete(alumnus.id)}
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
