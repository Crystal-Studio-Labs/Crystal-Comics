import React from 'react';
import { Link } from 'react-router-dom';
import { Manga } from '../types';
import { Star } from 'lucide-react';

interface MangaCardProps {
    manga: Manga;
}

const MangaCard: React.FC<MangaCardProps> = ({ manga }) => {
    return (
        <Link to={`/manga/${manga.id}`} className="group relative flex flex-col bg-[#1C1924] border border-[#24212B] hover:border-[#913FE2]/60 rounded-xl overflow-hidden p-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-2 bg-black/40">
                <img 
                    src={manga.coverUrl} 
                    alt={manga.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Type Badge */}
                <div className="absolute top-1.5 left-1.5 bg-[#913FE2] px-2 py-0.5 rounded text-[10px] text-white font-black shadow-md uppercase tracking-wider">
                    {manga.type}
                </div>
                
                {/* Rating Badge */}
                <div className="absolute bottom-1.5 right-1.5 bg-black/75 backdrop-blur-sm text-yellow-400 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border border-white/10 shadow">
                    <Star size={10} fill="currentColor" />
                    {manga.rating}
                </div>
            </div>
            
            <div className="px-1 pb-1">
                <h3 className="text-white font-bold text-xs sm:text-sm line-clamp-1 group-hover:text-[#913FE2] transition-colors leading-tight">
                    {manga.title}
                </h3>
                <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
                    <span className="text-[#913FE2] font-semibold">
                        {manga.chapters.length > 0 ? `Ch. ${manga.chapters[0].number}` : 'Ch. 1'}
                    </span>
                    <span>{manga.chapters[0]?.releaseDate || 'Today'}</span>
                </div>
            </div>
        </Link>
    );
};

export default MangaCard;
