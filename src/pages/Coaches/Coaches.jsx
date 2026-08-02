import { useEffect, useState } from 'react';
import Loader from '@/components/Loader/Loader';
import SectionDivider from '@/components/SectionDivider/SectionDivider';
import { getCoaches } from '@/services/coaches';
import './Coaches.css';

export default function Coaches() {
  const [coaches, setCoaches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getCoaches().then((data) => {
      if (isMounted) {
        setCoaches(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="coaches-page">
      <div className="container">
        <p className="eyebrow">The Coaching Staff</p>
        <h1 className="coaches-page__title">Coaches</h1>
        <SectionDivider />

        {isLoading ? (
          <Loader label="Loading coaching staff" />
        ) : (
          <div className="coaches-page__grid">
            {coaches.map((coach) => (
              <div key={coach.id} className="coach-card">
                <div className="coach-card__photo" aria-hidden="true">
                  {coach.photoUrl ? (
                    <img src={coach.photoUrl} alt="" className="coach-card__photo-img" />
                  ) : (
                    <span className="coach-card__initial">C</span>
                  )}
                </div>

                <p className="coach-card__role">{coach.role}</p>
                <h3 className="coach-card__name">
                  {coach.name === 'To be confirmed' ? (
                    <span className="coaches-badge coaches-badge--pending">To be confirmed</span>
                  ) : (
                    coach.name
                  )}
                </h3>

                <p className="coach-card__experience">
                  {coach.experienceYears
                    ? `${coach.experienceYears}+ years experience`
                    : 'Experience: to be confirmed'}
                </p>

                <p className="coach-card__bio">{coach.bio}</p>

                <div className="coach-card__achievements">
                  <h4>Achievements</h4>
                  {coach.achievements.length === 0 ? (
                    <p className="coach-card__empty">No achievements added yet.</p>
                  ) : (
                    <ul>
                      {coach.achievements.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
