import { useEffect, useState } from 'react';
import Loader from '@/components/Loader/Loader';
import SectionDivider from '@/components/SectionDivider/SectionDivider';
import { getOfficials } from '@/services/officials';
import './Officials.css';

export default function Officials() {
  const [officials, setOfficials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getOfficials().then((data) => {
      if (isMounted) {
        setOfficials(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="officials-page">
      <div className="container">
        <p className="eyebrow">The Team Behind the Team</p>
        <h1 className="officials-page__title">Officials</h1>
        <SectionDivider />

        {isLoading ? (
          <Loader label="Loading officials" />
        ) : officials.length === 0 ? (
          <p className="officials-page__empty">No officials have been added yet.</p>
        ) : (
          <div className="officials-page__grid">
            {officials.map((official) => (
              <div key={official.id} className="official-card">
                <div className="official-card__photo" aria-hidden="true">
                  {official.photoUrl ? (
                    <img src={official.photoUrl} alt="" className="official-card__photo-img" />
                  ) : (
                    <span className="official-card__initial">
                      {official.name?.[0]?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>

                <p className="official-card__role">{official.role}</p>
                <h3 className="official-card__name">{official.name}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
