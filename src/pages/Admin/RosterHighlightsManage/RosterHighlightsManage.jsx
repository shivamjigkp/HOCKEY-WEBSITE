import { useEffect, useRef, useState } from 'react';
import Loader from '@/components/Loader/Loader';
import { compressImage } from '@/utils/imageCompression';
import {
  deleteRosterHighlight,
  getAllRosterHighlights,
  reorderRosterHighlights,
  updateRosterHighlight,
  uploadRosterHighlight,
} from '@/services/rosterHighlights';
import '../adminManage.css';
import './RosterHighlightsManage.css';

const EMPTY_FORM = { name: '', branch: '', role: '' };

export default function RosterHighlightsManage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  function load() {
    setIsLoading(true);
    return getAllRosterHighlights()
      .then(setItems)
      .catch((err) => setError(err.message || 'Could not load the roster.'))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function handleField(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!file || !form.name.trim() || !form.role.trim()) {
      setError('Photo, Name, and Role/Title are required.');
      return;
    }

    setIsUploading(true);
    setError('');
    try {
      const compressed = await compressImage(file);
      const created = await uploadRosterHighlight({
        file: compressed,
        name: form.name.trim(),
        branch: form.branch.trim(),
        role: form.role.trim(),
        sortOrder: items.length,
      });
      setItems((prev) => [...prev, created]);
      setForm(EMPTY_FORM);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err.message || 'Could not add this person.');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleFieldSave(item, field, value) {
    if (value === (item[field] || '')) return;
    try {
      const updated = await updateRosterHighlight(item.id, { [field]: value });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch (err) {
      setError(err.message || 'Could not save changes.');
    }
  }

  async function handleToggleActive(item) {
    setBusyId(item.id);
    try {
      const updated = await updateRosterHighlight(item.id, { is_active: !item.is_active });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch (err) {
      setError(err.message || 'Could not update.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(item) {
    setBusyId(item.id);
    try {
      await deleteRosterHighlight(item);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      setError(err.message || 'Could not remove this entry.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleMove(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const reordered = [...items];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setItems(reordered);

    try {
      await reorderRosterHighlights(reordered.map((i) => i.id));
    } catch (err) {
      setError(err.message || 'Could not save new order.');
      load();
    }
  }

  return (
    <div className="admin-manage">
      <p className="eyebrow">Admin</p>
      <h1 className="admin-manage__title">Roster Highlights</h1>
      <p className="admin-manage__note">
        Controls the &quot;THE ROSTER&quot; section on the homepage — a hand-picked list (Captain,
        Vice-Captain, Technical Head, etc.), separate from the full Players roster. Only entries
        marked Active appear on the site.
      </p>

      {error && <p className="admin-manage__error">{error}</p>}

      <form className="admin-manage__form roster-highlights-manage__form" onSubmit={handleAdd}>
        <h2>Add to Roster</h2>

        <label className="admin-manage__field">
          <span>Photo</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
          />
        </label>

        <label className="admin-manage__field">
          <span>Name</span>
          <input type="text" value={form.name} onChange={handleField('name')} required />
        </label>

        <label className="admin-manage__field">
          <span>Branch</span>
          <input
            type="text"
            value={form.branch}
            onChange={handleField('branch')}
            placeholder="e.g. Computer Science"
          />
        </label>

        <label className="admin-manage__field">
          <span>Role / Title</span>
          <input
            type="text"
            value={form.role}
            onChange={handleField('role')}
            placeholder="e.g. Captain, Vice-Captain, Technical Head"
            required
          />
        </label>

        <button type="submit" className="btn btn-primary" disabled={isUploading}>
          {isUploading ? 'Adding…' : 'Add'}
        </button>
      </form>

      <h2 className="admin-manage__list-heading" style={{ marginTop: 'var(--space-6)' }}>
        Roster
      </h2>

      {isLoading ? (
        <Loader label="Loading roster" />
      ) : items.length === 0 ? (
        <p className="admin-manage__empty">No one added yet — use the form above.</p>
      ) : (
        <div className="roster-highlights-manage__list">
          {items.map((item, index) => (
            <div key={item.id} className="roster-highlights-manage__row">
              <img
                className="roster-highlights-manage__thumb"
                src={item.url}
                alt={item.name}
                loading="lazy"
              />

              <div className="roster-highlights-manage__meta">
                <input
                  type="text"
                  defaultValue={item.name}
                  aria-label="Name"
                  onBlur={(e) => handleFieldSave(item, 'name', e.target.value)}
                />
                <input
                  type="text"
                  defaultValue={item.branch || ''}
                  aria-label="Branch"
                  placeholder="Branch"
                  onBlur={(e) => handleFieldSave(item, 'branch', e.target.value)}
                />
                <input
                  type="text"
                  defaultValue={item.role}
                  aria-label="Role / Title"
                  onBlur={(e) => handleFieldSave(item, 'role', e.target.value)}
                />
                <label className="roster-highlights-manage__active-toggle">
                  <input
                    type="checkbox"
                    checked={item.is_active}
                    disabled={busyId === item.id}
                    onChange={() => handleToggleActive(item)}
                  />
                  Active
                </label>
              </div>

              <div className="roster-highlights-manage__row-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => handleDelete(item)}
                  disabled={busyId === item.id}
                >
                  {busyId === item.id ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
