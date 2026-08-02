import { useEffect, useState } from 'react';
import Loader from '@/components/Loader/Loader';
import { formatDate, formatTime } from '@/utils/formatDate';
import { getEvents, createEvent, updateEvent, deleteEvent } from '@/services/events';
import './EventsManage.css';

const EMPTY_FORM = { title: '', description: '', venue: '', eventDate: '' };

export default function EventsManage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  function load() {
    setIsLoading(true);
    return getEvents()
      .then(setEvents)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function startEdit(event) {
    setEditingId(event.id);
    setForm({
      title: event.title,
      description: event.description ?? '',
      venue: event.venue ?? '',
      eventDate: event.event_date ? event.event_date.slice(0, 16) : '',
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
      const payload = { ...form, eventDate: new Date(form.eventDate).toISOString() };
      if (editingId) {
        const updated = await updateEvent(editingId, payload);
        setEvents((prev) => prev.map((ev) => (ev.id === editingId ? updated : ev)));
      } else {
        const created = await createEvent(payload);
        setEvents((prev) => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="events-manage">
      <p className="eyebrow">Admin</p>
      <h1 className="events-manage__title">Events</h1>

      {error && <p className="events-manage__error">{error}</p>}

      <form className="events-manage__form" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Edit Event' : 'New Event'}</h2>

        <label className="events-manage__field">
          <span>Title</span>
          <input type="text" value={form.title} onChange={handleChange('title')} required />
        </label>

        <label className="events-manage__field">
          <span>Description</span>
          <textarea rows={4} value={form.description} onChange={handleChange('description')} />
        </label>

        <label className="events-manage__field">
          <span>Venue</span>
          <input type="text" value={form.venue} onChange={handleChange('venue')} />
        </label>

        <label className="events-manage__field">
          <span>Date &amp; Time</span>
          <input
            type="datetime-local"
            value={form.eventDate}
            onChange={handleChange('eventDate')}
            required
          />
        </label>

        <div className="events-manage__form-actions">
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Event'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="events-manage__list-heading">All Events</h2>

      {isLoading ? (
        <Loader label="Loading events" />
      ) : events.length === 0 ? (
        <p className="events-manage__empty">No events yet.</p>
      ) : (
        <div className="events-manage__list">
          {events.map((event) => (
            <div key={event.id} className="events-manage__row">
              <div>
                <p className="events-manage__row-title">{event.title}</p>
                <p className="events-manage__row-meta">
                  {formatDate(event.event_date)} · {formatTime(event.event_date)}
                  {event.venue ? ` · ${event.venue}` : ''}
                </p>
              </div>
              <div className="events-manage__row-actions">
                <button type="button" className="btn btn-outline" onClick={() => startEdit(event)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => handleDelete(event.id)}
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
