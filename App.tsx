import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import FloatingDock from './components/FloatingDock';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Library from './pages/Library';
import Guild from './pages/Guild';
import MangaDetail from './pages/MangaDetail';
import Read from './pages/Read';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Logo from './components/Logo';
import Footer from './components/Footer';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent: React.FC = () => {
    const location = useLocation();
    // Hide dock and footer on reading page and login page
    const isReading = location.pathname.startsWith('/read');
    const isLogin = location.pathname === '/login';
    const hideNav = isReading || isLogin;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30 flex flex-col">
            <ScrollToTop />
            
            {/* Top Navigation Overlay (Logo) */}
            {!hideNav && (
                <div className="fixed top-0 left-0 p-6 z-40">
                    <Logo />
                </div>
            )}

            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/library" element={<Library />} />
                    <Route path="/guild" element={<Guild />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/manga/:id" element={<MangaDetail />} />
                    <Route path="/read/:mangaId/:chapterId" element={<Read />} />
                </Routes>
            </main>

            {!hideNav && <Footer />}
            {!hideNav && <FloatingDock />}
        </div>
    );
};

const App: React.FC = () => {
  return (
    <Router>
        <AppContent />
    </Router>
  );
};

export default App;