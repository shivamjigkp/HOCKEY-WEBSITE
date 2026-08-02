import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Loader from '@/components/Loader/Loader';
import SectionDivider from '@/components/SectionDivider/SectionDivider';
import { formatDate } from '@/utils/formatDate';
import { getNews } from '@/services/news';
import { ROUTES } from '@/constants/routes';
import './News.css';

function NewsCard({ post }) {
  return (
    <Link to={ROUTES.NEWS_DETAILS.replace(':newsId', post.slug)} className="news-card">
      {post.cover_image_url && (
        <img src={post.cover_image_url} alt="" className="news-card__cover" />
      )}
      <div className="news-card__top">
        <span
          className={
            post.type === 'announcement'
              ? 'news-card__tag news-card__tag--announcement'
              : 'news-card__tag'
          }
        >
          {post.type === 'announcement' ? 'Announcement' : 'News'}
        </span>
        <span className="news-card__date">{formatDate(post.published_at)}</span>
      </div>
      <h3 className="news-card__title">{post.title}</h3>
      <p className="news-card__excerpt">{post.excerpt}</p>
      <span className="news-card__read-more">Read more →</span>
    </Link>
  );
}

export default function News() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const activeFilter = searchParams.get('type') ?? 'all';

  useEffect(() => {
    let isMounted = true;
    getNews().then((data) => {
      if (isMounted) {
        setPosts(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPosts = useMemo(() => {
    if (activeFilter === 'all') return posts;
    return posts.filter((p) => p.type === activeFilter);
  }, [posts, activeFilter]);

  const handleFilterChange = (type) => {
    const next = new URLSearchParams(searchParams);
    if (type === 'all') next.delete('type');
    else next.set('type', type);
    setSearchParams(next);
  };

  return (
    <div className="news-page">
      <div className="container">
        <p className="eyebrow">Club News</p>
        <h1 className="news-page__title">News &amp; Announcements</h1>
        <SectionDivider />

        <div className="news-page__tabs" role="tablist">
          {[
            { key: 'all', label: 'All' },
            { key: 'news', label: 'News' },
            { key: 'announcement', label: 'Announcements' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeFilter === tab.key}
              className={
                activeFilter === tab.key
                  ? 'news-page__tab news-page__tab--active'
                  : 'news-page__tab'
              }
              onClick={() => handleFilterChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <Loader label="Loading news" />
        ) : filteredPosts.length === 0 ? (
          <p className="news-page__empty">No posts found.</p>
        ) : (
          <div className="news-page__grid">
            {filteredPosts.map((post) => (
              <NewsCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
