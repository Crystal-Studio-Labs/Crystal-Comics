import React, { useState } from 'react';
import { Manga } from '../types';
import { Sparkles, Bot, ArrowRight, Zap, RefreshCw } from 'lucide-react';

interface CrystalAIProps {
    manga?: Manga;
    allManga?: Manga[];
}

const CrystalAI: React.FC<CrystalAIProps> = ({ manga }) => {
    const [loading, setLoading] = useState(false);
    const [recommendation, setRecommendation] = useState<string | null>(null);

    const generateAiRecommendation = () => {
        setLoading(true);
        setTimeout(() => {
            if (manga) {
                setRecommendation(
                    `✨ Based on ${manga.title}'s tags (${manga.tags.join(', ')}), AI recommends checking out "Solo Leveling: Ragnarok" and "Omniscient Reader" for similar high-stakes action and system progression!`
                );
            } else {
                setRecommendation(
                    `✨ Crystal AI Analysis: Top trending genre this week is Action & Reincarnation. We recommend starting with "The Beginning After The End" for magical worldbuilding!`
                );
            }
            setLoading(false);
        }, 600);
    };

    return (
        <div className="bg-gradient-to-r from-purple-950/40 via-[#0E0E15] to-cyan-950/40 border border-purple-500/30 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl my-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 p-0.5 shadow-lg shadow-purple-500/30 flex-shrink-0">
                        <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
                            <Bot size={24} className="text-purple-400" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-lg font-black text-white">Crystal AI Assistant</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full uppercase tracking-wider">
                                Gemini Powered
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Personalized manhwa recommendations & genre insights</p>
                    </div>
                </div>

                <button 
                    onClick={generateAiRecommendation}
                    disabled={loading}
                    className="px-5 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:brightness-110 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-purple-900/30 flex-shrink-0"
                >
                    {loading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    {recommendation ? 'Refresh AI Insights' : 'Get AI Recommendation'}
                </button>
            </div>

            {recommendation && (
                <div className="mt-6 p-4 bg-black/60 border border-purple-500/20 rounded-2xl animate-fade-in text-sm text-purple-200 leading-relaxed font-medium">
                    {recommendation}
                </div>
            )}
        </div>
    );
};

export default CrystalAI;