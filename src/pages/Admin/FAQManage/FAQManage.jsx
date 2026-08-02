import { useEffect, useState } from 'react';
import Loader from '@/components/Loader/Loader';
import { getFaqs, createFaq, updateFaq, deleteFaq } from '@/services/faq';
import '../adminManage.css';

const EMPTY_FORM = { question: '', answer: '', sortOrder: '' };

export default function FAQManage() {
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  function load() {
    setIsLoading(true);
    return getFaqs()
      .then(setFaqs)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function startEdit(faq) {
    setEditingId(faq.id);
    setForm({
      question: faq.question,
      answer: faq.answer,
      sortOrder: faq.sortOrder != null ? String(faq.sortOrder) : '',
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
      const payload = { ...form, sortOrder: form.sortOrder ? Number(form.sortOrder) : 0 };
      if (editingId) {
        const updated = await updateFaq(editingId, payload);
        setFaqs((prev) => prev.map((f) => (f.id === editingId ? updated : f)));
      } else {
        const created = await createFaq(payload);
        setFaqs((prev) => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this FAQ? This cannot be undone.')) return;
    try {
      await deleteFaq(id);
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="admin-manage">
      <p className="eyebrow">Admin</p>
      <h1 className="admin-manage__title">FAQ</h1>
      <p className="admin-manage__note">
        Sort order controls display order on the public FAQ page (lowest first).
      </p>

      {error && <p className="admin-manage__error">{error}</p>}

      <form className="admin-manage__form" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Edit Question' : 'New Question'}</h2>

        <label className="admin-manage__field">
          <span>Question</span>
          <input type="text" value={form.question} onChange={handleChange('question')} required />
        </label>

        <label className="admin-manage__field">
          <span>Answer</span>
          <textarea rows={4} value={form.answer} onChange={handleChange('answer')} required />
        </label>

        <label className="admin-manage__field">
          <span>Sort Order</span>
          <input type="number" value={form.sortOrder} onChange={handleChange('sortOrder')} />
        </label>

        <div className="admin-manage__form-actions">
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Question'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="admin-manage__list-heading">All Questions</h2>

      {isLoading ? (
        <Loader label="Loading FAQs" />
      ) : faqs.length === 0 ? (
        <p className="admin-manage__empty">No FAQs yet.</p>
      ) : (
        <div className="admin-manage__list">
          {faqs.map((faq) => (
            <div key={faq.id} className="admin-manage__row">
              <div>
                <p className="admin-manage__row-title">{faq.question}</p>
                <p className="admin-manage__row-meta">Order: {faq.sortOrder}</p>
              </div>
              <div className="admin-manage__row-actions">
                <button type="button" className="btn btn-outline" onClick={() => startEdit(faq)}>
                  Edit
                </button>
                <button type="button" className="btn btn-outline" onClick={() => handleDelete(faq.id)}>
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
