import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMangaById, toggleBookmark, getUser } from '../services/mockBackend';
import { Manga, User } from '../types';
import { Star, Calendar, User as UserIcon, BookOpen, Share2, Crown, Lock, Bookmark, Check } from 'lucide-react';
import Comments from '../components/Comments';

const MangaDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [manga, setManga] = useState<Manga | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [isBookmarked, setIsBookmarked] = useState(false);

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

    if (loading) return <div className="min-h-screen pt-32 text-center text-gray-500">Loading Data...</div>;
    if (!manga) return <div className="min-h-screen pt-32 text-center text-gray-500">Manga not found.</div>;

    const firstChapter = manga.chapters[manga.chapters.length - 1];
    const latestChapter = manga.chapters[0];
    const isPremiumUser = user && (user.subscriptionTier === 'Knight' || user.subscriptionTier === 'Sovereign');

    return (
        <div className="pb-20 animate-enter-up bg-[#050505]">
            {/* Header / Backdrop */}
            <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center blur-xl opacity-30 scale-110" style={{ backgroundImage: `url(${manga.heroUrl || manga.coverUrl})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 -mt-32 md:-mt-64">
                <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                    {/* Left Column: Cover & Actions */}
                    <div className="flex-shrink-0 w-full md:w-[300px] flex flex-col gap-6">
                        <div className="aspect-[3/4] w-48 mx-auto md:w-full rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 relative group">
                            <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" />
                            <div className="absolute top-4 left-4">
                                <div className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${manga.status === 'Ongoing' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                                    {manga.status}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={handleBookmark}
                                className={`py-3 rounded-xl font-bold transition border flex items-center justify-center gap-2 ${isBookmarked ? 'bg-purple-600 border-purple-500 text-white' : 'bg-[#222] hover:bg-[#333] text-white border-white/5'}`}
                            >
                                {isBookmarked ? <Check size={18} /> : <Bookmark size={18} />} 
                                {isBookmarked ? 'Saved' : 'Bookmark'}
                            </button>
                            <button className="bg-[#222] hover:bg-[#333] text-white py-3 rounded-xl font-bold transition border border-white/5 flex items-center justify-center gap-2">
                                <Share2 size={18} /> Share
                            </button>
                        </div>

                         <div className="bg-[#111] rounded-2xl p-6 border border-white/5 space-y-4">
                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                                <span className="text-gray-400">Rating</span>
                                <span className="flex items-center gap-1 font-bold text-yellow-500"><Star size={14} fill="currentColor" /> {manga.rating}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                                <span className="text-gray-400">Rank</span>
                                <span className="font-bold text-white">#{manga.rank || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                                <span className="text-gray-400">Views</span>
                                <span className="font-bold text-white">{manga.views}</span>
                            </div>
                             <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Type</span>
                                <span className="font-bold text-white">{manga.type}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Info & Chapters */}
                    <div className="flex-1 pt-0 md:pt-32">
                        {/* Title Section */}
                        <h1 className="text-3xl md:text-6xl font-black text-white mb-4 leading-tight text-center md:text-left">
                            {manga.title}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-gray-400 mb-8">
                            <div className="flex items-center gap-2">
                                <UserIcon size={16} className="text-purple-500" />
                                <span className="text-white font-medium">{manga.author}</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-purple-500" />
                                <span>{manga.year || 2024}</span>
                            </div>
                        </div>

                        {/* Genres */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8">
                            {manga.tags.map(tag => (
                                <span key={tag} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:text-white hover:border-purple-500 transition cursor-pointer">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Synopsis */}
                        <div className="mb-12">
                            <h3 className="text-lg font-bold text-white mb-3 border-l-4 border-purple-500 pl-3">Synopsis</h3>
                            <p className="text-gray-400 leading-relaxed text-base md:text-lg">
                                {manga.synopsis}
                            </p>
                        </div>

                        {/* CTA */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-16">
                             {firstChapter && (
                                <Link to={`/read/${manga.id}/${firstChapter.id}`} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(147,51,234,0.3)] transition hover:-translate-y-1">
                                    Read First
                                </Link>
                             )}
                             {latestChapter && (
                                <Link to={`/read/${manga.id}/${latestChapter.id}`} className="flex-1 bg-white hover:bg-gray-200 text-black px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition hover:-translate-y-1">
                                    Read Last
                                </Link>
                             )}
                        </div>

                        {/* Chapter List */}
                        <div className="mb-16">
                             <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <BookOpen className="text-purple-500" /> 
                                Chapter List 
                                <span className="text-sm font-normal text-gray-500 bg-[#1a1a1a] px-3 py-1 rounded-full">{manga.chapters.length} chapters</span>
                             </h3>
                             
                             <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                                <div className="max-h-[600px] overflow-y-auto no-scrollbar">
                                    {manga.chapters.map((chapter) => {
                                        const isLocked = chapter.isPremium && !isPremiumUser;
                                        return (
                                            <Link 
                                                key={chapter.id} 
                                                to={`/read/${manga.id}/${chapter.id}`}
                                                className={`flex items-center justify-between p-4 md:p-5 border-b border-white/5 transition group ${isLocked ? 'hover:bg-red-900/10' : 'hover:bg-white/5'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className={`font-mono text-xs md:text-sm transition ${isLocked ? 'text-red-500' : 'text-gray-500 group-hover:text-purple-400'}`}>
                                                        #{chapter.number}
                                                    </span>
                                                    <span className={`font-bold text-sm md:text-base transition flex items-center gap-2 ${isLocked ? 'text-gray-500' : 'text-white group-hover:text-purple-300'}`}>
                                                        {chapter.title}
                                                        {chapter.isPremium && (
                                                            isPremiumUser ? (
                                                                <Crown size={14} className="text-yellow-400 fill-yellow-400" />
                                                            ) : (
                                                                <Lock size={14} className="text-red-500" />
                                                            )
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 md:gap-3">
                                                    {chapter.isPremium && !isPremiumUser && (
                                                        <span className="hidden md:inline-block text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                                            Early Access
                                                        </span>
                                                    )}
                                                    <div className="text-[10px] md:text-xs text-gray-500 font-medium whitespace-nowrap">
                                                        {chapter.releaseDate}
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                             </div>
                        </div>

                        {/* Comments Section */}
                        <Comments mangaId={manga.id} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MangaDetail;