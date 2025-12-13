import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
import { supabase } from './services/supabase';
import { MOCK_USER, updateUserProfile } from './services/mockBackend';
import { User } from './types';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Component to handle Auth State Changes
const AuthHandler = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!supabase) return;

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                // User just logged in via Discord. 
                // We need to map Supabase data to our App's User format
                // and save it to localStorage so the MockBackend continues to work.
                
                const discordIdentity = session.user.identities?.find(id => id.provider === 'discord');
                const discordData = discordIdentity?.identity_data;

                // Create a "Hybrid" user combining Real Auth data with our App structure
                const existingData = localStorage.getItem('crystal_user');
                const prevUser = existingData ? JSON.parse(existingData) : MOCK_USER;

                let newUser: User = {
                    ...prevUser, // Keep existing XP/Bookmarks if they exist locally
                    id: session.user.id,
                    username: discordData?.full_name || discordData?.name || session.user.email?.split('@')[0] || 'Hunter',
                    avatarUrl: discordData?.avatar_url || discordData?.picture || prevUser.avatarUrl,
                    email: session.user.email,
                    discriminator: '0000', 
                    discord: {
                        connected: true,
                        username: discordData?.name,
                        id: discordIdentity?.id,
                        roles: [] 
                    }
                };

                // Run the role calculator to assign default roles based on tier/stats
                newUser = await updateUserProfile(newUser);
                
                // Redirect user to Profile after login if they are on Login page or Home page
                // We check hash because HashRouter is used
                const hashPath = window.location.hash.replace('#', '');
                if (hashPath === '/login' || hashPath === '/' || hashPath === '') {
                    navigate('/profile');
                }
            } else if (event === 'SIGNED_OUT') {
                localStorage.removeItem('crystal_user');
                navigate('/login');
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

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
            <AuthHandler />
            
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