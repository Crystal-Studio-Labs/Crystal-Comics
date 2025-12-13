import React from 'react';
import { X, TrendingUp, Heart, Play, Share2 } from 'lucide-react';
import { Manga } from '../types';
import { Link } from 'react-router-dom';

interface QuickSheetProps {
    series: Manga | null;
    onClose: () => void;
}

const QuickSheet: React.FC<QuickSheetProps> = ({ series, onClose }) => {
   if (!series) return null;

   const latestChapterId = series.chapters && series.chapters.length > 0 ? series.chapters[0].id : 'c1';

   return (
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
         <div className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose} />
         
         <div className="relative w-full max-w-2xl bg-[#121212] sm:rounded-3xl rounded-t-[40px] border border-white/10 overflow-hidden pointer-events-auto animate-slide-up shadow-2xl">
            {/* Header Image */}
            <div className="h-56 relative">
               <img src={series.heroUrl || series.coverUrl} className="w-full h-full object-cover opacity-60" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
               <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-white/20 transition">
                  <X size={20} />
               </button>
            </div>

            <div className="px-8 pb-8 -mt-20 relative z-10">
               {/* Tags */}
               <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                     <TrendingUp size={12} /> #1 Trending
                  </span>
                  {series.tags.map(tag => (
                     <span key={tag} className="bg-white/10 backdrop-blur text-gray-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/5">
                        {tag}
                     </span>
                  ))}
               </div>

               <h2 className="text-4xl font-black text-white mb-2 leading-none">{series.title}</h2>
               
               <div className="flex items-center gap-4 text-sm font-medium text-gray-400 mb-6">
                  {series.match && (
                      <span className="text-green-400 flex items-center gap-1"><Heart size={14} fill="currentColor" /> {series.match}% Match</span>
                  )}
                  <span>{series.year || 2024}</span>
                  <span>{series.status}</span>
               </div>

               <p className="text-gray-300 text-sm leading-relaxed mb-8 line-clamp-3">
                  {series.synopsis}
               </p>

               <div className="flex gap-3">
                  <Link 
                    to={`/read/${series.id}/${latestChapterId}`}
                    className="flex-1 bg-white text-black h-14 rounded-2xl font-black text-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                     <Play fill="currentColor" size={20} /> READ NOW
                  </Link>
                  <button className="w-14 h-14 bg-[#222] rounded-2xl flex items-center justify-center text-white hover:bg-[#333] transition border border-white/5">
                     <Share2 size={20} />
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
};

export default QuickSheet;
