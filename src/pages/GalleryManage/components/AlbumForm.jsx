import { useState } from 'react';
import { createAlbum } from '@/services/gallery';
import './AlbumForm.css';

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function AlbumForm({ onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setError('');
    try {
      const album = await createAlbum({
        title: title.trim(),
        slug: slugify(title),
        description: description.trim() || null,
      });
      setTitle('');
      setDescription('');
      onCreated(album);
    } catch (err) {
      setError(err.message || 'Could not create the album.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="album-form" onSubmit={handleSubmit}>
      <h2 className="album-form__heading">New Album</h2>

      <label className="album-form__field">
        <span>Title</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Inter-Year Tournament 2026"
          required
        />
      </label>

      <label className="album-form__field">
        <span>Description (optional)</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </label>

      {error && <p className="album-form__error">{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? 'Creating…' : 'Create Album'}
      </button>
    </form>
  );
}
