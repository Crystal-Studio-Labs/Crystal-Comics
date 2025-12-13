import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getChapterImages, getMangaById, addToHistory } from '../services/mockBackend';
import { ChevronLeft, ChevronRight, Lock, Crown, ChevronDown, Facebook, Twitter, MessageCircle, Share2, Home } from 'lucide-react';
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
                // Fetch Manga Info if not already fetched
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
                
                // Refresh permissions check
                const userStr = localStorage.getItem('crystal_user');
                const currentUser = userStr ? JSON.parse(userStr) : null;
                const isPremiumUser = currentUser && (currentUser.subscriptionTier === 'Knight' || currentUser.subscriptionTier === 'Sovereign');

                if (chapter?.isPremium && !isPremiumUser) {
                    setLocked(true);
                    setLoading(false);
                    return;
                }

                setLocked(false);

                // Frontend fallback for quality check
                let requestQuality = quality;
                if (!isPremiumUser && quality === 'HD') {
                    requestQuality = 'SD';
                    setQuality('SD');
                }

                const imgs = await getChapterImages(mangaId, chapterId, requestQuality);
                setImages(imgs);
                setLoading(false);
            }
        };
        fetchContent();
        // Reset scroll when chapter changes
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
                <div className="relative z-10 bg-[#111] border border-white/10 rounded-3xl p-8 md:p-12 max-w-md w-full text-center shadow-2xl">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-900/30 rotate-3">
                        <Lock size={40} className="text-white" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Early Access</h2>
                    <p className="text-gray-400 mb-8 text-sm md:text-base">
                        This chapter is locked for Freemium users. Become a Knight or Sovereign to read it instantly in High Quality.
                    </p>
                    <button onClick={() => navigate('/guild')} className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg mb-4 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                        <Crown size={20} fill="currentColor" className="text-yellow-500" /> Upgrade Now
                    </button>
                    <button onClick={() => navigate(-1)} className="text-gray-500 text-sm hover:text-white transition">Go Back</button>
                </div>
            </div>
        );
    }

    if (!manga || !currentChapter) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Loading...</div>;

    const currentIndex = manga.chapters.findIndex(c => c.id === currentChapter.id);
    const hasPrev = currentIndex < manga.chapters.length - 1;
    const hasNext = currentIndex > 0;

    return (
        <div className="min-h-screen bg-[#050505] animate-fade-in flex flex-col items-center">
           {/* Control Panel Container - Centered and Width Constrained */}
           <div className="w-full max-w-[1000px] mx-auto px-5 md:px-8 bg-[#050505] z-40 pt-8 pb-8 animate-enter-up">
                
                <div className="text-center mb-8">
                    {/* Title */}
                    <h1 className="text-2xl md:text-4xl font-black text-white mb-3 tracking-tight leading-tight">
                        {manga.title} <span className="text-gray-400 font-medium block md:inline md:ml-2 text-lg md:text-3xl">{currentChapter.title}</span>
                    </h1>
                    
                    {/* Subtitle */}
                    <div className="text-gray-400 text-sm md:text-base mb-6 font-medium">
                        All chapters are in <Link to={`/manga/${manga.id}`} className="text-[#a855f7] font-bold hover:underline transition-colors">{manga.title}</Link>
                    </div>

                    {/* Social Buttons - Responsive Flex */}
                    <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8">
                        <button className="flex-1 min-w-[100px] md:flex-none bg-[#3b5998] hover:brightness-110 text-white px-4 py-2.5 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105">
                            <Facebook size={16} fill="currentColor" /> Facebook
                        </button>
                        <button className="flex-1 min-w-[100px] md:flex-none bg-[#1da1f2] hover:brightness-110 text-white px-4 py-2.5 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105">
                            <Twitter size={16} fill="currentColor" /> Twitter
                        </button>
                        <button className="flex-1 min-w-[100px] md:flex-none bg-[#25d366] hover:brightness-110 text-white px-4 py-2.5 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105">
                            <MessageCircle size={16} fill="currentColor" /> WhatsApp
                        </button>
                        <button className="flex-1 min-w-[100px] md:flex-none bg-[#bd081c] hover:brightness-110 text-white px-4 py-2.5 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105">
                            <Share2 size={16} fill="currentColor" /> Pinterest
                        </button>
                    </div>

                    {/* Breadcrumbs - Styled as a dark block */}
                    <div className="bg-[#1a1a1a] border border-white/5 rounded-lg py-4 px-4 mb-8 flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm font-medium">
                        <Link to="/" className="text-gray-400 hover:text-white transition-colors whitespace-nowrap">Crystal Scans</Link>
                        <span className="text-gray-600">›</span>
                        <Link to={`/manga/${manga.id}`} className="text-gray-400 hover:text-white transition-colors whitespace-nowrap">{manga.title}</Link>
                        <span className="text-gray-600">›</span>
                        <span className="text-gray-200 truncate max-w-[150px] md:max-w-none">{currentChapter.title}</span>
                    </div>

                    {/* Description - Justified reading experience */}
                    <p className="text-[#9ca3af] text-[15px] leading-relaxed mx-auto max-w-3xl text-center">
                        Read the latest manga <span className="font-bold text-gray-200">{manga.title} {currentChapter.title}</span> at <span className="font-bold text-gray-200">Crystal Scans</span>. 
                        Manga <span className="font-bold text-gray-200">{manga.title}</span> is always updated at <span className="font-bold text-gray-200">Crystal Scans</span>. 
                        Don't forget to read the other manga updates.
                    </p>
                </div>

                {/* Controls - Stacking on mobile */}
                <div className="max-w-3xl mx-auto space-y-4 mb-6">
                    {/* Chapter Select */}
                    <div className="relative group">
                        <select 
                            value={currentChapter.id}
                            onChange={handleChapterChange}
                            className="w-full bg-[#161616] text-gray-200 border border-[#333] rounded-xl py-4 px-6 appearance-none focus:outline-none focus:border-purple-500 text-sm font-bold hover:bg-[#202020] transition-colors cursor-pointer"
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
                            className="w-full bg-[#161616] text-gray-200 border border-[#333] rounded-xl py-4 px-6 appearance-none focus:outline-none focus:border-purple-500 text-sm font-bold hover:bg-[#202020] transition-colors cursor-pointer"
                        >
                            <option value="SD">Default Quality (SD)</option>
                            <option value="HD" disabled={!isPremium}>
                                High Quality (HD) {!isPremium ? '🔒' : ''}
                            </option>
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-purple-400 transition-colors" size={20} />
                    </div>
                </div>

                {/* Navigation Buttons - Full width on mobile */}
                <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    <button 
                        onClick={() => navigateChapter('prev')}
                        disabled={!hasPrev}
                        className={`w-full md:flex-1 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${!hasPrev ? 'opacity-50 cursor-not-allowed bg-gray-800 text-gray-500' : 'bg-[#9333ea] hover:bg-[#a855f7] text-white shadow-lg shadow-purple-900/20'}`}
                    >
                        <ChevronLeft size={20} /> Previous Chapter
                    </button>
                    <button 
                         onClick={() => navigateChapter('next')}
                         disabled={!hasNext}
                        className={`w-full md:flex-1 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${!hasNext ? 'opacity-50 cursor-not-allowed bg-gray-800 text-gray-500' : 'bg-[#161616] text-gray-200 hover:bg-[#202020] hover:text-white border border-[#333] hover:border-gray-500'}`}
                    >
                        Next Chapter <ChevronRight size={20} />
                    </button>
                </div>
           </div>

           {/* Reader Content - Max Width Constrained */}
           <div className="w-full max-w-[1000px] mx-auto bg-black shadow-2xl relative z-10 min-h-screen">
                 {loading ? (
                    <div className="h-96 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                    </div>
                 ) : images.map((src, idx) => (
                    <div key={idx} className="relative block">
                       <img src={src} className="w-full h-auto block" loading="lazy" />
                    </div>
                 ))}
                 
                 {/* Bottom Navigation */}
                 {!loading && (
                     <div className="flex flex-col items-center justify-center gap-6 bg-[#0a0a0a] border-t border-white/5 p-8 pb-16">
                        <p className="text-gray-500 text-sm font-medium">You've reached the end of the chapter</p>
                        <div className="flex flex-col md:flex-row gap-4 w-full max-w-md justify-center">
                           <button 
                                onClick={() => navigateChapter('prev')}
                                disabled={!hasPrev}
                                className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95 ${!hasPrev ? 'opacity-50 cursor-not-allowed bg-gray-800' : 'bg-[#1c1c1c] hover:bg-[#252525] text-white border border-[#333]'}`}
                           >
                              <ChevronLeft size={16} /> Previous
                           </button>
                           <button 
                                onClick={() => navigateChapter('next')}
                                disabled={!hasNext}
                                className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95 ${!hasNext ? 'opacity-50 cursor-not-allowed bg-gray-800' : 'bg-white hover:bg-gray-200 text-black'}`}
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