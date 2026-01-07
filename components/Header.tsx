import React from 'react';
import { Menu, PanelLeftOpen, User, Headphones } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarOpen?: boolean;
  userAvatar: string;
  onPodcastClick?: () => void;
  showPodcastButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
    onMenuClick, 
    isSidebarOpen = false, 
    userAvatar,
    onPodcastClick,
    showPodcastButton = false
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-4 md:px-6 z-20 pointer-events-none">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md border-b border-white/5"></div>
      
      <div className="flex items-center gap-3 pointer-events-auto relative z-10">
         <button 
            onClick={onMenuClick} 
            className={`p-2 text-[#E3E3E3] hover:bg-white/10 rounded-full transition-colors ${isSidebarOpen ? 'md:hidden' : 'block'}`}
         >
            {isSidebarOpen ? <Menu className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
         </button>
         <span className="text-xl font-medium text-[#E3E3E3] tracking-tight opacity-90 hidden md:block text-shadow-sm">Gemini</span>
      </div>
      <div className="flex items-center gap-3 pointer-events-auto relative z-10">
         {showPodcastButton && (
             <button 
                onClick={onPodcastClick}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#4285F4]/20 to-[#9B72CB]/20 hover:from-[#4285F4]/30 hover:to-[#9B72CB]/30 border border-white/10 transition-all group"
                title="Generate Audio Overview"
             >
                <Headphones className="w-4 h-4 text-[#A8C7FA] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-[#E3E3E3] hidden sm:block">Audio Overview</span>
             </button>
         )}
         
         <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 ring-2 ring-transparent hover:ring-white/10 transition-all cursor-pointer shadow-lg flex items-center justify-center bg-[#1E1F20]">
            {userAvatar ? (
                <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
                <User className="w-5 h-5 text-[#E3E3E3]" />
            )}
         </div>
      </div>
    </header>
  );
};

export default Header;