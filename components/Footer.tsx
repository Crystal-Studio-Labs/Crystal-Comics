import React from 'react';
import Logo from './Logo';
import { MessageCircle, Twitter, Facebook, Mail, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-[#0a0a0a] border-t border-white/5 pt-16 pb-32">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                {/* Brand Column */}
                <div className="col-span-1 md:col-span-1 space-y-6">
                    <Logo size="sm" />
                    <p className="text-gray-400 text-sm leading-relaxed">
                        CrystalScans is your premier destination for high-quality manhwa and manga translations. Join our community and read the latest chapters first.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-[#5865F2] hover:text-white transition text-gray-400">
                            <MessageCircle size={20} />
                        </a>
                        <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-blue-400 hover:text-white transition text-gray-400">
                            <Twitter size={20} />
                        </a>
                        <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-blue-600 hover:text-white transition text-gray-400">
                            <Facebook size={20} />
                        </a>
                    </div>
                </div>

                {/* Discord Integration */}
                <div className="col-span-1 md:col-span-2 bg-[#5865F2]/10 border border-[#5865F2]/20 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#5865F2]/20 blur-[60px] rounded-full" />
                    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-[#5865F2] font-black text-xl mb-2 flex items-center gap-2">
                                <MessageCircle fill="currentColor" /> JOIN OUR DISCORD
                            </h3>
                            <p className="text-gray-300 text-sm max-w-sm">
                                Get instant notifications for updates, chat with other readers, and discuss your favorite series!
                            </p>
                        </div>
                        <a 
                            href="https://discord.gg" 
                            target="_blank" 
                            rel="noreferrer"
                            className="bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold py-3 px-6 rounded-xl transition flex items-center gap-2 shadow-lg shadow-[#5865F2]/30 whitespace-nowrap"
                        >
                            Join Server <ExternalLink size={16} />
                        </a>
                    </div>
                </div>

                {/* Links */}
                <div className="space-y-4">
                    <h4 className="font-bold text-white mb-4">Platform</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><a href="#" className="hover:text-purple-400 transition">Terms of Service</a></li>
                        <li><a href="#" className="hover:text-purple-400 transition">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-purple-400 transition">DMCA</a></li>
                        <li><a href="#" className="hover:text-purple-400 transition">Contact Us</a></li>
                    </ul>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 text-center text-xs text-gray-600">
                &copy; {new Date().getFullYear()} CrystalScans. All rights reserved. This site does not store any files on its server. All contents are provided by non-affiliated third parties.
            </div>
        </footer>
    );
};

export default Footer;