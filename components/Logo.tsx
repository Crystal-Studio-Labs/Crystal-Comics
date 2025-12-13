import React from 'react';
import { Link } from 'react-router-dom';
import { Gem } from 'lucide-react';

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 48 : 32;
  const textSize = size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-4xl' : 'text-2xl';

  return (
    <Link to="/" className="flex items-center gap-3 group select-none hover:opacity-90 transition-opacity">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
        <Gem 
            size={iconSize} 
            className="text-purple-500 fill-purple-500/10 relative z-10" 
            strokeWidth={1.5}
        />
      </div>
      
      <div className="flex flex-col justify-center">
        <h1 className={`${textSize} font-black tracking-tighter text-white leading-none font-sans flex items-center gap-0.5`}>
            CRYSTAL
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1"></span>
        </h1>
        <span className="text-[10px] font-bold tracking-[0.3em] text-gray-500 uppercase group-hover:text-purple-400 transition-colors">
            SCANS
        </span>
      </div>
    </Link>
  );
};

export default Logo;