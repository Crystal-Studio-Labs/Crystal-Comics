import React from 'react';
import { Home, Compass, BookOpen, User, Crown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const FloatingDock: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'explore', icon: Compass, label: 'Explore', path: '/explore' },
    { id: 'guild', icon: Crown, label: 'Guild', path: '/guild' },
    { id: 'library', icon: BookOpen, label: 'Library', path: '/library' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-enter-dock origin-bottom lg:hidden">
      <div className="bg-[#1C1924]/90 backdrop-blur-3xl border border-[#24212B] px-3 py-2 rounded-full shadow-2xl flex items-center gap-2 scale-90">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;
          return (
            <Link 
              key={tab.id}
              to={tab.path}
              className="relative group flex flex-col items-center justify-center w-12 h-12 transition-all duration-300 rounded-full hover:bg-white/5"
            >
              {active && (
                <div className="absolute inset-0 bg-white/10 blur-lg rounded-full" />
              )}
              <Icon 
                size={20} 
                className={`relative z-10 transition-all duration-300 ${active ? 'text-white scale-110' : 'text-gray-500 group-hover:text-gray-300'}`} 
                strokeWidth={active ? 2.5 : 2}
              />
              {active && (
                <div className="absolute -bottom-1 w-1 h-1 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default FloatingDock;