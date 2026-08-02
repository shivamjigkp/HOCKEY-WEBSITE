import { useEffect, useState } from 'react';
import Loader from '@/components/Loader/Loader';
import { formatDate } from '@/utils/formatDate';
import {
  getContactMessages,
  markContactMessageRead,
  deleteContactMessage,
} from '@/services/contact';
import '../adminManage.css';
import './ContactMessagesManage.css';

export default function ContactMessagesManage() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    setIsLoading(true);
    return getContactMessages()
      .then(setMessages)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleToggleRead(msg) {
    try {
      await markContactMessageRead(msg.id, !msg.is_read);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_read: !msg.is_read } : m))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this message? This cannot be undone.')) return;
    try {
      await deleteContactMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="admin-manage">
      <p className="eyebrow">Admin</p>
      <h1 className="admin-manage__title">Contact Messages</h1>
      <p className="admin-manage__note">
        Submissions from the public Contact form. {unreadCount > 0 && `${unreadCount} unread.`}
      </p>

      {error && <p className="admin-manage__error">{error}</p>}

      {isLoading ? (
        <Loader label="Loading messages" />
      ) : messages.length === 0 ? (
        <p className="admin-manage__empty">No messages yet.</p>
      ) : (
        <div className="admin-manage__list">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={
                msg.is_read
                  ? 'admin-manage__row contact-message'
                  : 'admin-manage__row contact-message contact-message--unread'
              }
            >
              <div className="contact-message__body">
                <p className="admin-manage__row-title">
                  {msg.name} <span className="contact-message__email">&lt;{msg.email}&gt;</span>
                </p>
                <p className="admin-manage__row-meta">
                  {msg.subject || '(No subject)'} — {formatDate(msg.created_at)}
                </p>
                <p className="contact-message__text">{msg.message}</p>
              </div>
              <div className="admin-manage__row-actions">
                <button type="button" className="btn btn-outline" onClick={() => handleToggleRead(msg)}>
                  {msg.is_read ? 'Mark Unread' : 'Mark Read'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => handleDelete(msg.id)}>
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
