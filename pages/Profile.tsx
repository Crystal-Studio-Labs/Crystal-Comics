import React, { useEffect, useState } from 'react';
import { Sword, Shield, Brain, Sparkles, Crown, Zap, Settings, LogOut, Bell, Award, Layout, ChevronRight, Edit2, X, CreditCard, Check, RefreshCw, Mail, Lock, Unlock, HelpCircle, Moon, Sun, Code, LayoutDashboard } from 'lucide-react';
import { User, SubscriptionTier } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { syncDiscordStatus } from '../services/mockBackend';

const iconMap: Record<string, any> = {
    Sword, Shield, Brain, Sparkles, Award, Zap, Heart: Award, MessageSquare: Layout, Moon, Sun, Code
};

const AVATARS = [
    "https://placehold.co/400x400/222/FFF?text=SH",
    "https://placehold.co/400x400/3b82f6/FFF?text=Blue",
    "https://placehold.co/400x400/ef4444/FFF?text=Red",
    "https://placehold.co/400x400/10b981/FFF?text=Green",
    "https://placehold.co/400x400/8b5cf6/FFF?text=Mage",
    "https://placehold.co/400x400/f59e0b/FFF?text=Gold"
];

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'settings'>('overview');
    
    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editUsername, setEditUsername] = useState('');
    const [editAvatar, setEditAvatar] = useState('');
    const [syncing, setSyncing] = useState(false);
    const [syncEmail, setSyncEmail] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('crystal_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('crystal_user');
        setUser(null);
        navigate('/');
    };

    const handleEditClick = () => {
        if (user) {
            setEditUsername(user.username);
            setEditAvatar(user.avatarUrl);
            setIsEditing(true);
        }
    };

    const handleSaveProfile = () => {
        if (user) {
            const updatedUser = { ...user, username: editUsername, avatarUrl: editAvatar };
            setUser(updatedUser);
            localStorage.setItem('crystal_user', JSON.stringify(updatedUser));
            setIsEditing(false);
        }
    };

    const handleDiscordSync = async () => {
        if (!user) return;
        setSyncing(true);
        const updatedUser = await syncDiscordStatus(user);
        setUser(updatedUser);
        setSyncing(false);
    };

    if (loading) return <div className="text-center mt-32 text-gray-500">Checking credentials...</div>;

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <div className="w-24 h-24 bg-[#111] rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-xl">
                    <Shield size={40} className="text-gray-600" />
                </div>
                <h1 className="text-3xl font-black text-white mb-2">Guest Access</h1>
                <p className="text-gray-400 max-w-md mb-8">
                    Login to track your reading progress, earn XP, unlock achievements, and join the leaderboard.
                </p>
                <Link 
                    to="/login"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-purple-900/20"
                >
                    Login / Signup
                </Link>
            </div>
        );
    }

    // Dynamic styles based on Subscription Tier
    const getTierStyles = (tier: SubscriptionTier) => {
        switch (tier) {
            case 'Sovereign':
                return {
                    border: 'border-yellow-500',
                    avatarGlow: 'animate-pulse ring-4 ring-yellow-500/30',
                    badge: 'bg-gradient-to-r from-yellow-600 to-purple-600 text-white border-yellow-400/50',
                    nameColor: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-purple-200'
                };
            case 'Knight':
                return {
                    border: 'border-cyan-400',
                    avatarGlow: 'ring-2 ring-cyan-500/30',
                    badge: 'bg-cyan-900/40 text-cyan-300 border-cyan-500/30',
                    nameColor: 'text-white'
                };
            default: // Squire
                return {
                    border: 'border-[#1a1a1a]',
                    avatarGlow: '',
                    badge: 'bg-gray-800 text-gray-400 border-gray-700',
                    nameColor: 'text-white'
                };
        }
    };

    const tierStyles = getTierStyles(user.subscriptionTier);

    return (
        <div className="pt-24 px-4 md:px-8 pb-32 max-w-5xl mx-auto animate-fade-in relative">
          
          {/* Edit Modal */}
          {isEditing && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                  <div className="bg-[#161616] border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl animate-slide-up flex flex-col max-h-[90vh] overflow-hidden">
                      <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#1a1a1a]">
                          <h3 className="text-xl font-bold text-white flex items-center gap-2"><Settings size={20} /> Profile Settings</h3>
                          <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-white bg-black/50 p-2 rounded-full"><X size={18} /></button>
                      </div>
                      
                      <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-8">
                          
                          {/* Section 1: Identity */}
                          <div>
                              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Identity</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                      <label className="text-sm text-gray-400 mb-2 block">Username</label>
                                      <input 
                                        type="text" 
                                        value={editUsername}
                                        onChange={(e) => setEditUsername(e.target.value)}
                                        className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none"
                                      />
                                  </div>
                                  <div>
                                      <label className="text-sm text-gray-400 mb-2 block">Avatar Selection</label>
                                      <div className="flex gap-2 overflow-x-auto pb-2">
                                          {AVATARS.map((avatar, idx) => (
                                              <button 
                                                key={idx}
                                                onClick={() => setEditAvatar(avatar)}
                                                className={`flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 transition ${editAvatar === avatar ? 'border-purple-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                              >
                                                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                              </button>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          </div>

                          {/* Section 2: Sync & Connections */}
                          <div>
                              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Sync & Connections</h4>
                              <div className="space-y-3">
                                  <div className="flex items-center justify-between bg-black/30 p-4 rounded-xl border border-white/5">
                                      <div className="flex items-center gap-3">
                                          <div className="bg-[#5865F2]/20 p-2 rounded-lg text-[#5865F2]"><RefreshCw size={20} className={syncing ? 'animate-spin' : ''} /></div>
                                          <div>
                                              <div className="font-bold text-white flex items-center gap-2">
                                                  Discord Sync 
                                                  {user.discord.connected && <span className="text-[10px] bg-green-900/40 text-green-400 px-2 rounded border border-green-500/20">Active</span>}
                                              </div>
                                              <div className="text-xs text-gray-500">
                                                  {user.discord.connected ? `Connected as ${user.discord.username}` : 'Sync roles and reading status'}
                                              </div>
                                          </div>
                                      </div>
                                      <button 
                                        onClick={handleDiscordSync}
                                        disabled={syncing}
                                        className={`px-4 py-2 rounded-lg font-bold text-xs transition ${user.discord.connected ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-[#5865F2] hover:bg-[#4752c4] text-white'}`}
                                      >
                                          {syncing ? 'Syncing...' : (user.discord.connected ? 'Refresh' : 'Connect')}
                                      </button>
                                  </div>

                                  <div className="flex items-center justify-between bg-black/30 p-4 rounded-xl border border-white/5">
                                      <div className="flex items-center gap-3">
                                          <div className="bg-orange-500/20 p-2 rounded-lg text-orange-500"><Mail size={20} /></div>
                                          <div>
                                              <div className="font-bold text-white">Email Notifications</div>
                                              <div className="text-xs text-gray-500">Chapter updates & announcements</div>
                                          </div>
                                      </div>
                                      <div onClick={() => setSyncEmail(!syncEmail)} className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${syncEmail ? 'bg-purple-600' : 'bg-gray-700'}`}>
                                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${syncEmail ? 'left-7' : 'left-1'}`} />
                                      </div>
                                  </div>
                              </div>
                          </div>

                          {/* Section 3: Subscription Permissions */}
                          <div>
                              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Active Plan Permissions</h4>
                              <div className="bg-[#111] rounded-xl border border-white/10 overflow-hidden">
                                  <div className="bg-gradient-to-r from-gray-900 to-black p-4 flex justify-between items-center border-b border-white/5">
                                      <span className="font-bold text-white">Current Plan: <span className={`${tierStyles.badge} px-2 py-0.5 rounded ml-2`}>{user.subscriptionTier}</span></span>
                                      <Link to="/guild" className="text-xs text-purple-400 hover:text-purple-300 font-bold uppercase">Manage</Link>
                                  </div>
                                  <div className="p-4 grid grid-cols-2 gap-4">
                                      <div className="flex items-center gap-2 text-sm text-gray-300">
                                          {user.subscriptionTier !== 'Squire' ? <Unlock size={14} className="text-green-500" /> : <Lock size={14} className="text-red-500" />}
                                          <span>HD Quality</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-gray-300">
                                          {user.subscriptionTier !== 'Squire' ? <Unlock size={14} className="text-green-500" /> : <Lock size={14} className="text-red-500" />}
                                          <span>Ad-Free</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-gray-300">
                                          {user.subscriptionTier !== 'Squire' ? <Unlock size={14} className="text-green-500" /> : <Lock size={14} className="text-red-500" />}
                                          <span>Early Access</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-gray-300">
                                          {user.subscriptionTier === 'Sovereign' ? <Unlock size={14} className="text-green-500" /> : <Lock size={14} className="text-red-500" />}
                                          <span>Sovereign Frame</span>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="p-6 border-t border-white/5 bg-[#1a1a1a]">
                        <button 
                            onClick={handleSaveProfile}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-purple-900/20"
                        >
                            Save Changes
                        </button>
                      </div>
                  </div>
              </div>
          )}

          {/* Header Card */}
          <div className="relative overflow-hidden rounded-[40px] bg-[#111] border border-white/10 p-8 md:p-12 mb-8 group transition-all duration-500">
            {/* Background effects based on tier */}
            <div className={`absolute inset-0 bg-gradient-to-br opacity-20 transition-all duration-700 ${user.subscriptionTier === 'Sovereign' ? 'from-yellow-900 via-black to-purple-900' : 'from-blue-900/20 via-black to-gray-900/20'}`} />
            <div className={`absolute top-0 right-0 p-[20%] blur-[100px] rounded-full transition-all duration-700 ${user.subscriptionTier === 'Sovereign' ? 'bg-yellow-600/20' : 'bg-purple-600/10'}`} />
            
            <button 
                onClick={handleEditClick}
                className="absolute top-6 right-6 p-3 bg-black/40 backdrop-blur rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition z-20 border border-white/5"
                title="Edit Profile"
            >
                <Edit2 size={18} />
            </button>
            
            {/* Admin Badge */}
            {user.role === 'Admin' && (
                <div className="absolute top-6 left-6 px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg shadow-red-900/40 z-20 flex items-center gap-1">
                    <Shield size={10} fill="currentColor" /> Staff
                </div>
            )}

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
               {/* Avatar */}
               <div className="relative group/avatar">
                  <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 shadow-2xl overflow-hidden relative z-10 transition-colors duration-300 ${tierStyles.border}`}>
                     <img src={user.avatarUrl} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-3 -right-3 z-20 bg-black/80 backdrop-blur-md text-white font-black text-xs px-3 py-1 rounded-full border border-white/10 shadow-lg flex items-center gap-1">
                     LVL {user.level}
                  </div>
                  <div className={`absolute inset-0 rounded-full ${tierStyles.avatarGlow}`} />
               </div>

               {/* Info */}
               <div className="flex-1 text-center md:text-left space-y-4">
                  <div>
                    <div className="flex flex-col md:flex-row items-center gap-4 mb-2 justify-center md:justify-start">
                        <h1 className={`text-3xl md:text-5xl font-black tracking-tight ${tierStyles.nameColor}`}>
                            {user.username}
                        </h1>
                        
                        {/* Subscription Badge */}
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 border ${tierStyles.badge}`}>
                            {user.subscriptionTier === 'Sovereign' && <Crown size={14} fill="currentColor" />}
                            {user.subscriptionTier === 'Knight' && <Shield size={14} fill="currentColor" />}
                            {user.subscriptionTier === 'Squire' && <Sword size={14} />}
                            {user.subscriptionTier}
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium flex items-center justify-center md:justify-start gap-2">
                        Member since {user.joinDate}
                        <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                        <span className="text-purple-400">{user.rank} Hunter</span>
                    </p>
                  </div>
                  
                  {/* XP Progress */}
                  <div className="w-full max-w-md mx-auto md:mx-0">
                     <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                        <span>XP PROGRESS</span>
                        <span>{user.xp} / {user.maxXp}</span>
                     </div>
                     <div className="h-4 bg-gray-800 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <div 
                           className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)] relative"
                           style={{ width: `${(user.xp / user.maxXp) * 100}%` }}
                        >
                           <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 mb-8 overflow-x-auto no-scrollbar">
              {[
                  { id: 'overview', label: 'Overview', icon: Layout },
                  { id: 'achievements', label: 'Achievements', icon: Award },
                  { id: 'settings', label: 'Settings', icon: Settings },
              ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-8 py-4 font-bold transition-all border-b-2 whitespace-nowrap ${
                        activeTab === tab.id 
                        ? 'border-purple-500 text-white' 
                        : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                  >
                      <tab.icon size={18} /> {tab.label}
                  </button>
              ))}
              {user.role === 'Admin' && (
                  <Link to="/admin" className="flex items-center gap-2 px-8 py-4 font-bold transition-all border-b-2 border-transparent text-red-500 hover:text-red-400">
                      <LayoutDashboard size={18} /> Admin Panel
                  </Link>
              )}
          </div>

          {/* Tab Content */}
          <div className="animate-slide-up">
            {activeTab === 'overview' && (
                <div>
                     <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Zap className="text-yellow-400" /> Soul Stats
                     </h2>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {user.stats.map((stat, i) => {
                            const Icon = iconMap[stat.icon] || Sword;
                            return (
                                <div key={i} className="bg-[#161616] border border-white/5 rounded-3xl p-6 hover:bg-[#1a1a1a] transition-all hover:scale-[1.02] hover:border-white/20 group cursor-default">
                                <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg mb-4 group-hover:rotate-6 transition-transform`}>
                                    <Icon size={24} />
                                </div>
                                <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</div>
                                <div className={`text-3xl font-black ${stat.text} tabular-nums`}>{stat.value}</div>
                                </div>
                            );
                        })}
                     </div>
                </div>
            )}

            {activeTab === 'achievements' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.achievements.map((ach) => {
                        const Icon = iconMap[ach.icon] || Award;
                        const isUnlocked = !!ach.unlockedAt;
                        const isSecret = ach.isSecret && !isUnlocked;
                        
                        return (
                            <div key={ach.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${isUnlocked ? 'bg-[#161616] border-white/10' : 'bg-[#0a0a0a] border-white/5 opacity-60'}`}>
                                <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${isUnlocked ? 'bg-purple-900/20 text-purple-400' : 'bg-gray-800/20 text-gray-600'}`}>
                                    {isSecret ? <HelpCircle size={32} /> : <Icon size={32} strokeWidth={1.5} />}
                                </div>
                                <div>
                                    <h3 className={`font-bold text-lg ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                                        {isSecret ? '???' : ach.title}
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        {isSecret ? 'Keep reading to unlock this secret.' : ach.description}
                                    </p>
                                    {isUnlocked && <div className="text-[10px] uppercase font-bold text-purple-500 mt-1 tracking-wider">Unlocked {ach.unlockedAt}</div>}
                                    {ach.isSecret && isUnlocked && <div className="text-[10px] uppercase font-bold text-yellow-500 mt-1 tracking-wider animate-pulse">Secret Found!</div>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="max-w-xl mx-auto space-y-6">
                    <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
                        <div className="p-4 border-b border-white/5 font-bold text-gray-400 text-sm bg-black/20">PREFERENCES</div>
                        <div className="p-4 space-y-4">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Moon size={20} className="text-gray-400" />
                                    <span className="text-white">Dark Mode</span>
                                </div>
                                <div className="text-xs text-gray-500 font-bold uppercase">Always On</div>
                            </div>
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Bell size={20} className="text-gray-400" />
                                    <span className="text-white">Notifications</span>
                                </div>
                                <div className="w-10 h-6 bg-purple-600 rounded-full relative cursor-pointer">
                                     <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleLogout}
                        className="w-full py-4 rounded-xl border border-red-900/30 text-red-500 font-bold hover:bg-red-900/10 transition flex items-center justify-center gap-2"
                    >
                        <LogOut size={18} /> Log Out
                    </button>
                    
                    <div className="text-center text-xs text-gray-600">
                        Account ID: {user.id} • Version 1.0.5
                    </div>
                </div>
            )}
          </div>
        </div>
    );
};

export default Profile;