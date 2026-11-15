import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    getChapterPanelData, 
    getMangaById, 
    addToHistory, 
    unlockChapterWithTokens, 
    getStorageUser 
} from '../services/mockBackend';
import { 
    ChevronLeft, 
    ChevronRight, 
    Lock, 
    Crown, 
    ChevronDown, 
    Facebook, 
    Twitter, 
    MessageCircle, 
    Layers, 
    Coins, 
    Sparkles, 
    Bookmark, 
    BookmarkCheck,
    RotateCw,
    Keyboard,
    ShieldAlert
} from 'lucide-react';
import { User, Manga, Chapter, ChapterPanel } from '../types';
import Comments from '../components/Comments';

const Read: React.FC = () => {
    const { mangaId, chapterId } = useParams<{ mangaId: string, chapterId: string }>();
    const navigate = useNavigate();
    
    // Core 'rea' Reader Viewport & State Engine
    const [panels, setPanels] = useState<ChapterPanel[]>([]);
    const [loading, setLoading] = useState(true);
    const [locked, setLocked] = useState(false);
    const [unlocking, setUnlocking] = useState(false);
    const [unlockError, setUnlockError] = useState<string | null>(null);

    // Manga & Chapter State
    const [manga, setManga] = useState<Manga | null>(null);
    const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);

    // User & Token Wallet State
    const [user, setUser] = useState<User | null>(null);
    const isPremium = user && (user.subscriptionTier === 'Knight' || user.subscriptionTier === 'Sovereign');

    // Reader Mode & Quality
    const [quality, setQuality] = useState<'HD' | 'SD'>('SD');

    // Asura-style 'readingResume' Progress Tracking
    const [savedResumePanel, setSavedResumePanel] = useState<number | null>(null);
    const [currentVisiblePanel, setCurrentVisiblePanel] = useState<number>(1);
    const readerContainerRef = useRef<HTMLDivElement>(null);

    // Initial User Load & Reading Resume check
    useEffect(() => {
        const currentUser = getStorageUser();
        setUser(currentUser);
        if (currentUser.subscriptionTier === 'Knight' || currentUser.subscriptionTier === 'Sovereign') {
            setQuality('HD');
        }

        if (mangaId && chapterId) {
            const resumeKey = `crystal_reading_resume_${mangaId}_${chapterId}`;
            const savedPanel = localStorage.getItem(resumeKey);
            if (savedPanel && parseInt(savedPanel, 10) > 1) {
                setSavedResumePanel(parseInt(savedPanel, 10));
            }
        }
    }, [mangaId, chapterId]);

    // Fetch Content & Manage Permissions
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
                
                // Permissions check (Asura Hybrid Model: Subscription OR Token Unlock)
                const currentUser = getStorageUser();
                setUser(currentUser);
                const isPremiumUser = currentUser && (currentUser.subscriptionTier === 'Knight' || currentUser.subscriptionTier === 'Sovereign');
                const isUnlockedViaTokens = currentUser && currentUser.unlockedChapters && currentUser.unlockedChapters.includes(`${mangaId}:${chapterId}`);

                if (chapter?.isPremium && !isPremiumUser && !isUnlockedViaTokens) {
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

                // Fetch pre-computed Zero-CLS Chapter Panels
                const panelData = await getChapterPanelData(mangaId, chapterId, requestQuality);
                setPanels(panelData);
                setLoading(false);

                // Background Panel Preloader (Preloads first 4 panels into cache)
                if (panelData.length > 0) {
                    panelData.slice(0, 4).forEach(p => {
                        const img = new Image();
                        img.src = p.url;
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
        if (chapterId) window.scrollTo(0, 0);
    }, [mangaId, chapterId, quality]);

    // Asura-style Single-shot CDN Edge Bypass Retry Handler
    const handlePanelError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const img = e.currentTarget;
        if (!img.dataset.retried) {
            img.dataset.retried = 'true';
            const separator = img.src.includes('?') ? '&' : '?';
            img.src = `${img.src}${separator}r=1`;
        }
    }, []);

    // Track active visible panel and persist readingResume
    useEffect(() => {
        if (loading || panels.length === 0 || !mangaId || !chapterId) return;

        const handleScroll = () => {
            const panelElements = document.querySelectorAll<HTMLElement>('[data-page-index]');
            const viewportMiddle = window.innerHeight / 2;
            
            panelElements.forEach((el) => {
                const rect = el.getBoundingClientRect();
                if (rect.top <= viewportMiddle && rect.bottom >= viewportMiddle) {
                    const idx = parseInt(el.getAttribute('data-page-index') || '1', 10);
                    setCurrentVisiblePanel(idx);
                    localStorage.setItem(`crystal_reading_resume_${mangaId}_${chapterId}`, idx.toString());
                }
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, panels, mangaId, chapterId]);

    // Keyboard Shortcuts Navigation (Left, Right, J, K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if active in an input/textarea
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

            if (e.key === 'ArrowLeft') {
                navigateChapter('prev');
            } else if (e.key === 'ArrowRight') {
                navigateChapter('next');
            } else if (e.key === 'j' || e.key === 'J' || e.key === 'ArrowDown') {
                window.scrollBy({ top: 400, behavior: 'smooth' });
            } else if (e.key === 'k' || e.key === 'K' || e.key === 'ArrowUp') {
                window.scrollBy({ top: -400, behavior: 'smooth' });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    });

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

    // Unlock Chapter with Tokens (Asura Microtransaction Engine)
    const handleUnlockWithTokens = async () => {
        if (!mangaId || !chapterId) return;
        setUnlocking(true);
        setUnlockError(null);

        const res = await unlockChapterWithTokens(mangaId, chapterId, currentChapter?.tokenPrice || 50);
        if (res.success) {
            setUser(res.user);
            setLocked(false);
            // Refresh content
            const panelData = await getChapterPanelData(mangaId, chapterId, quality);
            setPanels(panelData);
        } else {
            setUnlockError(res.error || 'Failed to unlock chapter');
        }
        setUnlocking(false);
    };

    const scrollToResume = (panelIndex: number) => {
        const target = document.getElementById(`panel-${panelIndex}`);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            setSavedResumePanel(null);
        }
    };

    // LOCKED CHAPTER SCREEN (Asura Hybrid Model: Tokens or Subscription)
    if (locked) {
        return (
            <div className="min-h-[100dvh] bg-[#050505] flex items-center justify-center p-6 animate-enter-up relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0%,transparent_70%)]" />
                <div className="relative z-10 bg-[#0E0E15] border border-white/10 rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-2xl">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-900/30 rotate-3">
                        <Lock size={40} className="text-white" />
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Early Access Chapter</h2>
                    <p className="text-gray-400 mb-6 text-sm md:text-base leading-relaxed">
                        This chapter is in early access. Unlock it permanently using your <strong className="text-purple-400">Tokens</strong>, or join the Guild for unlimited HD reading.
                    </p>

                    {/* Token Wallet Balance Status */}
                    <div className="bg-[#13111A] border border-purple-500/20 rounded-2xl p-4 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400">
                                <Coins size={20} />
                            </div>
                            <div className="text-left">
                                <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Your Balance</div>
                                <div className="text-lg font-black text-white">{user?.tokens ?? 0} Tokens</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-purple-300 font-bold bg-purple-900/40 px-3 py-1 rounded-full border border-purple-500/30">
                                Cost: {currentChapter?.tokenPrice || 50} Tokens
                            </span>
                        </div>
                    </div>

                    {unlockError && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs py-2.5 px-4 rounded-xl mb-4 text-left flex items-center gap-2">
                            <ShieldAlert size={16} className="flex-shrink-0" /> {unlockError}
                        </div>
                    )}

                    {/* Option 1: Unlock with Tokens */}
                    <button 
                        onClick={handleUnlockWithTokens}
                        disabled={unlocking}
                        className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:brightness-110 text-white py-4 rounded-xl font-bold text-base mb-3 hover:scale-[1.01] active:scale-95 transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 disabled:opacity-50 cursor-pointer"
                    >
                        {unlocking ? (
                            <><RotateCw className="animate-spin" size={18} /> Unlocking Chapter...</>
                        ) : (
                            <><Coins size={18} /> Unlock with {currentChapter?.tokenPrice || 50} Tokens</>
                        )}
                    </button>

                    {/* Option 2: Subscription Upgrade */}
                    <button 
                        onClick={() => navigate('/guild')} 
                        className="w-full bg-[#181622] hover:bg-[#201d30] border border-white/10 text-gray-200 py-3.5 rounded-xl font-bold text-sm mb-4 hover:scale-[1.01] transition flex items-center justify-center gap-2"
                    >
                        <Crown size={18} fill="currentColor" className="text-yellow-400" /> Become a Guild Member ($4.99/mo)
                    </button>

                    <button onClick={() => navigate(-1)} className="text-gray-500 text-sm hover:text-white transition">Go Back</button>
                </div>
            </div>
        );
    }

    if (!manga || !currentChapter) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-bold">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    <span>Loading reader viewport...</span>
                </div>
            </div>
        );
    }

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
                        <button className="flex-1 min-w-[100px] md:flex-none bg-[#3b5998] hover:brightness-110 text-white px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105 cursor-pointer">
                            <Facebook size={16} fill="currentColor" /> Facebook
                        </button>
                        <button className="flex-1 min-w-[100px] md:flex-none bg-[#1da1f2] hover:brightness-110 text-white px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105 cursor-pointer">
                            <Twitter size={16} fill="currentColor" /> Twitter
                        </button>
                        <button className="flex-1 min-w-[100px] md:flex-none bg-[#25d366] hover:brightness-110 text-white px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105 cursor-pointer">
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
                <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                    <button 
                        onClick={() => navigateChapter('prev')}
                        disabled={!hasPrev}
                        className={`w-full md:flex-1 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${!hasPrev ? 'opacity-50 cursor-not-allowed bg-gray-900 text-gray-600' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/25 cursor-pointer'}`}
                    >
                        <ChevronLeft size={20} /> Previous Chapter
                    </button>
                    <button 
                         onClick={() => navigateChapter('next')}
                         disabled={!hasNext}
                        className={`w-full md:flex-1 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${!hasNext ? 'opacity-50 cursor-not-allowed bg-gray-900 text-gray-600' : 'bg-[#0E0E15] text-gray-200 hover:bg-[#13131f] hover:text-white border border-white/10 cursor-pointer'}`}
                    >
                        Next Chapter <ChevronRight size={20} />
                    </button>
                </div>

                {/* Keyboard Shortcuts Hint */}
                <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                    <Keyboard size={14} /> Tip: Use <kbd className="px-1.5 py-0.5 bg-[#181822] rounded border border-white/10 text-gray-300">←</kbd> and <kbd className="px-1.5 py-0.5 bg-[#181822] rounded border border-white/10 text-gray-300">→</kbd> to change chapters, <kbd className="px-1.5 py-0.5 bg-[#181822] rounded border border-white/10 text-gray-300">J</kbd>/<kbd className="px-1.5 py-0.5 bg-[#181822] rounded border border-white/10 text-gray-300">K</kbd> to scroll
                </div>
           </div>

           {/* CORE 'REA' SERIALIZED CHAPTER PANELS READER VIEWPORT (Zero-CLS Layout Engine) */}
           <div 
                ref={readerContainerRef}
                onContextMenu={(e) => e.preventDefault()}
                className="w-full max-w-[1000px] mx-auto bg-black shadow-2xl relative z-10 min-h-screen border-x border-white/5 select-none"
           >
                 {loading ? (
                    <div className="h-96 flex items-center justify-center flex-col gap-3">
                        <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                        <p className="text-gray-400 text-sm font-medium">Streaming serialized panels from Cloud CDN...</p>
                    </div>
                 ) : (
                    panels.map((panel, idx) => (
                        <div 
                            key={idx} 
                            id={`panel-${idx + 1}`} 
                            data-page={idx + 1}
                            className="relative block border-b border-black/40 group w-full bg-[#0a0a0f]"
                            style={{ aspectRatio: panel.aspectRatio || `${panel.width} / ${panel.height}` }}
                        >
                           {/* Panel Image with Asura-grade Async Decoding & Edge Error Bypass */}
                           <img 
                                src={panel.url} 
                                alt={`${manga.title} ${currentChapter.title} - Panel ${idx + 1}`} 
                                data-page-index={idx + 1}
                                decoding="async"
                                className="w-full h-auto block pointer-events-none" 
                                loading="lazy" 
                                onContextMenu={(e) => e.preventDefault()}
                                onDragStart={(e) => e.preventDefault()}
                                onError={handlePanelError}
                           />
                           
                           {/* Serialized Panel Badge Overlay */}
                           <div className="absolute bottom-3 right-4 bg-black/80 backdrop-blur-md text-gray-300 text-[11px] font-bold px-3 py-1 rounded-full border border-white/10 opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none">
                              Panel {idx + 1} of {panels.length}
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
                            <p className="text-gray-500 text-xs">All {panels.length} serialized panels rendered with Zero-CLS</p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 w-full max-w-md justify-center">
                           <button 
                                onClick={() => navigateChapter('prev')}
                                disabled={!hasPrev}
                                className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer ${!hasPrev ? 'opacity-50 cursor-not-allowed bg-gray-900 text-gray-600' : 'bg-[#13131f] hover:bg-[#1a1a29] text-white border border-white/10'}`}
                           >
                              <ChevronLeft size={16} /> Previous Chapter
                           </button>
                           <button 
                                onClick={() => navigateChapter('next')}
                                disabled={!hasNext}
                                className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer ${!hasNext ? 'opacity-50 cursor-not-allowed bg-gray-900 text-gray-600' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/30'}`}
                           >
                              Next Chapter <ChevronRight size={16} />
                           </button>
                        </div>
                     </div>
                 )}
           </div>

           {/* ASURA-STYLE READING RESUME FLOATING PILL */}
           {savedResumePanel && (
                <div className="fixed bottom-6 right-6 z-50 animate-bounce-slow">
                    <button 
                        onClick={() => scrollToResume(savedResumePanel)}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-3 rounded-full shadow-2xl shadow-purple-900/50 border border-purple-400/30 flex items-center gap-2 hover:scale-105 transition cursor-pointer"
                    >
                        <BookmarkCheck size={16} /> Resume from Panel {savedResumePanel}
                    </button>
                </div>
           )}

           {/* CHAPTER DISCUSSION & COMMUNITY ENGINE */}
           <div className="w-full max-w-[1000px] mx-auto px-4 md:px-8 pb-24">
                <Comments mangaId={manga.id} />
           </div>
        </div>
    );
};

export default Read;