import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Loader from '@/components/Loader/Loader';
import SectionDivider from '@/components/SectionDivider/SectionDivider';
import { formatDate, formatTime } from '@/utils/formatDate';
import { getUpcomingEvents, getPastEvents } from '@/services/events';
import './Events.css';

function EventCard({ event, isPast }) {
  return (
    <div className={isPast ? 'event-card event-card--past' : 'event-card'}>
      <div className="event-card__date-block">
        <span className="event-card__day">
          {new Intl.DateTimeFormat('en-US', { day: 'numeric' }).format(new Date(event.event_date))}
        </span>
        <span className="event-card__month">
          {new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(event.event_date))}
        </span>
      </div>
      <div className="event-card__body">
        <h3 className="event-card__title">{event.title}</h3>
        <p className="event-card__description">{event.description}</p>
        <div className="event-card__meta">
          <span>{formatDate(event.event_date)}</span>
          <span className="event-card__dot" aria-hidden="true" />
          <span>{formatTime(event.event_date)}</span>
          <span className="event-card__dot" aria-hidden="true" />
          <span>{event.venue}</span>
        </div>
      </div>
    </div>
  );
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') ?? 'upcoming';

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    const fetcher = activeTab === 'past' ? getPastEvents : getUpcomingEvents;
    fetcher().then((data) => {
      if (isMounted) {
        setEvents(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  const handleTabChange = (tab) => {
    const next = new URLSearchParams(searchParams);
    if (tab === 'upcoming') next.delete('tab');
    else next.set('tab', tab);
    setSearchParams(next);
  };

  return (
    <div className="events-page">
      <div className="container">
        <p className="eyebrow">On the Calendar</p>
        <h1 className="events-page__title">Events</h1>
        <SectionDivider />

        <div className="events-page__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'upcoming'}
            className={
              activeTab === 'upcoming'
                ? 'events-page__tab events-page__tab--active'
                : 'events-page__tab'
            }
            onClick={() => handleTabChange('upcoming')}
          >
            Upcoming
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'past'}
            className={
              activeTab === 'past' ? 'events-page__tab events-page__tab--active' : 'events-page__tab'
            }
            onClick={() => handleTabChange('past')}
          >
            Past
          </button>
        </div>

        {isLoading ? (
          <Loader label="Loading events" />
        ) : events.length === 0 ? (
          <p className="events-page__empty">No {activeTab} events.</p>
        ) : (
          <div className="events-page__list">
            {events.map((event) => (
              <EventCard key={event.id} event={event} isPast={activeTab === 'past'} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
