import { useEffect, useState } from 'react';
import { getSponsors } from '@/services/sponsors';
import './SponsorsStrip.css';

/**
 * Renders nothing (returns null) until sponsors exist in
 * src/features/sponsors/data/sponsorsSeedData.js — safe to mount
 * unconditionally in Footer/Home without an empty-state flash.
 */
export default function SponsorsStrip() {
  const [sponsors, setSponsors] = useState([]);

  useEffect(() => {
    let isMounted = true;
    getSponsors().then((data) => {
      if (isMounted) setSponsors(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (sponsors.length === 0) return null;

  return (
    <div className="sponsors-strip">
      <p className="sponsors-strip__label eyebrow">Our Sponsors</p>
      <div className="sponsors-strip__logos">
        {sponsors.map((sponsor) => (
          <a
            key={sponsor.id}
            href={sponsor.website}
            target="_blank"
            rel="noreferrer noopener"
            className="sponsors-strip__logo-link"
          >
            <img src={sponsor.logo} alt={sponsor.name} className="sponsors-strip__logo" />
          </a>
        ))}
      </div>
    </div>
  );
}
