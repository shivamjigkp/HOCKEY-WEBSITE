import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loader from '@/components/Loader/Loader';
import SectionDivider from '@/components/SectionDivider/SectionDivider';
import { formatDate } from '@/utils/formatDate';
import { getNewsBySlug } from '@/services/news';
import { ROUTES } from '@/constants/routes';
import './NewsDetails.css';

export default function NewsDetails() {
  const { newsId } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getNewsBySlug(newsId).then((data) => {
      if (isMounted) {
        setPost(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [newsId]);

  if (isLoading) {
    return (
      <div className="news-details-page">
        <div className="container">
          <Loader label="Loading article" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="news-details-page">
        <div className="container news-details-page__not-found">
          <p className="eyebrow">Not found</p>
          <h1>This story isn&apos;t available</h1>
          <Link to={ROUTES.NEWS} className="btn btn-outline">
            ← Back to News
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="news-details-page">
      <div className="container">
        <Link to={ROUTES.NEWS} className="news-details-page__back">
          ← Back to News
        </Link>

        <span
          className={
            post.type === 'announcement'
              ? 'news-card__tag news-card__tag--announcement'
              : 'news-card__tag'
          }
        >
          {post.type === 'announcement' ? 'Announcement' : 'News'}
        </span>

        <h1 className="news-details-page__title">{post.title}</h1>
        <div className="news-details-page__meta">
          <span>{post.author}</span>
          <span className="news-card__dot" aria-hidden="true" />
          <span>{formatDate(post.published_at)}</span>
        </div>

        {post.cover_image_url && (
          <img src={post.cover_image_url} alt="" className="news-details-page__cover" />
        )}

        <SectionDivider />

        <div className="news-details-page__body">
          {post.body
            .trim()
            .split(/\n\s*\n/)
            .map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph.trim()}</p>
            ))}
        </div>
      </div>
    </div>
  );
}
