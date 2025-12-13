import React, { useEffect, useState } from 'react';
import { getPopularManga, getLatestUpdates } from '../services/mockBackend';
import { Manga } from '../types';
import { Play, ChevronLeft, ChevronRight, Sparkles, Clock } from 'lucide-react';
import QuickSheet from '../components/QuickSheet';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    const [popular, setPopular] = useState<Manga[]>([]);
    const [latest, setLatest] = useState<Manga[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSeries, setSelectedSeries] = useState<Manga | null>(null);
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

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

    // Auto-rotate carousel
    useEffect(() => {
        if (popular.length === 0) return;
        const interval = setInterval(() => {
            setCurrentHeroIndex((prev) => (prev + 1) % Math.min(popular.length, 5));
        }, 6000);
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
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-purple-900 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
                <div className="text-purple-400 font-bold tracking-widest text-sm animate-pulse">CRYSTAL SCANS</div>
            </div>
        );
    }

    const heroManga = popular[currentHeroIndex];
    const carouselCount = Math.min(popular.length, 5);

    // Grid layout configuration based on mock data ordering for visual variety
    const getGridClasses = (index: number) => {
        if (index === 1) return 'md:row-span-1 md:col-span-1'; // square
        if (index === 2) return 'md:col-span-2'; // wide
        if (index === 3) return 'md:row-span-2'; // tall
        return 'md:row-span-1 md:col-span-1';
    };

    // Helper to safely split title
    const renderTitle = (title: string) => {
        const parts = title.split(':');
        if (parts.length > 1) {
            return (
                <>
                    {parts[0]}<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-300 to-white">
                        {parts.slice(1).join(':')}
                    </span>
                </>
            );
        }
        return title;
    };

    return (
        <div className="animate-fade-in">
             {/* Cinematic Hero Carousel */}
             <div className="relative h-[75vh] w-full overflow-hidden mask-gradient-bottom group">
                {/* Background Image Transition Group */}
                <div key={heroManga.id} className="absolute inset-0 animate-fade-in">
                    <img 
                       src={heroManga.heroUrl || heroManga.coverUrl} 
                       className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] scale-100 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/95 via-[#050505]/20 to-transparent" />
                </div>

                {/* Content */}
                <div key={`content-${heroManga.id}`} className="absolute bottom-0 left-0 p-8 md:p-16 w-full max-w-4xl z-10">
                   <div className="flex items-center gap-3 mb-4 animate-slide-up" style={{animationDelay: '100ms', animationFillMode: 'both'}}>
                      <span className="bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-[0_0_15px_rgba(147,51,234,0.5)]">
                        <Sparkles size={10} fill="currentColor" /> Featured
                      </span>
                      <span className="text-gray-300 text-sm font-medium tracking-wide">Chapter {heroManga.chapters[0]?.number} • Today</span>
                   </div>
                   
                   <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-[0.9] animate-slide-up drop-shadow-2xl" style={{animationDelay: '200ms', animationFillMode: 'both'}}>
                      {renderTitle(heroManga.title)}
                   </h1>
                   
                   <p className="text-gray-300 max-w-xl text-lg mb-8 line-clamp-2 hidden md:block animate-slide-up" style={{animationDelay: '300ms', animationFillMode: 'both'}}>
                      {heroManga.synopsis}
                   </p>
                   
                   <button 
                      onClick={() => setSelectedSeries(heroManga)}
                      className="bg-white text-black px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition shadow-[0_0_30px_rgba(255,255,255,0.2)] animate-slide-up" style={{animationDelay: '400ms', animationFillMode: 'both'}}
                   >
                      <Play fill="currentColor" /> Read Now
                   </button>
                </div>

                {/* Carousel Controls */}
                <button 
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-black/20 backdrop-blur-md border border-white/10 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 hover:scale-110 z-20"
                >
                    <ChevronLeft size={24} />
                </button>
                <button 
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-black/20 backdrop-blur-md border border-white/10 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 hover:scale-110 z-20"
                >
                    <ChevronRight size={24} />
                </button>

                {/* Indicators */}
                <div className="absolute bottom-8 right-8 flex gap-2 z-20">
                    {Array.from({ length: carouselCount }).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentHeroIndex(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentHeroIndex ? 'w-8 bg-purple-500 shadow-[0_0_10px_#a855f7]' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                        />
                    ))}
                </div>
             </div>

             {/* Trending Section */}
             <div className="max-w-7xl mx-auto px-6 mt-12 mb-16">
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                     <span className="w-1 h-6 bg-purple-500 rounded-full" />
                     Trending Now
                   </h2>
                   <Link to="/explore" className="text-xs font-bold text-purple-400 hover:text-white uppercase tracking-widest transition">View All</Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[250px]">
                   {popular.slice(1, 5).map((item, index) => (
                      <div 
                         key={item.id}
                         onClick={() => setSelectedSeries(item)}
                         className={`
                            relative group rounded-[32px] overflow-hidden cursor-pointer border border-white/5 bg-[#111]
                            ${getGridClasses(index + 1)}
                         `}
                      >
                         <img src={item.coverUrl} className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                         
                         <div className="absolute bottom-6 left-6 right-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <div className="flex gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                               {item.tags.slice(0, 2).map(t => <span key={t} className="text-[10px] bg-purple-500/80 backdrop-blur px-2 py-0.5 rounded text-white font-bold">{t}</span>)}
                            </div>
                            <h3 className="text-xl font-bold text-white leading-tight">{item.title}</h3>
                         </div>

                         <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white font-bold text-xs border border-white/10 group-hover:bg-purple-600 group-hover:border-purple-500 transition-colors">
                            #{item.rank || index + 2}
                         </div>
                      </div>
                   ))}
                </div>
             </div>

            {/* Latest Updates Section */}
            <div className="max-w-7xl mx-auto px-6 mb-16">
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                     <span className="w-1 h-6 bg-purple-500 rounded-full" />
                     Latest Updates
                   </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {latest.map(manga => (
                        <div key={manga.id} className="bg-[#111] border border-white/5 rounded-2xl p-4 flex gap-4 hover:bg-[#161616] transition group">
                            <Link to={`/manga/${manga.id}`} className="w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden relative">
                                <img src={manga.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </Link>
                            
                            <div className="flex-1 flex flex-col justify-center">
                                <Link to={`/manga/${manga.id}`} className="font-bold text-white text-lg mb-2 line-clamp-1 hover:text-purple-400 transition">{manga.title}</Link>
                                <div className="space-y-2">
                                    {manga.chapters.slice(0, 2).map(chapter => (
                                        <Link 
                                            key={chapter.id}
                                            to={`/read/${manga.id}/${chapter.id}`}
                                            className="flex justify-between items-center bg-black/40 px-3 py-2 rounded-lg hover:bg-purple-900/20 transition group/chapter"
                                        >
                                            <span className="text-xs font-bold text-gray-300 group-hover/chapter:text-purple-300">#{chapter.number}</span>
                                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                <Clock size={10} /> {chapter.releaseDate}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

             <QuickSheet series={selectedSeries} onClose={() => setSelectedSeries(null)} />
        </div>
    );
};

export default Home;