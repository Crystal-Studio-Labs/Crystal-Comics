import React, { useState, useEffect } from 'react';
import { Check, X, Shield, Crown, Sword, Star } from 'lucide-react';
import { User, SubscriptionTier } from '../types';
import { updateUserProfile } from '../services/mockBackend';

const Guild: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('crystal_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleUpgrade = async (tier: SubscriptionTier) => {
        setUpgradeLoading(tier);
        if (user) {
            // Update tier in local state
            const tempUser = { ...user, subscriptionTier: tier };
            
            // Run through backend service to sync roles and save
            const finalUser = await updateUserProfile(tempUser);
            
            setUser(finalUser);
        }
        setUpgradeLoading(null);
    };

    const currentTier = user?.subscriptionTier || 'Squire';

    return (
        <div className="min-h-screen bg-[#050505] pt-24 pb-32 px-4 animate-fade-in">
             <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 flex items-center justify-center gap-3">
                        <Crown className="text-yellow-500" size={40} fill="currentColor" />
                        Guild Membership
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Join the elite ranks of Crystal Scans. Unlock high-quality panels, early access to chapters, and exclusive profile customizations.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Tier 1: Squire */}
                    <div className="bg-[#111] border border-white/10 rounded-3xl p-8 flex flex-col relative group">
                        <h3 className="text-xl font-black text-gray-400 mb-2 flex items-center gap-2"><Sword size={20} /> Squire</h3>
                        <div className="text-3xl font-black text-white mb-6">Free</div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-sm text-gray-300"><Check size={16} className="text-gray-500" /> Standard Definition</li>
                            <li className="flex items-center gap-3 text-sm text-gray-300"><Check size={16} className="text-gray-500" /> Ad-supported Reading</li>
                            <li className="flex items-center gap-3 text-sm text-gray-300"><Check size={16} className="text-gray-500" /> Community Access</li>
                            <li className="flex items-center gap-3 text-sm text-gray-600"><X size={16} /> No Early Access</li>
                        </ul>
                        <button 
                            disabled={true}
                            className="w-full py-4 rounded-xl font-bold bg-white/5 text-gray-500 cursor-default"
                        >
                            {currentTier === 'Squire' ? 'Current Plan' : 'Basic Plan'}
                        </button>
                    </div>

                    {/* Tier 2: Knight */}
                    <div className="bg-[#111] border border-cyan-900/50 rounded-3xl p-8 flex flex-col relative group hover:border-cyan-500/50 transition-colors shadow-2xl shadow-cyan-900/10">
                            <div className="absolute top-0 right-0 p-20 bg-cyan-500/5 blur-[80px] rounded-full" />
                        <h3 className="text-xl font-black text-cyan-400 mb-2 flex items-center gap-2"><Shield size={20} /> Knight</h3>
                        <div className="text-3xl font-black text-white mb-6">$4.99 <span className="text-sm text-gray-500 font-medium">/ month</span></div>
                        <ul className="space-y-4 mb-8 flex-1 relative z-10">
                            <li className="flex items-center gap-3 text-sm text-white"><Check size={16} className="text-cyan-500" /> <span className="font-bold">Ad-Free Experience</span></li>
                            <li className="flex items-center gap-3 text-sm text-white"><Check size={16} className="text-cyan-500" /> High Definition (HD)</li>
                            <li className="flex items-center gap-3 text-sm text-white"><Check size={16} className="text-cyan-500" /> "Knight" Profile Badge</li>
                            <li className="flex items-center gap-3 text-sm text-white"><Check size={16} className="text-cyan-500" /> Instant Simulpub Updates</li>
                        </ul>
                        <button 
                            onClick={() => handleUpgrade('Knight')}
                            disabled={currentTier === 'Knight' || currentTier === 'Sovereign' || !!upgradeLoading}
                            className={`w-full py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                                currentTier === 'Knight' 
                                ? 'bg-cyan-900/20 text-cyan-500 border border-cyan-500/20 cursor-default' 
                                : 'bg-cyan-600 hover:bg-cyan-500 text-black shadow-lg shadow-cyan-900/20'
                            }`}
                        >
                            {upgradeLoading === 'Knight' ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : currentTier === 'Knight' ? (
                                <>Current Plan</>
                            ) : (
                                <>Upgrade to Knight</>
                            )}
                        </button>
                    </div>

                    {/* Tier 3: Sovereign */}
                    <div className="bg-[#0f0f0f] border border-yellow-600/50 rounded-3xl p-8 flex flex-col relative overflow-hidden group scale-105 shadow-2xl shadow-yellow-900/20">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-500 via-purple-500 to-yellow-500" />
                        <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/10 to-purple-900/10 opacity-50" />
                        
                        <div className="flex justify-between items-center mb-2 relative z-10">
                            <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 flex items-center gap-2"><Crown size={20} className="text-yellow-400" fill="currentColor" /> Sovereign</h3>
                            <span className="bg-yellow-500/20 text-yellow-300 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-yellow-500/30">Best Value</span>
                        </div>
                        
                        <div className="text-3xl font-black text-white mb-6 relative z-10">$49.99 <span className="text-sm text-gray-500 font-medium">/ year</span></div>
                        
                        <ul className="space-y-4 mb-8 flex-1 relative z-10">
                            <li className="flex items-center gap-3 text-sm text-white"><Check size={16} className="text-yellow-500" /> <span className="font-bold text-yellow-100">Everything in Knight</span></li>
                            <li className="flex items-center gap-3 text-sm text-white"><Check size={16} className="text-yellow-500" /> "Sovereign" Animated Frame</li>
                            <li className="flex items-center gap-3 text-sm text-white"><Check size={16} className="text-yellow-500" /> Exclusive Discord Role</li>
                            <li className="flex items-center gap-3 text-sm text-white"><Check size={16} className="text-yellow-500" /> 2 Months Free</li>
                        </ul>
                        
                        <button 
                            onClick={() => handleUpgrade('Sovereign')}
                            disabled={currentTier === 'Sovereign' || !!upgradeLoading}
                            className={`w-full py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 relative z-10 ${
                                currentTier === 'Sovereign' 
                                ? 'bg-yellow-900/20 text-yellow-500 border border-yellow-500/20 cursor-default' 
                                : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:brightness-110 shadow-lg shadow-yellow-900/30'
                            }`}
                        >
                            {upgradeLoading === 'Sovereign' ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : currentTier === 'Sovereign' ? (
                                <>Current Plan</>
                            ) : (
                                <><Crown size={18} fill="currentColor" /> Become Sovereign</>
                            )}
                        </button>
                    </div>
                </div>
             </div>
        </div>
    );
};

export default Guild;