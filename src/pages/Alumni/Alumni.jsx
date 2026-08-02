import { useEffect, useState } from 'react';
import Loader from '@/components/Loader/Loader';
import SectionDivider from '@/components/SectionDivider/SectionDivider';
import { getAlumni } from '@/services/alumni';
import './Alumni.css';

export default function Alumni() {
  const [alumni, setAlumni] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getAlumni().then((data) => {
      if (isMounted) {
        setAlumni(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="alumni-page">
      <div className="container">
        <p className="eyebrow">Where They Are Now</p>
        <h1 className="alumni-page__title">Alumni</h1>
        <SectionDivider />

        {isLoading ? (
          <Loader label="Loading alumni" />
        ) : alumni.length === 0 ? (
          <p className="alumni-page__empty">No alumni have been added yet.</p>
        ) : (
          <div className="alumni-page__grid">
            {alumni.map((alumnus) => (
              <div key={alumnus.id} className="alumnus-card">
                <div className="alumnus-card__photo" aria-hidden="true">
                  {alumnus.photoUrl ? (
                    <img src={alumnus.photoUrl} alt="" className="alumnus-card__photo-img" />
                  ) : (
                    <span className="alumnus-card__initial">
                      {alumnus.name?.[0]?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>

                {alumnus.role && <p className="alumnus-card__role">{alumnus.role}</p>}
                <h3 className="alumnus-card__name">{alumnus.name}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
