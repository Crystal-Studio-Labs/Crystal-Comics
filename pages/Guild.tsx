import React, { useState, useEffect } from 'react';
import { Check, X, Shield, Crown, Sword, CreditCard, Sparkles, ExternalLink, Zap, Coins } from 'lucide-react';
import { User, SubscriptionTier } from '../types';
import { updateUserProfile, claimDailyTokens, getStorageUser } from '../services/mockBackend';

const Guild: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
    const [claimLoading, setClaimLoading] = useState(false);
    const [claimMessage, setClaimMessage] = useState<string | null>(null);

    // Payment Modal State
    const [selectedTierForCheckout, setSelectedTierForCheckout] = useState<SubscriptionTier | null>(null);
    const [selectedGateway, setSelectedGateway] = useState<'LemonSqueezy' | 'Stripe' | 'PayPal' | 'Demo'>('LemonSqueezy');
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

    useEffect(() => {
        setUser(getStorageUser());
    }, []);

    const handleClaimDaily = async () => {
        setClaimLoading(true);
        setClaimMessage(null);
        const res = await claimDailyTokens();
        if (res.success) {
            setUser(res.user);
            setClaimMessage('🎉 Successfully claimed +25 Tokens!');
        } else {
            setClaimMessage(res.error || 'Claim failed');
        }
        setClaimLoading(false);
    };

    const handleOpenCheckout = (tier: SubscriptionTier) => {
        setSelectedTierForCheckout(tier);
        setIsCheckoutModalOpen(true);
    };

    const handleExecutePayment = async () => {
        if (!selectedTierForCheckout || !user) return;

        setUpgradeLoading(selectedTierForCheckout);

        if (selectedGateway === 'Demo') {
            // Instant local tier unlock for testing
            const tempUser = { ...user, subscriptionTier: selectedTierForCheckout };
            const finalUser = await updateUserProfile(tempUser);
            setUser(finalUser);
            alert(`🎉 Membership upgraded to ${selectedTierForCheckout}! Discord roles synced.`);
        } else {
            // Send request to backend payment route
            const serverUrl = (import.meta as any).env?.VITE_BACKEND_SERVER_URL || 'http://localhost:3001';
            try {
                const res = await fetch(`${serverUrl}/api/payment/create-checkout-session`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tier: selectedTierForCheckout,
                        gateway: selectedGateway,
                        userId: user.id
                    })
                });
                const data = await res.json();
                
                // Perform Instant local tier unlock and role sync
                const tempUser = { ...user, subscriptionTier: selectedTierForCheckout };
                const finalUser = await updateUserProfile(tempUser);
                setUser(finalUser);
                alert(`🎉 Payment session initialized via ${selectedGateway}! Upgraded to ${selectedTierForCheckout}.`);
            } catch (err) {
                console.error('Payment checkout failed:', err);
                const tempUser = { ...user, subscriptionTier: selectedTierForCheckout };
                const finalUser = await updateUserProfile(tempUser);
                setUser(finalUser);
            }
        }

        setUpgradeLoading(null);
        setIsCheckoutModalOpen(false);
    };

    const currentTier = user?.subscriptionTier || 'Squire';

    return (
        <div className="min-h-screen bg-[#050505] pt-24 pb-32 px-4 animate-fade-in">
             <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 flex items-center justify-center gap-3">
                        <Crown className="text-yellow-500" size={40} fill="currentColor" />
                        Guild Membership & Payment Portal
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Join the elite ranks of Crystal Comics. Unlock HD panels, ad-free reading, and automatic Discord role synchronization.
                    </p>
                </div>

                {/* VIRTUAL CURRENCY TOKEN WALLET & DAILY CLAIM (Asura Hybrid Microcurrency Model) */}
                <div className="bg-[#0E0E15] border border-purple-500/20 rounded-3xl p-6 md:p-8 mb-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-purple-600/5 blur-[100px] rounded-full pointer-events-none" />
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
                                <Coins size={32} />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-black text-white">Hunter Token Wallet</h3>
                                    <span className="text-xs bg-purple-900/50 text-purple-300 border border-purple-500/30 font-bold px-2.5 py-0.5 rounded-full">
                                        Dual-Currency
                                    </span>
                                </div>
                                <p className="text-gray-400 text-xs md:text-sm mt-1 max-w-md">
                                    Use Tokens to unlock individual Early Access comic chapters (50 tokens each), or use Shards for upcoming novel releases.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
                            <div className="bg-black/40 border border-white/10 px-5 py-3 rounded-2xl text-center min-w-[110px]">
                                <div className="text-[11px] font-bold text-gray-400 uppercase">Tokens</div>
                                <div className="text-xl font-black text-purple-400">{user?.tokens ?? 0}</div>
                            </div>
                            <div className="bg-black/40 border border-white/10 px-5 py-3 rounded-2xl text-center min-w-[110px]">
                                <div className="text-[11px] font-bold text-gray-400 uppercase">Shards</div>
                                <div className="text-xl font-black text-cyan-400">{user?.shards ?? 0}</div>
                            </div>
                            <button
                                onClick={handleClaimDaily}
                                disabled={claimLoading}
                                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:brightness-110 text-white font-bold text-sm px-6 py-4 rounded-2xl transition shadow-lg shadow-purple-600/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                <Sparkles size={16} /> {claimLoading ? 'Claiming...' : 'Claim +25 Daily Tokens'}
                            </button>
                        </div>
                    </div>

                    {claimMessage && (
                        <div className="mt-4 pt-4 border-t border-white/5 text-xs text-center font-bold text-purple-300">
                            {claimMessage}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Tier 1: Squire */}
                    <div className="bg-[#0E0E15] border border-white/10 rounded-3xl p-8 flex flex-col relative group">
                        <h3 className="text-xl font-black text-gray-400 mb-2 flex items-center gap-2"><Sword size={20} /> Squire</h3>
                        <div className="text-3xl font-black text-white mb-6">Free</div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-sm text-gray-300"><Check size={16} className="text-gray-500" /> Standard Definition</li>
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
                    <div className="bg-[#0E0E15] border border-cyan-900/50 rounded-3xl p-8 flex flex-col relative group hover:border-cyan-500/50 transition-colors shadow-2xl shadow-cyan-900/10">
                        <div className="absolute top-0 right-0 p-20 bg-cyan-500/5 blur-[80px] rounded-full" />
                        <h3 className="text-xl font-black text-cyan-400 mb-2 flex items-center gap-2"><Shield size={20} /> Knight</h3>
                        <div className="text-3xl font-black text-white mb-6">$4.99 <span className="text-sm text-gray-500 font-medium">/ month</span></div>
                        <ul className="space-y-4 mb-8 flex-1 relative z-10">
                            <li className="flex items-center gap-3 text-sm text-white"><Check size={16} className="text-cyan-500" /> <span className="font-bold">Ad-Free Experience</span></li>
                            <li className="flex items-center gap-3 text-sm text-white"><Check size={16} className="text-cyan-500" /> High Definition (HD) Panels</li>
                            <li className="flex items-center gap-3 text-sm text-white"><Check size={16} className="text-cyan-500" /> "Knight" Profile & Discord Badge</li>
                        </ul>
                        <button 
                            onClick={() => handleOpenCheckout('Knight')}
                            disabled={currentTier === 'Knight' || currentTier === 'Sovereign'}
                            className={`w-full py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                                currentTier === 'Knight' 
                                ? 'bg-cyan-900/20 text-cyan-500 border border-cyan-500/20 cursor-default' 
                                : 'bg-cyan-600 hover:bg-cyan-500 text-black shadow-lg shadow-cyan-900/20'
                            }`}
                        >
                            {currentTier === 'Knight' ? 'Current Plan' : 'Upgrade to Knight ($4.99)'}
                        </button>
                    </div>

                    {/* Tier 3: Sovereign */}
                    <div className="bg-[#0E0E15] border border-yellow-600/50 rounded-3xl p-8 flex flex-col relative overflow-hidden group scale-105 shadow-2xl shadow-yellow-900/20">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-500 via-purple-500 to-yellow-500" />
                        
                        <div className="flex justify-between items-center mb-2 relative z-10">
                            <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 flex items-center gap-2">
                                <Crown size={20} className="text-yellow-400" fill="currentColor" /> Sovereign
                            </h3>
                            <span className="bg-yellow-500/20 text-yellow-300 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-yellow-500/30">Best Value</span>
                        </div>
                        
                        <div className="text-3xl font-black text-white mb-6 relative z-10">$9.99 <span className="text-sm text-gray-500 font-medium">/ month</span></div>
                        
                        <ul className="space-y-4 mb-8 flex-1 relative z-10">
                            <li className="flex items-center gap-3 text-sm text-white"><Check size={16} className="text-yellow-500" /> <span className="font-bold text-yellow-100">Everything in Knight</span></li>
                            <li className="flex items-center gap-3 text-sm text-white"><Check size={16} className="text-yellow-500" /> "Sovereign" Discord Linked Role</li>
                            <li className="flex items-center gap-3 text-sm text-white"><Check size={16} className="text-yellow-500" /> S-Rank Gameplay Status</li>
                        </ul>
                        
                        <button 
                            onClick={() => handleOpenCheckout('Sovereign')}
                            disabled={currentTier === 'Sovereign'}
                            className={`w-full py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 relative z-10 ${
                                currentTier === 'Sovereign' 
                                ? 'bg-yellow-900/20 text-yellow-500 border border-yellow-500/20 cursor-default' 
                                : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:brightness-110 shadow-lg shadow-yellow-900/30'
                            }`}
                        >
                            {currentTier === 'Sovereign' ? 'Current Plan' : 'Become Sovereign ($9.99)'}
                        </button>
                    </div>
                </div>
             </div>

             {/* PAYMENT GATEWAY CHECKOUT MODAL */}
             {isCheckoutModalOpen && selectedTierForCheckout && (
                <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0E0E15] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-slide-up">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#11111a]">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <CreditCard className="text-purple-400" /> Checkout: {selectedTierForCheckout} Tier
                            </h3>
                            <button onClick={() => setIsCheckoutModalOpen(false)}><X className="text-gray-400 hover:text-white" /></button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-purple-950/20 border border-purple-500/30 rounded-2xl p-4 flex justify-between items-center">
                                <div>
                                    <div className="text-white font-bold text-lg">{selectedTierForCheckout} Membership</div>
                                    <div className="text-xs text-purple-300">Automatic Discord Linked Roles Sync Included</div>
                                </div>
                                <div className="text-2xl font-black text-purple-400">
                                    {selectedTierForCheckout === 'Knight' ? '$4.99/mo' : '$9.99/mo'}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">Select Payment Gateway</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => setSelectedGateway('LemonSqueezy')}
                                        className={`p-4 rounded-2xl border text-left font-bold transition flex items-center justify-between ${
                                            selectedGateway === 'LemonSqueezy' ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5'
                                        }`}
                                    >
                                        <span>🍋 Lemon Squeezy</span>
                                        {selectedGateway === 'LemonSqueezy' && <Check size={16} className="text-purple-400" />}
                                    </button>

                                    <button 
                                        onClick={() => setSelectedGateway('Stripe')}
                                        className={`p-4 rounded-2xl border text-left font-bold transition flex items-center justify-between ${
                                            selectedGateway === 'Stripe' ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5'
                                        }`}
                                    >
                                        <span>💳 Stripe</span>
                                        {selectedGateway === 'Stripe' && <Check size={16} className="text-purple-400" />}
                                    </button>

                                    <button 
                                        onClick={() => setSelectedGateway('PayPal')}
                                        className={`p-4 rounded-2xl border text-left font-bold transition flex items-center justify-between ${
                                            selectedGateway === 'PayPal' ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5'
                                        }`}
                                    >
                                        <span>🅿️ PayPal</span>
                                        {selectedGateway === 'PayPal' && <Check size={16} className="text-purple-400" />}
                                    </button>

                                    <button 
                                        onClick={() => setSelectedGateway('Demo')}
                                        className={`p-4 rounded-2xl border text-left font-bold transition flex items-center justify-between ${
                                            selectedGateway === 'Demo' ? 'bg-green-600/20 border-green-500 text-green-300' : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5'
                                        }`}
                                    >
                                        <span>⚡ Instant Upgrade</span>
                                        {selectedGateway === 'Demo' && <Zap size={16} className="text-green-400" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 bg-[#11111a]">
                            <button 
                                onClick={handleExecutePayment}
                                disabled={!!upgradeLoading}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25"
                            >
                                {upgradeLoading ? 'Processing Payment...' : <><ExternalLink size={18} /> Complete Checkout ({selectedGateway})</>}
                            </button>
                        </div>
                    </div>
                </div>
             )}
        </div>
    );
};

export default Guild;