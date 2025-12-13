import React from 'react';
import { Link } from 'react-router-dom';
import { Manga } from '../types';
import { Star } from 'lucide-react';

interface MangaCardProps {
    manga: Manga;
}

const MangaCard: React.FC<MangaCardProps> = ({ manga }) => {
    return (
        <Link to={`/manga/${manga.id}`} className="group relative flex flex-col">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-3">
                <img 
                    src={manga.coverUrl} 
                    alt={manga.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Overlay Info */}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-xs text-white font-medium border border-white/10">
                    {manga.type}
                </div>
                
                <div className="absolute bottom-2 right-2 bg-yellow-500/90 text-black px-1.5 py-0.5 rounded text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Star size={10} className="fill-black" />
                    {manga.rating}
                </div>
            </div>
            
            <h3 className="text-white font-semibold line-clamp-1 group-hover:text-crystal-accent transition-colors">
                {manga.title}
            </h3>
            <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                <span>{manga.chapters.length > 0 ? `Ch. ${manga.chapters[0].number}` : 'New'}</span>
                <span>{manga.chapters[0]?.releaseDate || 'Just now'}</span>
            </div>
        </Link>
    );
};

export default MangaCard;
