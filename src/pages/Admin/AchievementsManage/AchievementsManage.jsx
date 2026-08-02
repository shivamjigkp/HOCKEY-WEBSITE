import { useEffect, useState } from 'react';
import Loader from '@/components/Loader/Loader';
import {
  getAchievements,
  createTournament,
  updateTournament,
  deleteTournament,
  createRecord,
  updateRecord,
  deleteRecord,
  createEntry,
  updateEntry,
  deleteEntry,
} from '@/services/achievements';
import '../adminManage.css';
import './AchievementsManage.css';

const EMPTY_TOURNAMENT_FORM = { kind: 'internal', name: '', description: '' };
const EMPTY_RECORD_FORM = { year: '', winner: '', result: '', note: '' };
const EMPTY_ENTRY_FORM = { category: 'university', title: '', year: '' };

const CATEGORY_LABELS = {
  university: 'University Achievements',
  team: 'Team Achievements',
  player: 'Player Achievements',
  coach: 'Coach Achievements',
};

export default function AchievementsManage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [tournamentForm, setTournamentForm] = useState(EMPTY_TOURNAMENT_FORM);
  const [editingTournamentId, setEditingTournamentId] = useState(null);

  const [expandedTournamentId, setExpandedTournamentId] = useState(null);
  const [recordForm, setRecordForm] = useState(EMPTY_RECORD_FORM);
  const [editingRecordId, setEditingRecordId] = useState(null);

  const [entryForm, setEntryForm] = useState(EMPTY_ENTRY_FORM);
  const [editingEntryId, setEditingEntryId] = useState(null);

  function load() {
    setIsLoading(true);
    return getAchievements()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const allTournaments = data
    ? [...data.internalTournaments, ...data.externalEvents]
    : [];

  // -- Tournaments -----------------------------------------------------

  async function handleTournamentSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingTournamentId) {
        await updateTournament(editingTournamentId, tournamentForm);
      } else {
        await createTournament(tournamentForm);
      }
      setTournamentForm(EMPTY_TOURNAMENT_FORM);
      setEditingTournamentId(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEditTournament(tournament) {
    setEditingTournamentId(tournament.id);
    setTournamentForm({
      kind: tournament.kind,
      name: tournament.name,
      description: tournament.description ?? '',
    });
  }

  async function handleDeleteTournament(id) {
    if (!window.confirm('Delete this tournament and all of its records? This cannot be undone.')) {
      return;
    }
    try {
      await deleteTournament(id);
      if (expandedTournamentId === id) setExpandedTournamentId(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  // -- Records -----------------------------------------------------------

  function toggleRecords(tournamentId) {
    setExpandedTournamentId((prev) => (prev === tournamentId ? null : tournamentId));
    setEditingRecordId(null);
    setRecordForm(EMPTY_RECORD_FORM);
  }

  async function handleRecordSubmit(e, tournament) {
    e.preventDefault();
    setError('');
    try {
      const payload =
        tournament.kind === 'internal'
          ? { year: recordForm.year, winner: recordForm.winner, note: recordForm.note }
          : { year: recordForm.year, result: recordForm.result, note: recordForm.note };

      if (editingRecordId) {
        await updateRecord(editingRecordId, payload);
      } else {
        await createRecord(tournament.id, payload);
      }
      setRecordForm(EMPTY_RECORD_FORM);
      setEditingRecordId(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEditRecord(record) {
    setEditingRecordId(record.id);
    setRecordForm({
      year: record.year ?? '',
      winner: record.winner ?? '',
      result: record.result ?? '',
      note: record.note ?? '',
    });
  }

  async function handleDeleteRecord(id) {
    if (!window.confirm('Delete this record?')) return;
    try {
      await deleteRecord(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  // -- Simple entries ------------------------------------------------------

  async function handleEntrySubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingEntryId) {
        await updateEntry(editingEntryId, entryForm);
      } else {
        await createEntry(entryForm);
      }
      setEntryForm(EMPTY_ENTRY_FORM);
      setEditingEntryId(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEditEntry(entry) {
    setEditingEntryId(entry.id);
    setEntryForm({ category: entry.category, title: entry.title, year: entry.year ?? '' });
  }

  async function handleDeleteEntry(id) {
    if (!window.confirm('Delete this achievement?')) return;
    try {
      await deleteEntry(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const allEntries = data
    ? [
        ...data.universityAchievements,
        ...data.teamAchievements,
        ...data.playerAchievements,
        ...data.coachAchievements,
      ]
    : [];

  if (isLoading) {
    return (
      <div className="admin-manage">
        <p className="eyebrow">Admin</p>
        <h1 className="admin-manage__title">Achievements</h1>
        <Loader label="Loading achievements" />
      </div>
    );
  }

  return (
    <div className="admin-manage">
      <p className="eyebrow">Admin</p>
      <h1 className="admin-manage__title">Achievements</h1>
      <p className="admin-manage__note">
        Internal Tournaments and Inter-College Events can each hold multiple
        year-by-year records. Leave a field blank if the result isn&apos;t
        confirmed yet — it will show as &quot;To be confirmed&quot; on the
        public page rather than a guess.
      </p>

      {error && <p className="admin-manage__error">{error}</p>}

      {/* ---------- Tournaments ---------- */}
      <form className="admin-manage__form" onSubmit={handleTournamentSubmit}>
        <h2>{editingTournamentId ? 'Edit Tournament / Event' : 'New Tournament / Event'}</h2>

        <label className="admin-manage__field">
          <span>Type</span>
          <select
            value={tournamentForm.kind}
            onChange={(e) => setTournamentForm((prev) => ({ ...prev, kind: e.target.value }))}
          >
            <option value="internal">Internal Tournament</option>
            <option value="external">Inter-College Event</option>
          </select>
        </label>

        <label className="admin-manage__field">
          <span>Name</span>
          <input
            type="text"
            value={tournamentForm.name}
            onChange={(e) => setTournamentForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
        </label>

        <label className="admin-manage__field">
          <span>Description</span>
          <textarea
            rows={2}
            value={tournamentForm.description}
            onChange={(e) =>
              setTournamentForm((prev) => ({ ...prev, description: e.target.value }))
            }
          />
        </label>

        <div className="admin-manage__form-actions">
          <button type="submit" className="btn btn-primary">
            {editingTournamentId ? 'Save Changes' : 'Add Tournament / Event'}
          </button>
          {editingTournamentId && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setEditingTournamentId(null);
                setTournamentForm(EMPTY_TOURNAMENT_FORM);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="admin-manage__list-heading">Tournaments &amp; Events</h2>
      {allTournaments.length === 0 ? (
        <p className="admin-manage__empty">None added yet.</p>
      ) : (
        <div className="admin-manage__list">
          {allTournaments.map((tournament) => (
            <div key={tournament.id} className="achievements-manage__tournament">
              <div className="admin-manage__row">
                <div>
                  <p className="admin-manage__row-title">{tournament.name}</p>
                  <p className="admin-manage__row-meta">
                    {tournament.kind === 'internal' ? 'Internal Tournament' : 'Inter-College Event'}
                    {' · '}
                    {tournament.records.length} record{tournament.records.length === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="admin-manage__row-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => toggleRecords(tournament.id)}
                  >
                    {expandedTournamentId === tournament.id ? 'Hide Records' : 'Manage Records'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => startEditTournament(tournament)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => handleDeleteTournament(tournament.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {expandedTournamentId === tournament.id && (
                <div className="achievements-manage__records">
                  <form
                    className="achievements-manage__record-form"
                    onSubmit={(e) => handleRecordSubmit(e, tournament)}
                  >
                    <label className="admin-manage__field">
                      <span>Year</span>
                      <input
                        type="text"
                        placeholder="e.g. 2026 — leave blank if unconfirmed"
                        value={recordForm.year}
                        onChange={(e) =>
                          setRecordForm((prev) => ({ ...prev, year: e.target.value }))
                        }
                      />
                    </label>

                    {tournament.kind === 'internal' ? (
                      <label className="admin-manage__field">
                        <span>Winner</span>
                        <input
                          type="text"
                          placeholder="Leave blank if unconfirmed"
                          value={recordForm.winner}
                          onChange={(e) =>
                            setRecordForm((prev) => ({ ...prev, winner: e.target.value }))
                          }
                        />
                      </label>
                    ) : (
                      <label className="admin-manage__field">
                        <span>Result</span>
                        <input
                          type="text"
                          placeholder="e.g. Participated, Runners-up"
                          value={recordForm.result}
                          onChange={(e) =>
                            setRecordForm((prev) => ({ ...prev, result: e.target.value }))
                          }
                        />
                      </label>
                    )}

                    <label className="admin-manage__field">
                      <span>Note (optional)</span>
                      <input
                        type="text"
                        value={recordForm.note}
                        onChange={(e) =>
                          setRecordForm((prev) => ({ ...prev, note: e.target.value }))
                        }
                      />
                    </label>

                    <div className="admin-manage__form-actions">
                      <button type="submit" className="btn btn-primary">
                        {editingRecordId ? 'Save Record' : 'Add Record'}
                      </button>
                      {editingRecordId && (
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => {
                            setEditingRecordId(null);
                            setRecordForm(EMPTY_RECORD_FORM);
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>

                  {tournament.records.map((record) => (
                    <div key={record.id} className="admin-manage__row achievements-manage__record-row">
                      <div>
                        <p className="admin-manage__row-title">{record.year ?? 'To be confirmed'}</p>
                        <p className="admin-manage__row-meta">
                          {record.value ?? 'To be confirmed'}
                          {record.note && ` · ${record.note}`}
                        </p>
                      </div>
                      <div className="admin-manage__row-actions">
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => startEditRecord(record)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => handleDeleteRecord(record.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ---------- Simple entries ---------- */}
      <form className="admin-manage__form" onSubmit={handleEntrySubmit}>
        <h2>{editingEntryId ? 'Edit Achievement' : 'New Achievement'}</h2>

        <label className="admin-manage__field">
          <span>Category</span>
          <select
            value={entryForm.category}
            onChange={(e) => setEntryForm((prev) => ({ ...prev, category: e.target.value }))}
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-manage__field">
          <span>Title</span>
          <input
            type="text"
            value={entryForm.title}
            onChange={(e) => setEntryForm((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
        </label>

        <label className="admin-manage__field">
          <span>Year (optional)</span>
          <input
            type="text"
            value={entryForm.year}
            onChange={(e) => setEntryForm((prev) => ({ ...prev, year: e.target.value }))}
          />
        </label>

        <div className="admin-manage__form-actions">
          <button type="submit" className="btn btn-primary">
            {editingEntryId ? 'Save Changes' : 'Add Achievement'}
          </button>
          {editingEntryId && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setEditingEntryId(null);
                setEntryForm(EMPTY_ENTRY_FORM);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="admin-manage__list-heading">University / Team / Player / Coach Achievements</h2>
      {allEntries.length === 0 ? (
        <p className="admin-manage__empty">None added yet.</p>
      ) : (
        <div className="admin-manage__list">
          {allEntries.map((entry) => (
            <div key={entry.id} className="admin-manage__row">
              <div>
                <p className="admin-manage__row-title">{entry.title}</p>
                <p className="admin-manage__row-meta">
                  {CATEGORY_LABELS[entry.category]}
                  {entry.year && ` · ${entry.year}`}
                </p>
              </div>
              <div className="admin-manage__row-actions">
                <button type="button" className="btn btn-outline" onClick={() => startEditEntry(entry)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => handleDeleteEntry(entry.id)}
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
