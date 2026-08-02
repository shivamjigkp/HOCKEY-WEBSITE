import { useEffect, useState } from 'react';
import Loader from '@/components/Loader/Loader';
import { formatDate, formatTime } from '@/utils/formatDate';
import {
  getMatches,
  createMatch,
  updateMatch,
  deleteMatch,
  updateLiveScore,
} from '@/services/matches';
import '../adminManage.css';

const EMPTY_FORM = {
  competition: '',
  homeTeam: 'MMMUT Hockey',
  awayTeam: '',
  venue: '',
  date: '',
  status: 'upcoming',
};

const EMPTY_LIVE_FORM = { status: 'live', homeScore: '', awayScore: '', period: '', matchClock: '' };

function LiveControl({ matches, onUpdated, setError }) {
  const [selectedId, setSelectedId] = useState('');
  const [liveForm, setLiveForm] = useState(EMPTY_LIVE_FORM);
  const [isSaving, setIsSaving] = useState(false);

  function selectMatch(id) {
    setSelectedId(id);
    const match = matches.find((m) => m.id === id);
    if (match) {
      setLiveForm({
        status: match.status,
        homeScore: match.homeScore != null ? String(match.homeScore) : '',
        awayScore: match.awayScore != null ? String(match.awayScore) : '',
        period: match.period ?? '',
        matchClock: match.matchClock ?? '',
      });
    }
  }

  function handleChange(field) {
    return (e) => setLiveForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleUpdate() {
    if (!selectedId) return;
    setIsSaving(true);
    setError('');
    try {
      const updated = await updateLiveScore(selectedId, {
        status: liveForm.status,
        homeScore: liveForm.homeScore === '' ? null : Number(liveForm.homeScore),
        awayScore: liveForm.awayScore === '' ? null : Number(liveForm.awayScore),
        period: liveForm.period || null,
        matchClock: liveForm.matchClock || null,
      });
      onUpdated(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="admin-manage__live-panel">
      <h2>Matchday Live Control</h2>
      <label className="admin-manage__field" style={{ marginTop: 'var(--space-4)' }}>
        <span>Select Match</span>
        <select value={selectedId} onChange={(e) => selectMatch(e.target.value)}>
          <option value="">— choose a match —</option>
          {matches.map((m) => (
            <option key={m.id} value={m.id}>
              {m.homeTeam} vs {m.awayTeam} · {formatDate(m.date)} ({m.status})
            </option>
          ))}
        </select>
      </label>

      {selectedId && (
        <>
          <div className="admin-manage__live-grid">
            <label className="admin-manage__field">
              <span>Status</span>
              <select value={liveForm.status} onChange={handleChange('status')}>
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <label className="admin-manage__field">
              <span>Home Score</span>
              <input type="number" value={liveForm.homeScore} onChange={handleChange('homeScore')} />
            </label>
            <label className="admin-manage__field">
              <span>Away Score</span>
              <input type="number" value={liveForm.awayScore} onChange={handleChange('awayScore')} />
            </label>
            <label className="admin-manage__field">
              <span>Period</span>
              <input
                type="text"
                placeholder="e.g. 2nd Quarter"
                value={liveForm.period}
                onChange={handleChange('period')}
              />
            </label>
            <label className="admin-manage__field">
              <span>Match Clock</span>
              <input
                type="text"
                placeholder="e.g. 08:42"
                value={liveForm.matchClock}
                onChange={handleChange('matchClock')}
              />
            </label>
          </div>
          <div className="admin-manage__form-actions" style={{ marginTop: 'var(--space-4)' }}>
            <button type="button" className="btn btn-primary" disabled={isSaving} onClick={handleUpdate}>
              {isSaving ? 'Updating…' : 'Update Live Match'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function MatchesManage() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  function load() {
    setIsLoading(true);
    return getMatches()
      .then(setMatches)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function startEdit(match) {
    setEditingId(match.id);
    setForm({
      competition: match.competition,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      venue: match.venue ?? '',
      date: match.date ? match.date.slice(0, 16) : '',
      status: match.status,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function handleMatchUpdated(updated) {
    setMatches((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      const payload = { ...form, date: new Date(form.date).toISOString() };
      if (editingId) {
        const updated = await updateMatch(editingId, payload);
        handleMatchUpdated(updated);
      } else {
        const created = await createMatch(payload);
        setMatches((prev) => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this match? This cannot be undone.')) return;
    try {
      await deleteMatch(id);
      setMatches((prev) => prev.filter((m) => m.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="admin-manage">
      <p className="eyebrow">Admin</p>
      <h1 className="admin-manage__title">Matches</h1>

      {error && <p className="admin-manage__error">{error}</p>}

      {!isLoading && matches.length > 0 && (
        <LiveControl matches={matches} onUpdated={handleMatchUpdated} setError={setError} />
      )}

      <form className="admin-manage__form" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Edit Match' : 'New Match'}</h2>

        <label className="admin-manage__field">
          <span>Competition</span>
          <input
            type="text"
            value={form.competition}
            onChange={handleChange('competition')}
            required
          />
        </label>

        <label className="admin-manage__field">
          <span>Home Team</span>
          <input type="text" value={form.homeTeam} onChange={handleChange('homeTeam')} required />
        </label>

        <label className="admin-manage__field">
          <span>Away Team</span>
          <input type="text" value={form.awayTeam} onChange={handleChange('awayTeam')} required />
        </label>

        <label className="admin-manage__field">
          <span>Venue</span>
          <input type="text" value={form.venue} onChange={handleChange('venue')} />
        </label>

        <label className="admin-manage__field">
          <span>Date &amp; Time</span>
          <input type="datetime-local" value={form.date} onChange={handleChange('date')} required />
        </label>

        <label className="admin-manage__field">
          <span>Status</span>
          <select value={form.status} onChange={handleChange('status')}>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
          </select>
        </label>

        <div className="admin-manage__form-actions">
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Match'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="admin-manage__list-heading">All Matches</h2>

      {isLoading ? (
        <Loader label="Loading matches" />
      ) : matches.length === 0 ? (
        <p className="admin-manage__empty">No matches yet.</p>
      ) : (
        <div className="admin-manage__list">
          {matches.map((match) => (
            <div key={match.id} className="admin-manage__row">
              <div>
                <span
                  className={
                    match.status === 'live'
                      ? 'admin-manage__tag admin-manage__tag--live'
                      : match.status === 'completed'
                        ? 'admin-manage__tag admin-manage__tag--completed'
                        : 'admin-manage__tag'
                  }
                >
                  {match.status}
                </span>
                <p className="admin-manage__row-title">
                  {match.homeTeam} vs {match.awayTeam}
                </p>
                <p className="admin-manage__row-meta">
                  {match.competition} · {formatDate(match.date)} · {formatTime(match.date)}
                </p>
              </div>
              <div className="admin-manage__row-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => startEdit(match)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => handleDelete(match.id)}
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
