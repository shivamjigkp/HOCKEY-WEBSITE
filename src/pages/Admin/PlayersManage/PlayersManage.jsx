import { useEffect, useState } from 'react';
import Loader from '@/components/Loader/Loader';
import ImageUploadField from '@/components/ImageUploadField/ImageUploadField';
import { getPlayers, createPlayer, updatePlayer, deletePlayer } from '@/services/players';
import { PLAYER_POSITION_GROUPS, PLAYER_POSITION_LABELS } from '@/constants/playerPositions';
import '../adminManage.css';

const EMPTY_FORM = {
  name: '',
  position: 'centre_forward',
  branch: '',
  jerseyNumber: '',
  year: '',
  hometown: '',
  heightCm: '',
  photoUrl: '',
  bio: '',
  linkedinUrl: '',
  githubUrl: '',
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
      branch: player.branch ?? '',
      jerseyNumber: String(player.jerseyNumber ?? ''),
      year: player.year ?? '',
      hometown: player.hometown ?? '',
      heightCm: player.heightCm != null ? String(player.heightCm) : '',
      photoUrl: player.photoUrl ?? '',
      bio: player.bio ?? '',
      linkedinUrl: player.linkedinUrl ?? '',
      githubUrl: player.githubUrl ?? '',
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
            {PLAYER_POSITION_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((value) => (
                  <option key={value} value={value}>
                    {PLAYER_POSITION_LABELS[value]}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <label className="admin-manage__field">
          <span>Branch</span>
          <input
            type="text"
            placeholder="e.g. Computer Science"
            value={form.branch}
            onChange={handleChange('branch')}
          />
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

        <label className="admin-manage__field">
          <span>LinkedIn URL</span>
          <input
            type="url"
            placeholder="https://linkedin.com/in/..."
            value={form.linkedinUrl}
            onChange={handleChange('linkedinUrl')}
          />
        </label>

        <label className="admin-manage__field">
          <span>GitHub URL</span>
          <input
            type="url"
            placeholder="https://github.com/..."
            value={form.githubUrl}
            onChange={handleChange('githubUrl')}
          />
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
                  {PLAYER_POSITION_LABELS[player.position] ?? player.position}
                  {player.branch && ` · ${player.branch}`} · {player.year || 'Year TBC'}
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
