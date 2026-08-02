import { Routes, Route } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout/MainLayout';
import Home from '@/pages/Home/Home';
import Players from '@/pages/Players/Players';
import PlayerDetails from '@/pages/PlayerDetails/PlayerDetails';
import Achievements from '@/pages/Achievements/Achievements';
import Statistics from '@/pages/Statistics/Statistics';
import Officials from '@/pages/Officials/Officials';
import Matches from '@/pages/Matches/Matches';
import TournamentHistory from '@/pages/TournamentHistory/TournamentHistory';
import Results from '@/pages/Results/Results';
import Live from '@/pages/Live/Live';
import Videos from '@/pages/Videos/Videos';
import Gallery from '@/pages/Gallery/Gallery';
import AlbumDetail from '@/pages/AlbumDetail/AlbumDetail';
import GalleryManage from '@/pages/GalleryManage/GalleryManage';
import News from '@/pages/News/News';
import NewsDetails from '@/pages/NewsDetails/NewsDetails';
import Events from '@/pages/Events/Events';
import Contact from '@/pages/Contact/Contact';
import FAQ from '@/pages/FAQ/FAQ';
import Login from '@/pages/Login/Login';
import Signup from '@/pages/Signup/Signup';
import ProtectedRoute from '@/routes/ProtectedRoute';
import AdminLayout from '@/layouts/AdminLayout/AdminLayout';
import AdminDashboard from '@/pages/Admin/AdminDashboard/AdminDashboard';
import NewsManage from '@/pages/Admin/NewsManage/NewsManage';
import EventsManage from '@/pages/Admin/EventsManage/EventsManage';
import PlayersManage from '@/pages/Admin/PlayersManage/PlayersManage';
import OfficialsManage from '@/pages/Admin/OfficialsManage/OfficialsManage';
import MatchesManage from '@/pages/Admin/MatchesManage/MatchesManage';
import AchievementsManage from '@/pages/Admin/AchievementsManage/AchievementsManage';
import SponsorsManage from '@/pages/Admin/SponsorsManage/SponsorsManage';
import FAQManage from '@/pages/Admin/FAQManage/FAQManage';
import ContactMessagesManage from '@/pages/Admin/ContactMessagesManage/ContactMessagesManage';
import VideosManage from '@/pages/Admin/VideosManage/VideosManage';
import HeroSlidesManage from '@/pages/Admin/HeroSlidesManage/HeroSlidesManage';
import SquadPhotosManage from '@/pages/Admin/SquadPhotosManage/SquadPhotosManage';
import RosterHighlightsManage from '@/pages/Admin/RosterHighlightsManage/RosterHighlightsManage';
import SettingsManage from '@/pages/Admin/SettingsManage/SettingsManage';
import NotFound from '@/pages/NotFound/NotFound';
import { ROUTES } from '@/constants/routes';

/**
 * Only routes with a completed page component are registered below.
 * Add each new route here as its module ships (see MASTER_PROMPT.md
 * Development Phases) — do not pre-register routes for unbuilt pages.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.PLAYERS} element={<Players />} />
        <Route path={ROUTES.PLAYER_DETAILS} element={<PlayerDetails />} />
        <Route path={ROUTES.ACHIEVEMENTS} element={<Achievements />} />
        <Route path={ROUTES.STATISTICS} element={<Statistics />} />
        <Route path={ROUTES.OFFICIALS} element={<Officials />} />
        <Route path={ROUTES.MATCHES} element={<Matches />} />
        <Route path={ROUTES.TOURNAMENT_HISTORY} element={<TournamentHistory />} />
        <Route path={ROUTES.RESULTS} element={<Results />} />
        <Route path={ROUTES.LIVE} element={<Live />} />
        <Route path={ROUTES.VIDEOS} element={<Videos />} />
        <Route path={ROUTES.GALLERY} element={<Gallery />} />
        <Route path={ROUTES.GALLERY_ALBUM} element={<AlbumDetail />} />
        <Route
          path={ROUTES.GALLERY_MANAGE}
          element={
            <ProtectedRoute requireAdmin>
              <GalleryManage />
            </ProtectedRoute>
          }
        />
        <Route path={ROUTES.NEWS} element={<News />} />
        <Route path={ROUTES.NEWS_DETAILS} element={<NewsDetails />} />
        <Route path={ROUTES.EVENTS} element={<Events />} />
        <Route path={ROUTES.CONTACT} element={<Contact />} />
        <Route path={ROUTES.FAQ} element={<FAQ />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.SIGNUP} element={<Signup />} />

        <Route
          path={ROUTES.ADMIN}
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="news" element={<NewsManage />} />
          <Route path="events" element={<EventsManage />} />
          <Route path="players" element={<PlayersManage />} />
          <Route path="officials" element={<OfficialsManage />} />
          <Route path="matches" element={<MatchesManage />} />
          <Route path="achievements" element={<AchievementsManage />} />
          <Route path="sponsors" element={<SponsorsManage />} />
          <Route path="faq" element={<FAQManage />} />
          <Route path="messages" element={<ContactMessagesManage />} />
          <Route path="videos" element={<VideosManage />} />
          <Route path="hero-slides" element={<HeroSlidesManage />} />
          <Route path="squad-photos" element={<SquadPhotosManage />} />
          <Route path="roster-highlights" element={<RosterHighlightsManage />} />
          <Route path="settings" element={<SettingsManage />} />
        </Route>

        <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
      </Route>
    </Routes>
  );
}
