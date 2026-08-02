import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/formatDate';
import SectionDivider from '@/components/SectionDivider/SectionDivider';
import { LATEST_NEWS } from '../../data/homeMockData';
import './LatestNews.css';

export default function LatestNews() {
  return (
    <section className="latest-news">
      <div className="container">
        <SectionDivider label="Latest News" />

        <div className="latest-news__grid">
          {LATEST_NEWS.map((item) => (
            <article className="news-card" key={item.id}>
              <p className="news-card__date">{formatDate(item.date)}</p>
              <h3 className="news-card__title">{item.title}</h3>
              <p className="news-card__excerpt">{item.excerpt}</p>
              <Link className="news-card__link" to={ROUTES.NEWS}>
                Read more
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
