import { useEffect, useState } from 'react';
import Loader from '@/components/Loader/Loader';
import ImageUploadField from '@/components/ImageUploadField/ImageUploadField';
import { formatDate } from '@/utils/formatDate';
import { getNews, createNews, updateNews, deleteNews } from '@/services/news';
import './NewsManage.css';

const EMPTY_FORM = {
  type: 'news',
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  author: '',
  publishedAt: '',
  coverImage: '',
};

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function NewsManage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  function load() {
    setIsLoading(true);
    return getNews()
      .then(setPosts)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function handleChange(field) {
    return (e) => {
      const value = e.target.value;
      setForm((prev) => ({
        ...prev,
        [field]: value,
        ...(field === 'title' && !editingId ? { slug: slugify(value) } : {}),
      }));
    };
  }

  function startEdit(post) {
    setEditingId(post.id);
    setForm({
      type: post.type,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? '',
      body: post.body,
      author: post.author ?? '',
      publishedAt: post.published_at ? post.published_at.slice(0, 16) : '',
      coverImage: post.cover_image_url ?? '',
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
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
      };
      if (editingId) {
        const updated = await updateNews(editingId, payload);
        setPosts((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
      } else {
        const created = await createNews(payload);
        setPosts((prev) => [created, ...prev]);
      }
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await deleteNews(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="news-manage">
      <p className="eyebrow">Admin</p>
      <h1 className="news-manage__title">News &amp; Announcements</h1>

      {error && <p className="news-manage__error">{error}</p>}

      <form className="news-manage__form" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Edit Post' : 'New Post'}</h2>

        <label className="news-manage__field">
          <span>Type</span>
          <select value={form.type} onChange={handleChange('type')}>
            <option value="news">News</option>
            <option value="announcement">Announcement</option>
          </select>
        </label>

        <label className="news-manage__field">
          <span>Title</span>
          <input type="text" value={form.title} onChange={handleChange('title')} required />
        </label>

        <label className="news-manage__field">
          <span>Slug</span>
          <input type="text" value={form.slug} onChange={handleChange('slug')} required />
        </label>

        <label className="news-manage__field">
          <span>Excerpt</span>
          <input type="text" value={form.excerpt} onChange={handleChange('excerpt')} />
        </label>

        <label className="news-manage__field">
          <span>Body</span>
          <textarea rows={6} value={form.body} onChange={handleChange('body')} required />
        </label>

        <ImageUploadField
          value={form.coverImage}
          onChange={(url) => setForm((prev) => ({ ...prev, coverImage: url }))}
          folder="news"
          label="Cover Image"
        />

        <label className="news-manage__field">
          <span>Author</span>
          <input type="text" value={form.author} onChange={handleChange('author')} />
        </label>

        <label className="news-manage__field">
          <span>Published At</span>
          <input
            type="datetime-local"
            value={form.publishedAt}
            onChange={handleChange('publishedAt')}
          />
        </label>

        <div className="news-manage__form-actions">
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving…' : editingId ? 'Save Changes' : 'Publish'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="news-manage__list-heading">All Posts</h2>

      {isLoading ? (
        <Loader label="Loading posts" />
      ) : posts.length === 0 ? (
        <p className="news-manage__empty">No posts yet.</p>
      ) : (
        <div className="news-manage__list">
          {posts.map((post) => (
            <div key={post.id} className="news-manage__row">
              <div>
                <span
                  className={
                    post.type === 'announcement'
                      ? 'news-manage__tag news-manage__tag--announcement'
                      : 'news-manage__tag'
                  }
                >
                  {post.type}
                </span>
                <p className="news-manage__row-title">{post.title}</p>
                <p className="news-manage__row-meta">{formatDate(post.published_at)}</p>
              </div>
              <div className="news-manage__row-actions">
                <button type="button" className="btn btn-outline" onClick={() => startEdit(post)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => handleDelete(post.id)}
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
