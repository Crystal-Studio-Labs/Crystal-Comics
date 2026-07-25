import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getChapterImages, getMangaById, addToHistory } from '../services/mockBackend';
import { ChevronLeft, ChevronRight, Lock, Crown, ChevronDown, Facebook, Twitter, MessageCircle, Share2, Eye, Layers } from 'lucide-react';
import { User, Manga, Chapter } from '../types';

const Read: React.FC = () => {
    const { mangaId, chapterId } = useParams<{ mangaId: string, chapterId: string }>();
    const navigate = useNavigate();
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [locked, setLocked] = useState(false);
    
    // Manga State
    const [manga, setManga] = useState<Manga | null>(null);
    const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);

    // User State
    const [user, setUser] = useState<User | null>(null);
    const isPremium = user && (user.subscriptionTier === 'Knight' || user.subscriptionTier === 'Sovereign');

    // Reader states
    const [quality, setQuality] = useState<'HD' | 'SD'>('SD');

    // Initial User Load
    useEffect(() => {
        const userStr = localStorage.getItem('crystal_user');
        if (userStr) {
            const u = JSON.parse(userStr);
            setUser(u);
            if (u.subscriptionTier === 'Knight' || u.subscriptionTier === 'Sovereign') {
                setQuality('HD');
            }
        }
    }, []);

    // Fetch Content & Track History
    useEffect(() => {
        const fetchContent = async () => {
            if (mangaId && chapterId) {
                setLoading(true);
                let currentManga = manga;
                if (!currentManga || currentManga.id !== mangaId) {
                    currentManga = await getMangaById(mangaId) || null;
                    setManga(currentManga);
                }

                if (!currentManga) {
                    setLoading(false);
                    return;
                }

                const chapter = currentManga.chapters.find(c => c.id === chapterId);
                setCurrentChapter(chapter || null);
                
                // Track History
                addToHistory(mangaId, chapterId);
                
                // Permissions check
                const userStr = localStorage.getItem('crystal_user');
                const currentUser = userStr ? JSON.parse(userStr) : null;
                const isPremiumUser = currentUser && (currentUser.subscriptionTier === 'Knight' || currentUser.subscriptionTier === 'Sovereign');

                if (chapter?.isPremium && !isPremiumUser) {
                    setLocked(true);
                    setLoading(false);
                    return;
                }

                setLocked(false);

                let requestQuality = quality;
                if (!isPremiumUser && quality === 'HD') {
                    requestQuality = 'SD';
                    setQuality('SD');
                }

                const imgs = await getChapterImages(mangaId, chapterId, requestQuality);
                setImages(imgs);
                setLoading(false);

                // Background Panel Preloader (Preloads next 3 panels into browser cache)
                if (imgs.length > 0) {
                    imgs.slice(0, 3).forEach(url => {
                        const img = new Image();
                        img.src = url;
                    });
                }

                // Award +50 XP for reading chapter
                if (currentUser) {
                    const updatedXp = (currentUser.xp || 0) + 50;
                    const newLevel = Math.floor(updatedXp / 1000) + 1;
                    const updatedUser = {
                        ...currentUser,
                        xp: updatedXp,
                        level: newLevel,
                        rank: newLevel >= 50 ? 'S-Rank' : currentUser.rank || 'E-Rank'
                    };
                    localStorage.setItem('crystal_user', JSON.stringify(updatedUser));
                }
            }
        };
        fetchContent();
        if(chapterId) window.scrollTo(0, 0);
    }, [mangaId, chapterId, quality]);

    const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (manga) {
            navigate(`/read/${manga.id}/${e.target.value}`);
        }
    };

    const handleQualityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newQuality = e.target.value as 'HD' | 'SD';
        if (newQuality === 'HD' && !isPremium) {
            return;
        }
        setQuality(newQuality);
    };

    const navigateChapter = (direction: 'next' | 'prev') => {
        if (!manga || !currentChapter) return;
        const currentIndex = manga.chapters.findIndex(c => c.id === currentChapter.id);
        
        if (direction === 'next' && currentIndex > 0) {
            navigate(`/read/${manga.id}/${manga.chapters[currentIndex - 1].id}`);
        } else if (direction === 'prev' && currentIndex < manga.chapters.length - 1) {
            navigate(`/read/${manga.id}/${manga.chapters[currentIndex + 1].id}`);
        }
    };

    if (locked) {
        return (
            <div className="min-h-[100dvh] bg-[#050505] flex items-center justify-center p-6 animate-enter-up relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://placehold.co/1920x1080/1a1a1a/222')] bg-cover opacity-20 blur-xl scale-110" />
                <div className="relative z-10 bg-[#0E0E15] border border-white/10 rounded-3xl p-8 md:p-12 max-w-md w-full text-center shadow-2xl">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-900/30 rotate-3">
                        <Lock size={40} className="text-white" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Early Access Premium Chapter</h2>
                    <p className="text-gray-400 mb-8 text-sm md:text-base">
                        This chapter is locked for Freemium users. Become a Knight or Sovereign to read it instantly in High Quality.
                    </p>
                    <button onClick={() => navigate('/guild')} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-bold text-lg mb-4 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30">
                        <Crown size={20} fill="currentColor" className="text-yellow-400" /> Upgrade Now
                    </button>
                    <button onClick={() => navigate(-1)} className="text-gray-500 text-sm hover:text-white transition">Go Back</button>
                </div>
            </div>
        );
    }

    if (!manga || !currentChapter) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-bold">Loading chapter...</div>;

    const currentIndex = manga.chapters.findIndex(c => c.id === currentChapter.id);
    const hasPrev = currentIndex < manga.chapters.length - 1;
    const hasNext = currentIndex > 0;

    return (
        <div className="min-h-screen bg-[#050505] animate-fade-in flex flex-col items-center">
           {/* Control Header Container */}
           <div className="w-full max-w-[1000px] mx-auto px-5 md:px-8 bg-[#050505] z-40 pt-8 pb-8 animate-enter-up">
                
                <div className="text-center mb-8">
                    {/* Title */}
                    <h1 className="text-2xl md:text-4xl font-black text-white mb-3 tracking-tight leading-tight">
                        {manga.title} <span className="text-purple-400 font-medium block md:inline md:ml-2 text-lg md:text-3xl">{currentChapter.title}</span>
                    </h1>
                    
                    {/* Subtitle */}
                    <div className="text-gray-400 text-sm md:text-base mb-6 font-medium">
                        All chapters are available in <Link to={`/manga/${manga.id}`} className="text-purple-400 font-bold hover:underline transition-colors">{manga.title}</Link>
                    </div>

                    {/* Social Buttons */}
                    <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8">
                        <button className="flex-1 min-w-[100px] md:flex-none bg-[#3b5998] hover:brightness-110 text-white px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105">
                            <Facebook size={16} fill="currentColor" /> Facebook
                        </button>
                        <button className="flex-1 min-w-[100px] md:flex-none bg-[#1da1f2] hover:brightness-110 text-white px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105">
                            <Twitter size={16} fill="currentColor" /> Twitter
                        </button>
                        <button className="flex-1 min-w-[100px] md:flex-none bg-[#25d366] hover:brightness-110 text-white px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105">
                            <MessageCircle size={16} fill="currentColor" /> WhatsApp
                        </button>
                    </div>

                    {/* Breadcrumbs */}
                    <div className="bg-[#0E0E15] border border-white/10 rounded-xl py-3.5 px-4 mb-8 flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm font-medium text-gray-400">
                        <Link to="/" className="hover:text-white transition-colors">Crystal Comics</Link>
                        <span className="text-gray-600">›</span>
                        <Link to={`/manga/${manga.id}`} className="hover:text-white transition-colors">{manga.title}</Link>
                        <span className="text-gray-600">›</span>
                        <span className="text-purple-300 font-bold">{currentChapter.title}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="max-w-3xl mx-auto space-y-4 mb-6">
                    {/* Chapter Select */}
                    <div className="relative group">
                        <select 
                            value={currentChapter.id}
                            onChange={handleChapterChange}
                            className="w-full bg-[#0E0E15] text-gray-200 border border-white/10 rounded-xl py-4 px-6 appearance-none focus:outline-none focus:border-purple-500 text-sm font-bold hover:bg-[#13131f] transition-colors cursor-pointer"
                        >
                            {manga.chapters.map(ch => (
                                <option key={ch.id} value={ch.id}>
                                    {ch.title} {ch.isPremium ? '(Premium)' : ''}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-purple-400 transition-colors" size={20} />
                    </div>

                    {/* Quality Select */}
                    <div className="relative group">
                        <select 
                            value={quality}
                            onChange={handleQualityChange}
                            className="w-full bg-[#0E0E15] text-gray-200 border border-white/10 rounded-xl py-4 px-6 appearance-none focus:outline-none focus:border-purple-500 text-sm font-bold hover:bg-[#13131f] transition-colors cursor-pointer"
                        >
                            <option value="SD">Standard Quality (SD)</option>
                            <option value="HD" disabled={!isPremium}>
                                Ultra HD Quality (HD) {!isPremium ? '🔒 (Knight/Sovereign Only)' : ''}
                            </option>
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-purple-400 transition-colors" size={20} />
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    <button 
                        onClick={() => navigateChapter('prev')}
                        disabled={!hasPrev}
                        className={`w-full md:flex-1 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${!hasPrev ? 'opacity-50 cursor-not-allowed bg-gray-900 text-gray-600' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/25'}`}
                    >
                        <ChevronLeft size={20} /> Previous Chapter
                    </button>
                    <button 
                         onClick={() => navigateChapter('next')}
                         disabled={!hasNext}
                        className={`w-full md:flex-1 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${!hasNext ? 'opacity-50 cursor-not-allowed bg-gray-900 text-gray-600' : 'bg-[#0E0E15] text-gray-200 hover:bg-[#13131f] hover:text-white border border-white/10'}`}
                    >
                        Next Chapter <ChevronRight size={20} />
                    </button>
                </div>
           </div>

           {/* SERIALIZED CHAPTER PANELS READER */}
           <div className="w-full max-w-[1000px] mx-auto bg-black shadow-2xl relative z-10 min-h-screen border-x border-white/5">
                 {loading ? (
                    <div className="h-96 flex items-center justify-center flex-col gap-3">
                        <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                        <p className="text-gray-400 text-sm font-medium">Loading serialized chapter panels...</p>
                    </div>
                 ) : (
                    images.map((src, idx) => (
                        <div key={idx} id={`panel-${idx + 1}`} className="relative block border-b border-black/40 group">
                           {/* Panel Image */}
                           <img 
                                src={src} 
                                alt={`${manga.title} ${currentChapter.title} - Panel ${idx + 1}`} 
                                className="w-full h-auto block" 
                                loading="lazy" 
                           />
                           {/* Discrete Serialized Panel Badge Overlay */}
                           <div className="absolute bottom-3 right-4 bg-black/80 backdrop-blur-md text-gray-300 text-[11px] font-bold px-3 py-1 rounded-full border border-white/10 opacity-70 group-hover:opacity-100 transition-opacity">
                              Panel {idx + 1} of {images.length}
                           </div>
                        </div>
                    ))
                 )}
                 
                 {/* Bottom Chapter Completion Bar */}
                 {!loading && (
                     <div className="flex flex-col items-center justify-center gap-6 bg-[#0E0E15] border-t border-white/10 p-8 pb-16">
                        <div className="text-center">
                            <p className="text-purple-400 text-base font-bold mb-1 flex items-center justify-center gap-2">
                                <Layers size={18} /> Completed {currentChapter.title}
                            </p>
                            <p className="text-gray-500 text-xs">All {images.length} serialized panels loaded from Cloud CDN</p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 w-full max-w-md justify-center">
                           <button 
                                onClick={() => navigateChapter('prev')}
                                disabled={!hasPrev}
                                className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95 ${!hasPrev ? 'opacity-50 cursor-not-allowed bg-gray-900 text-gray-600' : 'bg-[#13131f] hover:bg-[#1a1a29] text-white border border-white/10'}`}
                           >
                              <ChevronLeft size={16} /> Previous Chapter
                           </button>
                           <button 
                                onClick={() => navigateChapter('next')}
                                disabled={!hasNext}
                                className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95 ${!hasNext ? 'opacity-50 cursor-not-allowed bg-gray-900 text-gray-600' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/30'}`}
                           >
                              Next Chapter <ChevronRight size={16} />
                           </button>
                        </div>
                     </div>
                 )}
           </div>
        </div>
    );
};

export default Read;