import { useCountUp } from '@/hooks/useCountUp';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { STATS_META } from '../../data/homeMockData';
import './StatsStrip.css';

function StatItem({ label, value, suffix, format }) {
  const { ref, value: animatedValue } = useCountUp(value);
  const display = format === 'year' ? animatedValue : `${animatedValue}${suffix || ''}`;

  return (
    <div className="stats-strip__item" ref={ref}>
      <span className="stats-strip__value">{display}</span>
      <span className="stats-strip__label">{label}</span>
    </div>
  );
}

export default function StatsStrip() {
  // Numbers are admin-editable (Admin > Settings), synced through
  // site_settings — see src/services/settings.js. useSiteSettings starts
  // from sane defaults so this never renders empty/zeroed on first paint.
  const settings = useSiteSettings();

  return (
    <section className="stats-strip" aria-label="Program highlights">
      <div className="container stats-strip__grid">
        {STATS_META.map((stat) => (
          <StatItem
            key={stat.id}
            label={stat.label}
            value={settings[stat.settingKey]}
            suffix={stat.suffix}
            format={stat.format}
          />
        ))}
      </div>
    </section>
  );
}
