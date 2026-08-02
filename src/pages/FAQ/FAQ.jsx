import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '@/components/Loader/Loader';
import SectionDivider from '@/components/SectionDivider/SectionDivider';
import { getFaqs } from '@/services/faq';
import { ROUTES } from '@/constants/routes';
import './FAQ.css';

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className={isOpen ? 'faq-item faq-item--open' : 'faq-item'}>
      <button
        type="button"
        className="faq-item__question"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        {item.question}
        <span className="faq-item__icon" aria-hidden="true">
          {isOpen ? '\u2212' : '+'}
        </span>
      </button>
      {isOpen && <p className="faq-item__answer">{item.answer}</p>}
    </div>
  );
}

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getFaqs().then((data) => {
      if (isMounted) {
        setFaqs(data);
        setOpenId(data[0]?.id ?? null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggle = (id) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <div className="faq-page">
      <div className="container">
        <p className="eyebrow">Need Help?</p>
        <h1 className="faq-page__title">Frequently Asked Questions</h1>
        <SectionDivider />

        {isLoading ? (
          <Loader label="Loading FAQs" />
        ) : (
          <div className="faq-page__list">
            {faqs.map((item) => (
              <FAQItem
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onToggle={() => handleToggle(item.id)}
              />
            ))}
          </div>
        )}

        <p className="faq-page__contact-note">
          Still have questions? <Link to={ROUTES.CONTACT}>Get in touch</Link>.
        </p>
      </div>
    </div>
  );
}
