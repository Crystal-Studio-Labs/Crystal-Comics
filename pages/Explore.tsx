import React, { useEffect, useState } from 'react';
import { getAllManga } from '../services/mockBackend';
import { Manga } from '../types';
import MangaCard from '../components/MangaCard';
import { Search, Filter, Compass } from 'lucide-react';

const Explore: React.FC = () => {
    const [mangaList, setMangaList] = useState<Manga[]>([]);
    const [filteredList, setFilteredList] = useState<Manga[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('All');
    const [loading, setLoading] = useState(true);

    const genres = ['All', 'Action', 'Adventure', 'Fantasy', 'System', 'Martial Arts'];

    useEffect(() => {
        const fetchManga = async () => {
            const data = await getAllManga();
            setMangaList(data);
            setFilteredList(data);
            setLoading(false);
        };
        fetchManga();
    }, []);

    useEffect(() => {
        let result = mangaList;

        if (searchTerm) {
            result = result.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (selectedGenre !== 'All') {
            result = result.filter(m => m.tags.includes(selectedGenre));
        }

        setFilteredList(result);
    }, [searchTerm, selectedGenre, mangaList]);

    return (
        <div className="pt-24 px-4 md:px-6 max-w-7xl mx-auto pb-32 animate-fade-in">
            {/* Header Section: Stack on mobile, Row on Desktop */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-2">
                        <Compass className="text-purple-500" /> Explore
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Find your next adventure</p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                    <input 
                        type="text" 
                        placeholder="Search series..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#1C1924] border border-[#24212B] rounded-full py-3 pl-12 pr-4 text-white focus:border-[#913FE2] focus:outline-none transition-colors shadow-sm text-sm"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                </div>
            </div>

            {/* Filters */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 mb-8 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                {genres.map(genre => (
                    <button
                        key={genre}
                        onClick={() => setSelectedGenre(genre)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                            selectedGenre === genre 
                            ? 'bg-[#913FE2] text-white shadow-[0_0_15px_rgba(145,63,226,0.5)]' 
                            : 'bg-[#1C1924] text-gray-400 hover:text-white border border-[#24212B] hover:bg-[#24212B]'
                        }`}
                    >
                        {genre}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading library...</div>
            ) : filteredList.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {filteredList.map(manga => (
                        <MangaCard key={manga.id} manga={manga} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-500">
                    <p className="text-xl font-bold text-gray-400 mb-2">No results found</p>
                    <p>Try adjusting your search or filters</p>
                </div>
            )}
        </div>
    );
};

export default Explore;