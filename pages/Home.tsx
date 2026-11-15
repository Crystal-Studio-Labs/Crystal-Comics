import React, { useEffect, useState } from 'react';
import { getPopularManga, getLatestUpdates } from '../services/mockBackend';
import { Manga } from '../types';
import { Play, ChevronLeft, ChevronRight, Sparkles, Clock, Star, Flame, Eye, Lock, Coins, TrendingUp, MessageSquare, ArrowRight } from 'lucide-react';
import QuickSheet from '../components/QuickSheet';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    const [popular, setPopular] = useState<Manga[]>([]);
    const [latest, setLatest] = useState<Manga[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSeries, setSelectedSeries] = useState<Manga | null>(null);
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
    const [popularTab, setPopularTab] = useState<'today' | 'weekly' | 'all'>('today');

    useEffect(() => {
        const fetchData = async () => {
            const [popData, latestData] = await Promise.all([
                getPopularManga(),
                getLatestUpdates()
            ]);
            setPopular(popData);
            setLatest(latestData);
            setLoading(false);
        };
        fetchData();
    }, []);

    // Auto-rotate hero carousel
    useEffect(() => {
        if (popular.length === 0) return;
        const interval = setInterval(() => {
            setCurrentHeroIndex((prev) => (prev + 1) % Math.min(popular.length, 5));
        }, 7000);
        return () => clearInterval(interval);
    }, [popular]);

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (popular.length === 0) return;
        const max = Math.min(popular.length, 5);
        setCurrentHeroIndex((prev) => (prev - 1 + max) % max);
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (popular.length === 0) return;
        const max = Math.min(popular.length, 5);
        setCurrentHeroIndex((prev) => (prev + 1) % max);
    };

    if (loading || popular.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#13111A] gap-4">
                <div className="relative w-14 h-14">
                    <div className="absolute inset-0 border-4 border-[#24212B] rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-[#913FE2] rounded-full animate-spin"></div>
                </div>
                <div className="text-[#913FE2] font-black tracking-widest text-xs animate-pulse">
                    LOADING ASURA-ENGINE...
                </div>
            </div>
        );
    }

    const heroManga = popular[currentHeroIndex];
    const carouselCount = Math.min(popular.length, 5);

    // Popular ranking filtered/sorted by tab
    const sortedPopular = [...popular].sort((a, b) => {
        if (popularTab === 'today') return (b.match || 90) - (a.match || 90);
        if (popularTab === 'weekly') return (b.rating || 9) - (a.rating || 9);
        return (b.rank || 1) - (a.rank || 1);
    });

    return (
        <div className="min-h-screen bg-[#13111A] text-gray-200 pb-20 animate-fade-in">
            {/* 1. CINEMATIC HERO SLIDER (AsuraScans-Style Featured Banner) */}
            <section className="relative h-[65vh] min-h-[460px] max-h-[620px] w-full overflow-hidden border-b border-[#24212B] group">
                <div key={heroManga.id} className="absolute inset-0 animate-fade-in">
                    <img 
                        src={heroManga.heroUrl || heroManga.coverUrl} 
                        alt={heroManga.title}
                        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-[15s] scale-100 group-hover:scale-105" 
                    />
                    {/* Multi-stage gradient mask */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#13111A] via-[#13111A]/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#13111A] via-[#13111A]/70 to-transparent" />
                </div>

                {/* Hero Information */}
                <div className="relative z-10 max-w-[1360px] mx-auto px-4 md:px-8 h-full flex flex-col justify-end pb-12">
                    <div className="max-w-2xl space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-[#913FE2] text-white text-[11px] font-black px-3 py-1 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-[0_0_15px_rgba(145,63,226,0.6)]">
                                <Sparkles size={11} fill="currentColor" /> Featured Series
                            </span>
                            <span className="bg-[#1C1924] border border-[#24212B] text-amber-400 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                                <Star size={12} fill="currentColor" /> {heroManga.rating}
                            </span>
                            <span className="text-xs text-gray-400 font-semibold">
                                {heroManga.type} • {heroManga.status}
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-xl line-clamp-2">
                            {heroManga.title}
                        </h1>

                        <p className="text-gray-300 text-sm md:text-base line-clamp-2 leading-relaxed drop-shadow">
                            {heroManga.synopsis}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            {heroManga.chapters.length > 0 && (
                                <Link 
                                    to={`/read/${heroManga.id}/${heroManga.chapters[0].id}`}
                                    className="bg-[#913FE2] hover:bg-[#7c35c2] text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(145,63,226,0.4)] transition-all hover:scale-105 active:scale-95"
                                >
                                    <Play size={16} fill="currentColor" /> Read Chapter {heroManga.chapters[0].number}
                                </Link>
                            )}
                            <button
                                onClick={() => setSelectedSeries(heroManga)}
                                className="bg-[#1C1924] hover:bg-[#24212B] border border-[#24212B] hover:border-white/20 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all"
                            >
                                Quick Details
                            </button>
                        </div>
                    </div>
                </div>

                {/* Hero Arrows */}
                <button 
                    onClick={handlePrev}
                    aria-label="Previous slide"
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-[#913FE2] hover:border-[#913FE2] z-20 cursor-pointer"
                >
                    <ChevronLeft size={20} />
                </button>
                <button 
                    onClick={handleNext}
                    aria-label="Next slide"
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-[#913FE2] hover:border-[#913FE2] z-20 cursor-pointer"
                >
                    <ChevronRight size={20} />
                </button>

                {/* Slide Indicators */}
                <div className="absolute bottom-5 right-8 flex gap-2 z-20">
                    {Array.from({ length: carouselCount }).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentHeroIndex(idx)}
                            aria-label={`Slide ${idx + 1}`}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentHeroIndex ? 'w-7 bg-[#913FE2] shadow-[0_0_8px_#913FE2]' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                        />
                    ))}
                </div>
            </section>

            {/* 2. TRENDING TODAY HORIZONTAL CAROUSEL (AsuraScans-Style Strip) */}
            <div className="max-w-[1360px] mx-auto px-4 mt-8 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-[#FF4500] rounded-full" />
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <Flame size={20} className="text-[#FF4500] fill-[#FF4500]" /> Trending Today
                        </h2>
                    </div>
                    <Link to="/explore" className="text-xs font-bold text-[#913FE2] hover:text-white uppercase tracking-wider flex items-center gap-1">
                        View All <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {popular.slice(0, 6).map((item, index) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedSeries(item)}
                            className="group relative bg-[#1C1924] border border-[#24212B] hover:border-[#913FE2]/60 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="aspect-[3/4] w-full overflow-hidden relative">
                                <img 
                                    src={item.coverUrl} 
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1924] via-transparent to-transparent opacity-80" />
                                
                                {/* Rank Pill */}
                                <div className={`absolute top-2 left-2 w-6 h-6 rounded-md flex items-center justify-center text-xs font-black shadow-md ${
                                    index === 0 ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black' :
                                    index === 1 ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black' :
                                    index === 2 ? 'bg-gradient-to-r from-[#913FE2] to-pink-500 text-white' :
                                    'bg-black/70 text-gray-300 border border-white/10'
                                }`}>
                                    #{index + 1}
                                </div>

                                {/* Rating */}
                                <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-yellow-400 flex items-center gap-1 border border-white/10">
                                    <Star size={10} fill="currentColor" /> {item.rating}
                                </div>
                            </div>

                            <div className="p-2.5">
                                <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-[#913FE2] transition-colors">
                                    {item.title}
                                </h3>
                                <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                                    <span>{item.type}</span>
                                    <span className="text-[#913FE2] font-semibold">
                                        Ch. {item.chapters[0]?.number || 1}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. MAIN TWO-COLUMN CONTENT GRID (Latest Updates Left + Popular Sidebar Right) */}
            <div className="max-w-[1360px] mx-auto px-4 mt-8">
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    
                    {/* LEFT COLUMN (Latest Updates Grid - AsuraScans Architecture) */}
                    <div className="w-full lg:flex-1 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[#24212B]">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-[#913FE2] rounded-full" />
                                <h2 className="text-xl font-black text-white flex items-center gap-2">
                                    Latest Updates
                                </h2>
                            </div>
                            <span className="text-xs text-gray-400 font-semibold">
                                Realtime Sync • Cloudflare Edge
                            </span>
                        </div>

                        {/* AsuraScans Card Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {latest.map((manga) => (
                                <div 
                                    key={manga.id} 
                                    className="bg-[#1C1924] border border-[#24212B] hover:border-[#913FE2]/60 rounded-xl p-3 flex gap-3 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)] group"
                                >
                                    {/* Cover Image Thumbnail */}
                                    <Link 
                                        to={`/manga/${manga.id}`} 
                                        className="w-24 sm:w-28 aspect-[3/4] rounded-lg overflow-hidden relative flex-shrink-0 bg-black/40"
                                    >
                                        <img 
                                            src={manga.coverUrl} 
                                            alt={manga.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                            loading="lazy"
                                        />
                                        <span className="absolute top-1.5 left-1.5 bg-[#913FE2] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                                            {manga.type.toUpperCase()}
                                        </span>
                                    </Link>

                                    {/* Series Details & Chapter Stack */}
                                    <div className="flex-1 flex flex-col justify-between min-w-0">
                                        <div>
                                            <Link 
                                                to={`/manga/${manga.id}`} 
                                                className="font-bold text-white text-sm sm:text-base line-clamp-1 group-hover:text-[#913FE2] transition-colors leading-snug"
                                            >
                                                {manga.title}
                                            </Link>
                                            <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                                                <span className="flex items-center gap-1 text-yellow-400 font-bold">
                                                    <Star size={11} fill="currentColor" /> {manga.rating}
                                                </span>
                                                <span>•</span>
                                                <span className="line-clamp-1">{manga.tags[0] || 'Action'}</span>
                                            </div>
                                        </div>

                                        {/* Chapter Rows (AsuraScans-Style Quick Access) */}
                                        <div className="space-y-1.5 mt-2">
                                            {manga.chapters.slice(0, 2).map((chapter) => (
                                                <Link 
                                                    key={chapter.id}
                                                    to={`/read/${manga.id}/${chapter.id}`}
                                                    className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-[#13111A] hover:bg-[#913FE2]/20 border border-white/5 hover:border-[#913FE2]/40 transition-colors group/ch text-xs"
                                                >
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <span className="font-semibold text-gray-200 group-hover/ch:text-[#913FE2] truncate">
                                                            Chapter {chapter.number}
                                                        </span>
                                                        {chapter.isPremium && (
                                                            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                                                <Coins size={9} /> 50
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-gray-500 flex items-center gap-1 flex-shrink-0">
                                                        <Clock size={10} /> {chapter.releaseDate || 'Today'}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN (Popular Leaderboard & Community Sidebar) */}
                    <aside className="w-full lg:w-[350px] flex-shrink-0 space-y-6">
                        
                        {/* 1. POPULAR TODAY / WEEKLY RANKINGS (Asura Signature Sidebar) */}
                        <div className="bg-[#1C1924] border border-[#24212B] rounded-xl p-4 shadow-lg">
                            <div className="flex items-center justify-between pb-3 border-b border-[#24212B] mb-3">
                                <h3 className="text-base font-black text-white flex items-center gap-2">
                                    <TrendingUp size={18} className="text-[#913FE2]" /> Popular Series
                                </h3>
                                {/* Filter Tabs */}
                                <div className="flex bg-[#13111A] border border-[#24212B] rounded-lg p-0.5 text-[10px] font-bold">
                                    <button 
                                        onClick={() => setPopularTab('today')}
                                        className={`px-2 py-1 rounded transition-colors ${popularTab === 'today' ? 'bg-[#913FE2] text-white' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Today
                                    </button>
                                    <button 
                                        onClick={() => setPopularTab('weekly')}
                                        className={`px-2 py-1 rounded transition-colors ${popularTab === 'weekly' ? 'bg-[#913FE2] text-white' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Weekly
                                    </button>
                                    <button 
                                        onClick={() => setPopularTab('all')}
                                        className={`px-2 py-1 rounded transition-colors ${popularTab === 'all' ? 'bg-[#913FE2] text-white' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        All Time
                                    </button>
                                </div>
                            </div>

                            {/* Ranked List Items (Top 7) */}
                            <div className="space-y-2.5">
                                {sortedPopular.slice(0, 7).map((item, idx) => (
                                    <Link 
                                        key={item.id}
                                        to={`/manga/${item.id}`}
                                        className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-white/5 transition-colors group"
                                    >
                                        {/* Rank Number */}
                                        <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-black flex-shrink-0 ${
                                            idx === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-black shadow' :
                                            idx === 1 ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-black shadow' :
                                            idx === 2 ? 'bg-gradient-to-br from-[#913FE2] to-pink-500 text-white shadow' :
                                            'bg-[#13111A] text-gray-500 border border-[#24212B]'
                                        }`}>
                                            {idx + 1}
                                        </span>

                                        {/* Thumbnail */}
                                        <img 
                                            src={item.coverUrl} 
                                            alt={item.title} 
                                            className="w-10 h-14 rounded object-cover flex-shrink-0 bg-black/40" 
                                        />

                                        {/* Metadata */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-[#913FE2] transition-colors">
                                                {item.title}
                                            </h4>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                                                <span className="text-[#913FE2] font-semibold">
                                                    Ch. {item.chapters[0]?.number || 1}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-0.5 text-yellow-400">
                                                    <Star size={9} fill="currentColor" /> {item.rating}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                                                <Eye size={10} /> {item.views}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* 2. ASURA-STYLE DISCORD GUILD RECRUITMENT CARD */}
                        <div className="bg-gradient-to-br from-[#5865F2]/20 via-[#1C1924] to-[#1C1924] border border-[#5865F2]/40 rounded-xl p-5 shadow-lg relative overflow-hidden">
                            <div className="relative z-10 space-y-3">
                                <div className="flex items-center gap-2 text-[#5865F2] font-black text-sm">
                                    <MessageSquare size={18} /> Hunter Guild Discord
                                </div>
                                <h4 className="text-white font-black text-base leading-tight">
                                    Join 450,000+ Hunters on Discord!
                                </h4>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Instant raw chapter notifications, Discord Linked Roles sync, VIP bot commands, and daily token giveaways.
                                </p>
                                <a 
                                    href="https://discord.gg" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 w-full bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold py-2.5 rounded-lg shadow-md transition-colors"
                                >
                                    Join Discord Server
                                </a>
                            </div>
                        </div>

                        {/* 3. POPULAR GENRES / TAGS */}
                        <div className="bg-[#1C1924] border border-[#24212B] rounded-xl p-4">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">
                                Popular Categories
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                                {['Action', 'Fantasy', 'Reincarnation', 'System', 'Martial Arts', 'Tower', 'Dungeon', 'Comedy', 'Adventure', 'Magic'].map(tag => (
                                    <Link 
                                        key={tag}
                                        to={`/explore?genre=${tag}`}
                                        className="text-[11px] bg-[#13111A] hover:bg-[#913FE2] text-gray-300 hover:text-white border border-[#24212B] hover:border-[#913FE2] px-2.5 py-1 rounded-md transition-colors font-semibold"
                                    >
                                        {tag}
                                    </Link>
                                ))}
                            </div>
                        </div>

                    </aside>
                </div>
            </div>

            {/* Quick Preview Sheet */}
            <QuickSheet series={selectedSeries} onClose={() => setSelectedSeries(null)} />
        </div>
    );
};

export default Home;