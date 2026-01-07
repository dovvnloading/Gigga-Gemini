import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, X, Info } from 'lucide-react';

export type ToastType = 'error' | 'success' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const styles = {
    error: {
      icon: <AlertCircle className="w-5 h-5 text-[#D96570]" />,
      border: 'border-[#D96570]/30',
      bg: 'bg-[#D96570]/10'
    },
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-[#34A853]" />,
      border: 'border-[#34A853]/30',
      bg: 'bg-[#34A853]/10'
    },
    info: {
      icon: <Info className="w-5 h-5 text-[#4285F4]" />,
      border: 'border-[#4285F4]/30',
      bg: 'bg-[#4285F4]/10'
    }
  };

  const currentStyle = styles[type];

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 animate-in slide-in-from-top-4 fade-in duration-300">
      <div className={`
        relative flex items-center gap-3 p-4 rounded-xl 
        backdrop-blur-xl border shadow-2xl
        ${currentStyle.bg} ${currentStyle.border} bg-[#1E1F20]/90
      `}>
        <div className="flex-shrink-0">
          {currentStyle.icon}
        </div>
        <div className="flex-1 text-sm font-medium text-[#E3E3E3]">
          {message}
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors text-[#8E9196] hover:text-[#E3E3E3]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;