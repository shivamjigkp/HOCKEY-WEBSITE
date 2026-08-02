import { useEffect, useState } from 'react';
import Loader from '@/components/Loader/Loader';
import { getVideos, createVideo, updateVideo, deleteVideo } from '@/services/videos';
import { getMatches } from '@/services/matches';
import { formatDate } from '@/utils/formatDate';
import '../adminManage.css';

const EMPTY_FORM = {
  title: '',
  competition: '',
  date: '',
  youtubeId: '',
  thumbnail: '',
  matchId: '',
};

export default function VideosManage() {
  const [videos, setVideos] = useState([]);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  function load() {
    setIsLoading(true);
    return Promise.all([getVideos(), getMatches()])
      .then(([videoData, matchData]) => {
        setVideos(videoData);
        setMatches(matchData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function startEdit(video) {
    setEditingId(video.id);
    setForm({
      title: video.title,
      competition: video.competition ?? '',
      date: video.date ?? '',
      youtubeId: video.youtubeId,
      thumbnail: video.thumbnail ?? '',
      matchId: video.matchId ?? '',
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
        const updated = await updateVideo(editingId, form);
        setVideos((prev) => prev.map((v) => (v.id === editingId ? updated : v)));
      } else {
        const created = await createVideo(form);
        setVideos((prev) => [created, ...prev]);
      }
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this highlight? This cannot be undone.')) return;
    try {
      await deleteVideo(id);
      setVideos((prev) => prev.filter((v) => v.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="admin-manage">
      <p className="eyebrow">Admin</p>
      <h1 className="admin-manage__title">Highlight Videos</h1>
      <p className="admin-manage__note">
        Paste the YouTube video ID only (the part after &quot;v=&quot; in the URL), not the full
        link.
      </p>

      {error && <p className="admin-manage__error">{error}</p>}

      <form className="admin-manage__form" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Edit Highlight' : 'New Highlight'}</h2>

        <label className="admin-manage__field">
          <span>Title</span>
          <input type="text" value={form.title} onChange={handleChange('title')} required />
        </label>

        <label className="admin-manage__field">
          <span>YouTube Video ID</span>
          <input
            type="text"
            placeholder="e.g. dQw4w9WgXcQ"
            value={form.youtubeId}
            onChange={handleChange('youtubeId')}
            required
          />
        </label>

        <label className="admin-manage__field">
          <span>Competition</span>
          <input type="text" value={form.competition} onChange={handleChange('competition')} />
        </label>

        <label className="admin-manage__field">
          <span>Date</span>
          <input type="date" value={form.date} onChange={handleChange('date')} />
        </label>

        <label className="admin-manage__field">
          <span>Thumbnail URL (optional — falls back to the YouTube thumbnail)</span>
          <input type="url" value={form.thumbnail} onChange={handleChange('thumbnail')} />
        </label>

        <label className="admin-manage__field">
          <span>Linked Match (optional)</span>
          <select value={form.matchId} onChange={handleChange('matchId')}>
            <option value="">None</option>
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                {match.competition}: {match.homeTeam} vs {match.awayTeam} —{' '}
                {formatDate(match.date)}
              </option>
            ))}
          </select>
        </label>

        <div className="admin-manage__form-actions">
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Highlight'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="admin-manage__list-heading">All Highlights</h2>

      {isLoading ? (
        <Loader label="Loading highlights" />
      ) : videos.length === 0 ? (
        <p className="admin-manage__empty">No highlights yet.</p>
      ) : (
        <div className="admin-manage__list">
          {videos.map((video) => (
            <div key={video.id} className="admin-manage__row">
              <div>
                <p className="admin-manage__row-title">{video.title}</p>
                <p className="admin-manage__row-meta">
                  {video.competition || 'No competition'} — {formatDate(video.date)}
                </p>
              </div>
              <div className="admin-manage__row-actions">
                <button type="button" className="btn btn-outline" onClick={() => startEdit(video)}>
                  Edit
                </button>
                <button type="button" className="btn btn-outline" onClick={() => handleDelete(video.id)}>
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
