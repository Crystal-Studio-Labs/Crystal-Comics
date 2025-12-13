import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { MessageCircle, ArrowRight, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { getUser } from '../services/mockBackend';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDiscordLogin = async () => {
        setLoading(true);
        setError(null);

        // Check if Supabase keys are present
        if (!isSupabaseConfigured() || !supabase) {
             // FALLBACK: If user hasn't set up Supabase keys yet, use the Mock Login
             // This ensures the site still "works" for the reviewer before backend setup
             console.warn("Supabase not configured. Using Mock Login.");
             setTimeout(async () => {
                const user = await getUser();
                localStorage.setItem('crystal_user', JSON.stringify(user));
                setLoading(false);
                navigate('/profile');
            }, 1500);
            return;
        }

        try {
            // REAL AUTH: Redirects to Discord
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'discord',
                options: {
                    // Redirect back to the current page after login
                    redirectTo: window.location.origin,
                },
            });

            if (error) throw error;
            
            // Note: The code below this won't execute immediately because 
            // the browser redirects to Discord. The handling continues in App.tsx
        } catch (err: any) {
            console.error("Login error:", err);
            setError(err.message || "Failed to connect to Discord");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] bg-[#050505] flex items-center justify-center relative overflow-hidden p-6 md:p-12">
            {/* Ambient Background - Adjusted opacity for mobile */}
            <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-purple-900/10 blur-[80px] md:blur-[120px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-blue-900/10 blur-[80px] md:blur-[120px] rounded-full" />
            
            <div className="relative z-10 w-full max-w-md flex flex-col items-center justify-center">
                <div className="text-center mb-10 animate-enter-up w-full">
                    <div className="flex justify-center mb-8 transform hover:scale-105 transition-transform duration-500">
                         <div className="scale-100 md:scale-125">
                            <Logo size="lg" />
                         </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">Welcome Back</h1>
                    <p className="text-gray-400 text-base md:text-lg">Sync your library, track progress, and join the guild.</p>
                </div>

                <div className="w-full bg-[#111] border border-white/10 rounded-[32px] p-6 md:p-10 shadow-2xl animate-enter-up backdrop-blur-sm" style={{animationDelay: '100ms'}}>
                    
                    {error && (
                        <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-200 text-sm">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleDiscordLogin}
                        disabled={loading}
                        className="w-full bg-[#5865F2] hover:bg-[#4752c4] text-white h-14 md:h-16 rounded-2xl font-bold text-base md:text-lg flex items-center justify-center gap-3 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden shadow-lg shadow-[#5865F2]/20"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <MessageCircle fill="currentColor" size={24} className="shrink-0" />
                                <span>Continue with Discord</span>
                                <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all absolute right-6 md:static" />
                            </>
                        )}
                    </button>

                    <div className="mt-8 flex items-center gap-4 md:gap-6 text-xs font-medium text-gray-500 justify-center whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck size={14} className="text-green-500" /> Secure Login
                        </div>
                        <div className="w-1 h-1 bg-gray-700 rounded-full" />
                        <div className="flex items-center gap-1.5">
                            <Zap size={14} className="text-yellow-500" /> Instant Access
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center text-xs text-gray-600 max-w-xs mx-auto animate-enter-up leading-relaxed" style={{animationDelay: '200ms'}}>
                    By logging in, you agree to our <a href="#" className="underline hover:text-gray-400">Terms of Service</a> and <a href="#" className="underline hover:text-gray-400">Privacy Policy</a>. CrystalScans is not affiliated with Discord.
                </div>
            </div>
        </div>
    );
};

export default Login;