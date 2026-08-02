import { useState } from 'react';
import SectionDivider from '@/components/SectionDivider/SectionDivider';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { submitContactForm } from '@/services/contact';
import './Contact.css';

export default function Contact() {
  const settings = useSiteSettings();
  const socialLinks = [
    { label: 'Instagram', href: settings.instagram },
    { label: 'Facebook', href: settings.facebook },
    { label: 'YouTube', href: settings.youtube },
  ];
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('');

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('');
    try {
      const result = await submitContactForm(form);
      setStatus(
        result.method === 'database'
          ? "Message sent — we'll get back to you soon."
          : 'Your email app should now be open with the message ready to send.'
      );
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('Something went wrong. Please email us directly instead.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="contact-page">
      <div className="container contact-page__grid">
        <div>
          <p className="eyebrow">Get in Touch</p>
          <h1 className="contact-page__title">Contact Us</h1>
          <SectionDivider />

          <form className="contact-form" onSubmit={handleSubmit}>
            <label className="contact-form__field">
              <span>Name</span>
              <input type="text" value={form.name} onChange={handleChange('name')} required />
            </label>

            <label className="contact-form__field">
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                required
              />
            </label>

            <label className="contact-form__field">
              <span>Subject</span>
              <input type="text" value={form.subject} onChange={handleChange('subject')} />
            </label>

            <label className="contact-form__field">
              <span>Message</span>
              <textarea
                rows={5}
                value={form.message}
                onChange={handleChange('message')}
                required
              />
            </label>

            {status && <p className="contact-form__status">{status}</p>}

            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>

        <div className="contact-page__info">
          <h2 className="contact-page__info-heading">MMMUT Hockey</h2>
          <p className="contact-page__info-text">
            Madan Mohan Malaviya University of Technology, Gorakhpur, Uttar Pradesh
          </p>

          <a className="contact-page__email" href={`mailto:${settings.contactEmail}`}>
            {settings.contactEmail}
          </a>

          <div className="contact-page__social">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer noopener">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
