
import React from 'react';
import { User } from 'lucide-react';

interface MessageAvatarProps {
  isModel: boolean;
  userAvatar: string;
}

const MessageAvatar: React.FC<MessageAvatarProps> = ({ isModel, userAvatar }) => {
  return (
    <div className="flex-shrink-0 mt-1">
      {isModel ? (
        <div className="w-8 h-8 flex items-center justify-center animate-in fade-in zoom-in duration-300">
           <img 
             src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg" 
             alt="Gemini" 
             className="w-6 h-6" 
           />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shadow-sm flex items-center justify-center bg-[#1E1F20]">
           {userAvatar ? (
               <img 
                 src={userAvatar} 
                 alt="User" 
                 className="w-full h-full object-cover"
               />
           ) : (
               <User className="w-5 h-5 text-[#E3E3E3]" />
           )}
        </div>
      )}
    </div>
  );
};

export default MessageAvatar;