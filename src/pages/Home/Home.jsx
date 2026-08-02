import HeroSection from '@/features/home/components/HeroSection/HeroSection';
import HeroSlideshow from '@/features/home/components/HeroSlideshow/HeroSlideshow';
import StatsStrip from '@/features/home/components/StatsStrip/StatsStrip';
import UpcomingMatch from '@/features/home/components/UpcomingMatch/UpcomingMatch';
import FeaturedPlayers from '@/features/home/components/FeaturedPlayers/FeaturedPlayers';
import LatestNews from '@/features/home/components/LatestNews/LatestNews';
import CtaBanner from '@/features/home/components/CtaBanner/CtaBanner';

export default function Home() {
  return (
    <div className="home">
      <HeroSection />
      <HeroSlideshow />
      <StatsStrip />
      <UpcomingMatch />
      <FeaturedPlayers />
      <LatestNews />
      <CtaBanner />
    </div>
  );
}
