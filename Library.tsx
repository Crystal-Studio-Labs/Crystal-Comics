import React, { useEffect, useState } from 'react';
import { getLibraryData } from '../services/mockBackend';
import { Manga } from '../types';
import MangaCard from '../components/MangaCard';
import { BookOpen, Bookmark, History } from 'lucide-react';

const Library: React.FC = () => {
    const [bookmarks, setBookmarks] = useState<Manga[]>([]);
    const [history, setHistory] = useState<Manga[]>([]);
    const [activeTab, setActiveTab] = useState<'bookmarks' | 'history'>('bookmarks');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getLibraryData();
            setBookmarks(data.bookmarks);
            setHistory(data.history);
            setLoading(false);
        };
        fetchData();
    }, []);

    const content = activeTab === 'bookmarks' ? bookmarks : history;

    const tabs = [
        { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
        { id: 'history', label: 'Reading History', icon: History },
    ];

    return (
        <div className="pt-24 px-6 max-w-7xl mx-auto pb-32 animate-fade-in">
            <h1 className="text-3xl font-black text-white mb-8 flex items-center gap-2">
                <Bookmark className="text-purple-500" /> My Library
            </h1>

            {/* Tabs */}
            <div className="flex border-b border-white/10 mb-8">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all border-b-2 ${
                                isActive 
                                ? 'border-purple-500 text-white' 
                                : 'border-transparent text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading...</div>
            ) : content.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {content.map((manga, idx) => (
                        <MangaCard key={`${manga.id}-${idx}`} manga={manga} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-[#111] rounded-3xl border border-white/5">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                        {activeTab === 'bookmarks' ? <Bookmark size={24} /> : <History size={24} />}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Nothing here yet</h3>
                    <p className="text-gray-500">
                        {activeTab === 'bookmarks' 
                         ? "Start bookmarking your favorite series!" 
                         : "Start reading to track your history."}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Library;