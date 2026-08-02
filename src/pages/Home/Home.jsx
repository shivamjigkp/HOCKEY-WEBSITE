import HeroSection from '@/features/home/components/HeroSection/HeroSection';
import HeroSlideshow from '@/features/home/components/HeroSlideshow/HeroSlideshow';
import StatsStrip from '@/features/home/components/StatsStrip/StatsStrip';
import UpcomingMatch from '@/features/home/components/UpcomingMatch/UpcomingMatch';
import RosterHighlights from '@/features/home/components/RosterHighlights/RosterHighlights';
import LatestNews from '@/features/home/components/LatestNews/LatestNews';
import CtaBanner from '@/features/home/components/CtaBanner/CtaBanner';

export default function Home() {
  return (
    <div className="home">
      <HeroSlideshow />
      <StatsStrip />
      <HeroSection />
      <LatestNews />
      <UpcomingMatch />
      <RosterHighlights />
      <CtaBanner />
    </div>
  );
}
