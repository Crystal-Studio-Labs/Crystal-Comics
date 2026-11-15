import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMangaById, toggleBookmark, getUser } from '../services/mockBackend';
import { Manga, User } from '../types';
import { Star, Calendar, User as UserIcon, BookOpen, Share2, Crown, Lock, Bookmark, Check, Coins, Search } from 'lucide-react';
import Comments from '../components/Comments';

const MangaDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [manga, setManga] = useState<Manga | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [chapterFilter, setChapterFilter] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                const [mangaData, userData] = await Promise.all([
                    getMangaById(id),
                    getUser()
                ]);
                
                if (mangaData) setManga(mangaData);
                if (userData) {
                    setUser(userData);
                    setIsBookmarked(userData.bookmarks.includes(id));
                }
                
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleBookmark = async () => {
        if (!manga) return;
        const newState = await toggleBookmark(manga.id);
        setIsBookmarked(newState);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#13111A] text-gray-500">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-[#24212B] border-t-[#913FE2] rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-bold text-gray-400 tracking-wider">LOADING SERIES...</p>
                </div>
            </div>
        );
    }

    if (!manga) {
        return (
            <div className="min-h-screen pt-32 text-center text-gray-500 bg-[#13111A]">
                Manga not found.
            </div>
        );
    }

    const firstChapter = manga.chapters[manga.chapters.length - 1];
    const latestChapter = manga.chapters[0];
    const isPremiumUser = user && (user.subscriptionTier === 'Knight' || user.subscriptionTier === 'Sovereign');

    const filteredChapters = manga.chapters.filter((ch) => {
        if (!chapterFilter) return true;
        return (
            ch.number.toString().includes(chapterFilter) ||
            ch.title.toLowerCase().includes(chapterFilter.toLowerCase())
        );
    });

    return (
        <div className="pb-24 animate-fade-in bg-[#13111A] text-gray-200">
            {/* Header / Cinematic Backdrop */}
            <div className="relative h-[320px] md:h-[420px] w-full overflow-hidden border-b border-[#24212B]">
                <div 
                    className="absolute inset-0 bg-cover bg-center blur-2xl opacity-25 scale-110" 
                    style={{ backgroundImage: `url(${manga.heroUrl || manga.coverUrl})` }} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#13111A] via-[#13111A]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#13111A] via-[#13111A]/80 to-transparent" />
            </div>

            <div className="max-w-[1360px] mx-auto px-4 md:px-6 relative z-10 -mt-36 md:-mt-64">
                <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
                    
                    {/* Left Column: Cover & Information Card */}
                    <div className="flex-shrink-0 w-full md:w-[300px] flex flex-col gap-5">
                        <div className="aspect-[3/4] w-48 mx-auto md:w-full rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.7)] border border-[#24212B] relative group bg-[#1C1924]">
                            <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" />
                            <div className="absolute top-3 left-3">
                                <div className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider ${
                                    manga.status === 'Ongoing' ? 'bg-[#913FE2] text-white shadow-md' : 'bg-red-500 text-white'
                                }`}>
                                    {manga.status}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons: Bookmark & Share */}
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={handleBookmark}
                                className={`py-3 rounded-xl font-bold text-xs transition border flex items-center justify-center gap-2 ${
                                    isBookmarked 
                                        ? 'bg-[#913FE2] border-[#913FE2] text-white shadow-[0_0_15px_rgba(145,63,226,0.5)]' 
                                        : 'bg-[#1C1924] hover:bg-[#24212B] text-white border-[#24212B]'
                                }`}
                            >
                                {isBookmarked ? <Check size={16} /> : <Bookmark size={16} />} 
                                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                            </button>
                            <button 
                                onClick={() => navigator.clipboard?.writeText(window.location.href)}
                                className="bg-[#1C1924] hover:bg-[#24212B] text-white py-3 rounded-xl font-bold text-xs transition border border-[#24212B] flex items-center justify-center gap-2"
                            >
                                <Share2 size={16} /> Share
                            </button>
                        </div>

                        {/* AsuraScans Metadata Box */}
                        <div className="bg-[#1C1924] rounded-2xl p-5 border border-[#24212B] space-y-3.5 shadow-lg text-xs">
                            <div className="flex justify-between items-center border-b border-[#24212B] pb-2.5">
                                <span className="text-gray-400 font-semibold">Rating</span>
                                <span className="flex items-center gap-1 font-bold text-yellow-400">
                                    <Star size={13} fill="currentColor" /> {manga.rating} / 10
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-[#24212B] pb-2.5">
                                <span className="text-gray-400 font-semibold">Rank</span>
                                <span className="font-bold text-white">#{manga.rank || 1}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-[#24212B] pb-2.5">
                                <span className="text-gray-400 font-semibold">Total Views</span>
                                <span className="font-bold text-white">{manga.views}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-semibold">Format</span>
                                <span className="font-bold text-[#913FE2]">{manga.type}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Title, Synopsis, Chapters & Comments */}
                    <div className="flex-1 min-w-0 pt-0 md:pt-28">
                        {/* Title Header */}
                        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mb-3 leading-tight tracking-tight">
                            {manga.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-6">
                            <div className="flex items-center gap-1.5">
                                <UserIcon size={14} className="text-[#913FE2]" />
                                <span className="text-white font-semibold">{manga.author}</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1.5">
                                <Calendar size={14} className="text-[#913FE2]" />
                                <span>{manga.year || 2024}</span>
                            </div>
                        </div>

                        {/* Category Tags */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {manga.tags.map((tag) => (
                                <Link 
                                    key={tag} 
                                    to={`/explore?genre=${tag}`}
                                    className="px-3 py-1 rounded-md bg-[#1C1924] border border-[#24212B] text-xs font-semibold text-gray-300 hover:text-white hover:border-[#913FE2] hover:bg-[#913FE2]/10 transition-colors"
                                >
                                    {tag}
                                </Link>
                            ))}
                        </div>

                        {/* Synopsis */}
                        <div className="mb-8 bg-[#1C1924]/60 border border-[#24212B] rounded-xl p-5">
                            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-[#913FE2] rounded-full" /> Synopsis
                            </h3>
                            <p className="text-gray-300 leading-relaxed text-sm">
                                {manga.synopsis}
                            </p>
                        </div>

                        {/* Quick CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-10">
                            {firstChapter && (
                                <Link 
                                    to={`/read/${manga.id}/${firstChapter.id}`} 
                                    className="flex-1 bg-[#913FE2] hover:bg-[#7c35c2] text-white px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(145,63,226,0.4)] transition hover:-translate-y-0.5"
                                >
                                    Read First (Ch. {firstChapter.number})
                                </Link>
                            )}
                            {latestChapter && (
                                <Link 
                                    to={`/read/${manga.id}/${latestChapter.id}`} 
                                    className="flex-1 bg-[#1C1924] hover:bg-[#24212B] border border-[#24212B] hover:border-white/20 text-white px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition hover:-translate-y-0.5"
                                >
                                    Read Latest (Ch. {latestChapter.number})
                                </Link>
                            )}
                        </div>

                        {/* Chapter List with Search Filter */}
                        <div className="mb-14">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                                <h3 className="text-lg font-black text-white flex items-center gap-2.5">
                                    <BookOpen className="text-[#913FE2]" size={20} /> 
                                    Chapter List 
                                    <span className="text-xs font-semibold text-gray-400 bg-[#1C1924] border border-[#24212B] px-2.5 py-0.5 rounded-full">
                                        {manga.chapters.length} chapters
                                    </span>
                                </h3>

                                <div className="relative w-full sm:w-56">
                                    <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
                                    <input 
                                        type="text" 
                                        placeholder="Filter chapter (e.g. 147)"
                                        value={chapterFilter}
                                        onChange={(e) => setChapterFilter(e.target.value)}
                                        className="w-full bg-[#1C1924] border border-[#24212B] focus:border-[#913FE2] text-xs text-white placeholder-gray-500 rounded-lg pl-8 pr-3 py-2 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="bg-[#1C1924] border border-[#24212B] rounded-2xl overflow-hidden shadow-lg">
                                <div className="max-h-[520px] overflow-y-auto no-scrollbar divide-y divide-[#24212B]">
                                    {filteredChapters.map((chapter) => {
                                        const isLocked = chapter.isPremium && !isPremiumUser;
                                        return (
                                            <Link 
                                                key={chapter.id} 
                                                to={`/read/${manga.id}/${chapter.id}`}
                                                className={`flex items-center justify-between p-3.5 sm:p-4 transition-colors group ${
                                                    isLocked ? 'hover:bg-amber-500/5' : 'hover:bg-[#13111A]'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={`font-mono text-xs sm:text-sm font-bold transition ${
                                                        isLocked ? 'text-amber-500' : 'text-gray-400 group-hover:text-[#913FE2]'
                                                    }`}>
                                                        #{chapter.number}
                                                    </span>
                                                    <span className={`font-semibold text-xs sm:text-sm transition flex items-center gap-2 ${
                                                        isLocked ? 'text-gray-400' : 'text-white group-hover:text-[#913FE2]'
                                                    }`}>
                                                        {chapter.title}
                                                        {chapter.isPremium && (
                                                            isPremiumUser ? (
                                                                <Crown size={13} className="text-amber-400 fill-amber-400" />
                                                            ) : (
                                                                <Lock size={13} className="text-amber-400" />
                                                            )
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2.5">
                                                    {chapter.isPremium && !isPremiumUser && (
                                                        <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                                                            <Coins size={10} /> 50 Tokens
                                                        </span>
                                                    )}
                                                    <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">
                                                        {chapter.releaseDate || 'Today'}
                                                    </span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Interactive Chapter Discussion & Comments */}
                        <Comments mangaId={manga.id} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MangaDetail;