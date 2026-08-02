import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import CursorEffects from '@/components/CursorEffects/CursorEffects';
import './MainLayout.css';

export default function MainLayout() {
  return (
    <div className="main-layout">
      <CursorEffects />
      <Navbar />
      <main className="main-layout__content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
