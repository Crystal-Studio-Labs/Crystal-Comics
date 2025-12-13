import React from 'react';
import { Link } from 'react-router-dom';
import { Manga } from '../types';
import { Star, Clock } from 'lucide-react';

interface HeroSliderProps {
    featured: Manga[];
}

const HeroSlider: React.FC<HeroSliderProps> = ({ featured }) => {
    // For simplicity, we just show the first item as a large hero
    const heroItem = featured[0];

    if (!heroItem) return null;

    return (
        <div className="relative w-full h-[500px] rounded-2xl overflow-hidden mb-12 group shadow-2xl shadow-black/50">
            {/* Background Image with blur */}
            <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${heroItem.coverUrl})` }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-crystal-900 via-crystal-900/80 to-transparent" />
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-2/3">
                <div className="flex gap-2 mb-4">
                    <span className="px-3 py-1 bg-crystal-accent/20 text-crystal-accent text-xs font-bold uppercase tracking-wider rounded border border-crystal-accent/20 backdrop-blur-md">
                        {heroItem.type}
                    </span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider rounded border border-purple-500/20 backdrop-blur-md">
                        {heroItem.status}
                    </span>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
                    {heroItem.title}
                </h1>
                
                <p className="text-gray-300 line-clamp-2 md:line-clamp-3 mb-6 text-lg max-w-2xl">
                    {heroItem.synopsis}
                </p>
                
                <div className="flex items-center gap-6 mb-8 text-sm text-gray-400">
                    <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-white font-bold">{heroItem.rating}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>Updated {heroItem.chapters[0]?.releaseDate}</span>
                    </div>
                    <div className="hidden sm:block">
                         By {heroItem.author}
                    </div>
                </div>
                
                <div className="flex gap-4">
                    <Link 
                        to={`/manga/${heroItem.id}`} 
                        className="px-8 py-3 bg-crystal-accent hover:bg-crystal-accentHover text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transform hover:-translate-y-1"
                    >
                        Read Now
                    </Link>
                    <button className="px-8 py-3 glass-panel hover:bg-white/10 text-white font-semibold rounded-lg transition-all">
                        Bookmark
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HeroSlider;
