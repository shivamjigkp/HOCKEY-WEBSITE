import { useEffect, useState } from 'react';
import Loader from '@/components/Loader/Loader';
import ImageUploadField from '@/components/ImageUploadField/ImageUploadField';
import { getPlayers, createPlayer, updatePlayer, deletePlayer } from '@/services/players';
import '../adminManage.css';

const EMPTY_FORM = {
  name: '',
  position: 'forward',
  jerseyNumber: '',
  year: '',
  hometown: '',
  heightCm: '',
  photoUrl: '',
  bio: '',
};

export default function PlayersManage() {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  function load() {
    setIsLoading(true);
    return getPlayers()
      .then(setPlayers)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function startEdit(player) {
    setEditingId(player.id);
    setForm({
      name: player.name,
      position: player.position,
      jerseyNumber: String(player.jerseyNumber ?? ''),
      year: player.year ?? '',
      hometown: player.hometown ?? '',
      heightCm: player.heightCm != null ? String(player.heightCm) : '',
      photoUrl: player.photoUrl ?? '',
      bio: player.bio ?? '',
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
        jerseyNumber: Number(form.jerseyNumber),
        heightCm: form.heightCm ? Number(form.heightCm) : null,
      };
      if (editingId) {
        const existing = players.find((p) => p.id === editingId);
        const updated = await updatePlayer(editingId, { ...payload, stats: existing?.stats });
        setPlayers((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
      } else {
        const created = await createPlayer(payload);
        setPlayers((prev) => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this player? This cannot be undone.')) return;
    try {
      await deletePlayer(id);
      setPlayers((prev) => prev.filter((p) => p.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="admin-manage">
      <p className="eyebrow">Admin</p>
      <h1 className="admin-manage__title">Players</h1>
      <p className="admin-manage__note">
        Stats (games played, goals, etc.) aren&apos;t edited here yet — this form covers profile
        fields only. Edit the `stats` column directly in Supabase Table Editor for now.
      </p>

      {error && <p className="admin-manage__error">{error}</p>}

      <form className="admin-manage__form" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Edit Player' : 'New Player'}</h2>

        <label className="admin-manage__field">
          <span>Name</span>
          <input type="text" value={form.name} onChange={handleChange('name')} required />
        </label>

        <label className="admin-manage__field">
          <span>Position</span>
          <select value={form.position} onChange={handleChange('position')}>
            <option value="forward">Forward</option>
            <option value="midfielder">Midfielder</option>
            <option value="defender">Defender</option>
            <option value="goalkeeper">Goalkeeper</option>
          </select>
        </label>

        <label className="admin-manage__field">
          <span>Jersey Number</span>
          <input
            type="number"
            value={form.jerseyNumber}
            onChange={handleChange('jerseyNumber')}
            required
          />
        </label>

        <label className="admin-manage__field">
          <span>Year</span>
          <input type="text" value={form.year} onChange={handleChange('year')} />
        </label>

        <label className="admin-manage__field">
          <span>Hometown</span>
          <input type="text" value={form.hometown} onChange={handleChange('hometown')} />
        </label>

        <label className="admin-manage__field">
          <span>Height (cm)</span>
          <input type="number" value={form.heightCm} onChange={handleChange('heightCm')} />
        </label>

        <ImageUploadField
          value={form.photoUrl}
          onChange={(url) => setForm((prev) => ({ ...prev, photoUrl: url }))}
          folder="players"
        />

        <label className="admin-manage__field">
          <span>Bio</span>
          <textarea rows={4} value={form.bio} onChange={handleChange('bio')} />
        </label>

        <div className="admin-manage__form-actions">
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Player'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="admin-manage__list-heading">Roster</h2>

      {isLoading ? (
        <Loader label="Loading roster" />
      ) : players.length === 0 ? (
        <p className="admin-manage__empty">No players yet.</p>
      ) : (
        <div className="admin-manage__list">
          {players.map((player) => (
            <div key={player.id} className="admin-manage__row">
              <div>
                <p className="admin-manage__row-title">
                  #{player.jerseyNumber} {player.name}
                </p>
                <p className="admin-manage__row-meta">
                  {player.position} · {player.year || 'Year TBC'}
                </p>
              </div>
              <div className="admin-manage__row-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => startEdit(player)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => handleDelete(player.id)}
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
