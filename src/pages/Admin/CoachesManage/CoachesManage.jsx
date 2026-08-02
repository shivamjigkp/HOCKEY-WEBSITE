import { useEffect, useState } from 'react';
import Loader from '@/components/Loader/Loader';
import ImageUploadField from '@/components/ImageUploadField/ImageUploadField';
import { getCoaches, createCoach, updateCoach, deleteCoach } from '@/services/coaches';
import '../adminManage.css';

const EMPTY_FORM = {
  name: '',
  role: '',
  experienceYears: '',
  photoUrl: '',
  bio: '',
  achievements: '',
};

export default function CoachesManage() {
  const [coaches, setCoaches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  function load() {
    setIsLoading(true);
    return getCoaches()
      .then(setCoaches)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function startEdit(coach) {
    setEditingId(coach.id);
    setForm({
      name: coach.name,
      role: coach.role,
      experienceYears: coach.experienceYears != null ? String(coach.experienceYears) : '',
      photoUrl: coach.photoUrl ?? '',
      bio: coach.bio ?? '',
      achievements: (coach.achievements ?? []).join('\n'),
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
        experienceYears: form.experienceYears ? Number(form.experienceYears) : null,
        achievements: form.achievements
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
      };
      if (editingId) {
        const updated = await updateCoach(editingId, payload);
        setCoaches((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
      } else {
        const created = await createCoach(payload);
        setCoaches((prev) => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this coach? This cannot be undone.')) return;
    try {
      await deleteCoach(id);
      setCoaches((prev) => prev.filter((c) => c.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="admin-manage">
      <p className="eyebrow">Admin</p>
      <h1 className="admin-manage__title">Coaches</h1>

      {error && <p className="admin-manage__error">{error}</p>}

      <form className="admin-manage__form" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Edit Coach' : 'New Coach'}</h2>

        <label className="admin-manage__field">
          <span>Name</span>
          <input type="text" value={form.name} onChange={handleChange('name')} required />
        </label>

        <label className="admin-manage__field">
          <span>Role</span>
          <input type="text" value={form.role} onChange={handleChange('role')} required />
        </label>

        <label className="admin-manage__field">
          <span>Years of Experience</span>
          <input
            type="number"
            value={form.experienceYears}
            onChange={handleChange('experienceYears')}
          />
        </label>

        <ImageUploadField
          value={form.photoUrl}
          onChange={(url) => setForm((prev) => ({ ...prev, photoUrl: url }))}
          folder="coaches"
        />

        <label className="admin-manage__field">
          <span>Bio</span>
          <textarea rows={4} value={form.bio} onChange={handleChange('bio')} />
        </label>

        <label className="admin-manage__field">
          <span>Achievements (one per line)</span>
          <textarea rows={4} value={form.achievements} onChange={handleChange('achievements')} />
        </label>

        <div className="admin-manage__form-actions">
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Coach'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="admin-manage__list-heading">Coaching Staff</h2>

      {isLoading ? (
        <Loader label="Loading coaches" />
      ) : coaches.length === 0 ? (
        <p className="admin-manage__empty">No coaches yet.</p>
      ) : (
        <div className="admin-manage__list">
          {coaches.map((coach) => (
            <div key={coach.id} className="admin-manage__row">
              <div>
                <p className="admin-manage__row-title">{coach.name}</p>
                <p className="admin-manage__row-meta">{coach.role}</p>
              </div>
              <div className="admin-manage__row-actions">
                <button type="button" className="btn btn-outline" onClick={() => startEdit(coach)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => handleDelete(coach.id)}
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
