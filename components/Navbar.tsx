import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { getUser, claimDailyTokens } from '../services/mockBackend';
import { User } from '../types';
import { Search, Coins, Sparkles, Compass, Bookmark, Shield, Menu, X, Bell } from 'lucide-react';

const Navbar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [contentMode, setContentMode] = useState<'comics' | 'novels'>('comics');
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [claimedToast, setClaimedToast] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const u = await getUser();
            setUser(u);
        };
        fetchUserData();
        const handler = () => fetchUserData();
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, [location.pathname]);

    const handleClaimDaily = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const res = await claimDailyTokens();
        if (res.success) {
            const u = await getUser();
            setUser(u);
            setClaimedToast(true);
            setTimeout(() => setClaimedToast(false), 3000);
        } else {
            navigate('/guild');
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Browse', path: '/explore' },
        { name: 'Bookmarks', path: '/library' },
        { name: 'Guild VIP', path: '/guild' },
    ];

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-[#13111A]/95 backdrop-blur-md border-b border-[#24212B] transition-colors">
            <div className="max-w-[1360px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
                {/* Left: Brand Logo & Mode Toggle */}
                <div className="flex items-center gap-6">
                    <Logo size="sm" />

                    {/* AsuraScans Content Mode Switcher: Comics vs Novels */}
                    <div className="hidden sm:flex items-center bg-[#1C1924] border border-[#24212B] rounded-lg p-1 text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => setContentMode('comics')}
                            className={`px-3 py-1 rounded-md transition-all ${contentMode === 'comics' ? 'bg-[#913FE2] text-white shadow-[0_0_12px_rgba(145,63,226,0.5)]' : 'text-gray-400 hover:text-white'}`}
                        >
                            Comics
                        </button>
                        <button
                            type="button"
                            onClick={() => setContentMode('novels')}
                            className={`px-3 py-1 rounded-md transition-all ${contentMode === 'novels' ? 'bg-[#913FE2] text-white shadow-[0_0_12px_rgba(145,63,226,0.5)]' : 'text-gray-400 hover:text-white'}`}
                        >
                            Novels
                        </button>
                    </div>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                                    isActive(link.path)
                                        ? 'text-white bg-[#1C1924] border border-[#24212B]'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <a
                            href="https://discord.gg"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg text-sm font-semibold text-[#5865F2] hover:bg-[#5865F2]/10 transition-colors flex items-center gap-1"
                        >
                            Discord
                        </a>
                    </nav>
                </div>

                {/* Right: Search, Wallet Pill & Profile */}
                <div className="flex items-center gap-3">
                    {/* Search Bar */}
                    <form onSubmit={handleSearchSubmit} className="hidden md:flex relative items-center">
                        <Search size={15} className="absolute left-3 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search manhwa..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-[#1C1924] border border-[#24212B] focus:border-[#913FE2] text-xs text-white placeholder-gray-500 rounded-lg pl-9 pr-12 py-2 w-52 lg:w-64 focus:outline-none transition-all shadow-inner"
                        />
                        <span className="absolute right-2 text-[10px] text-gray-500 bg-[#24212B] px-1.5 py-0.5 rounded border border-white/5">
                            ⌘K
                        </span>
                    </form>

                    {/* Hunter Token Wallet Pill (AsuraScans-style) */}
                    {user && (
                        <div className="relative">
                            <button
                                onClick={handleClaimDaily}
                                title="Click to claim daily tokens or view wallet"
                                className="flex items-center gap-2 bg-[#1C1924] hover:bg-[#24212B] border border-[#24212B] hover:border-[#913FE2]/60 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-sm group"
                            >
                                <Coins size={15} className="text-amber-400 group-hover:rotate-12 transition-transform" />
                                <span>{user.tokens ?? 150}</span>
                                <span className="hidden xl:inline text-gray-400 font-normal">Tokens</span>
                                <span className="bg-[#913FE2] hover:bg-[#7c35c2] text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                                    +25
                                </span>
                            </button>

                            {claimedToast && (
                                <div className="absolute right-0 top-12 bg-[#913FE2] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl border border-white/20 whitespace-nowrap animate-bounce">
                                    🎉 +25 Daily Tokens Claimed!
                                </div>
                            )}
                        </div>
                    )}

                    {/* Profile Avatar / Rank Pill */}
                    {user ? (
                        <Link
                            to="/profile"
                            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-[#24212B]"
                        >
                            <div className="relative">
                                <img
                                    src={user.avatarUrl}
                                    alt={user.username}
                                    className="w-8 h-8 rounded-full object-cover border border-[#913FE2]/60 shadow-[0_0_10px_rgba(145,63,226,0.3)]"
                                />
                                <span className="absolute -bottom-1 -right-1 bg-[#913FE2] text-[9px] font-black text-white px-1 rounded-sm uppercase tracking-tighter">
                                    {user.rank ? user.rank.replace('-Rank', '') : 'E'}
                                </span>
                            </div>
                            <div className="hidden sm:flex flex-col text-left">
                                <span className="text-xs font-bold text-white leading-tight line-clamp-1 max-w-[90px]">
                                    {user.displayName || user.username}
                                </span>
                                <span className="text-[10px] text-gray-400 leading-tight">
                                    Lv. {user.level || 1}
                                </span>
                            </div>
                        </Link>
                    ) : (
                        <Link
                            to="/login"
                            className="bg-[#913FE2] hover:bg-[#7c35c2] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-[0_0_15px_rgba(145,63,226,0.4)]"
                        >
                            Login
                        </Link>
                    )}

                    {/* Mobile Hamburger Toggle */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-[#13111A] border-b border-[#24212B] px-4 py-4 space-y-3 animate-fade-in">
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search manhwa..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#1C1924] border border-[#24212B] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#913FE2]"
                        />
                    </form>

                    <div className="flex bg-[#1C1924] border border-[#24212B] rounded-lg p-1 text-xs font-semibold">
                        <button
                            onClick={() => setContentMode('comics')}
                            className={`flex-1 py-1.5 rounded-md ${contentMode === 'comics' ? 'bg-[#913FE2] text-white' : 'text-gray-400'}`}
                        >
                            Comics
                        </button>
                        <button
                            onClick={() => setContentMode('novels')}
                            className={`flex-1 py-1.5 rounded-md ${contentMode === 'novels' ? 'bg-[#913FE2] text-white' : 'text-gray-400'}`}
                        >
                            Novels
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`px-3 py-2 rounded-lg text-sm font-semibold text-center ${
                                    isActive(link.path)
                                        ? 'bg-[#913FE2] text-white'
                                        : 'bg-[#1C1924] text-gray-300 hover:text-white'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;