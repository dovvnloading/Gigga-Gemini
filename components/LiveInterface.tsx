import React, { useEffect, useState } from 'react';
import { X, Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, ChevronDown } from 'lucide-react';
import { useLiveSession } from '../hooks/useLiveSession';

interface LiveInterfaceProps {
  onClose: () => void;
  onError?: (message: string) => void;
}

const LiveInterface: React.FC<LiveInterfaceProps> = ({ onClose, onError }) => {
  const { isConnected, status, volume, isMicOn, isCameraOn, isScreenShareOn, videoRef, toggleMic, toggleCamera, toggleScreenShare } = useLiveSession(onClose, onError);
  
  // Smoothing volume for animation
  const [visualVolume, setVisualVolume] = useState(0);

  useEffect(() => {
    // Lerp volume for smoother visual transitions
    const animate = () => {
      setVisualVolume(prev => prev + (volume - prev) * 0.2);
      requestAnimationFrame(animate);
    };
    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [volume]);

  // Dynamic scale based on volume
  const scale = 1 + Math.min(visualVolume * 4, 1.5); // Cap scale
  const isActive = visualVolume > 0.05;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#131314] animate-in fade-in duration-500 overflow-hidden">
      
      {/* Background Video Layer (If Camera On) */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${isCameraOn || isScreenShareOn ? 'opacity-100' : 'opacity-0'}`}>
          <video 
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full ${isScreenShareOn ? 'object-contain bg-black' : 'object-cover blur-sm scale-110'}`}
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6">
         <button 
           onClick={onClose}
           className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-[#E3E3E3] transition-colors backdrop-blur-md"
         >
            <ChevronDown className="w-6 h-6" />
         </button>
         
         <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/5">
             <span className="text-xs font-medium text-white/80 tracking-wide uppercase">Gemini Live</span>
         </div>
      </div>

      {/* Main Visualizer Area */}
      <div className="relative flex-1 flex flex-col items-center justify-center pointer-events-none">
          
          {/* SOTA Liquid Orb Visualizer */}
          <div className="relative w-64 h-64 flex items-center justify-center">
             {/* The "Goo" Container */}
             <div 
                className="absolute inset-0" 
                style={{ filter: 'url(#goo)' }}
             >
                {/* Core shapes that morph */}
                {/* Blue */}
                <div 
                    className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#4285F4] rounded-full opacity-90 mix-blend-screen transition-transform duration-100 ease-out"
                    style={{ 
                        transform: `translate(${Math.sin(Date.now() / 1000) * 20 * scale}px, ${Math.cos(Date.now() / 800) * 20 * scale}px) scale(${scale})` 
                    }}
                />
                {/* Red */}
                <div 
                    className="absolute top-1/4 right-1/4 w-32 h-32 bg-[#EA4335] rounded-full opacity-90 mix-blend-screen transition-transform duration-100 ease-out"
                    style={{ 
                        transform: `translate(${Math.cos(Date.now() / 1200) * 25 * scale}px, ${Math.sin(Date.now() / 900) * 25 * scale}px) scale(${scale * 0.9})` 
                    }}
                />
                {/* Yellow */}
                <div 
                    className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-[#FBBC05] rounded-full opacity-90 mix-blend-screen transition-transform duration-100 ease-out"
                    style={{ 
                        transform: `translate(${Math.sin(Date.now() / 1100) * -20 * scale}px, ${Math.cos(Date.now() / 1000) * 20 * scale}px) scale(${scale * 1.1})` 
                    }}
                />
                {/* Green */}
                <div 
                    className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-[#34A853] rounded-full opacity-90 mix-blend-screen transition-transform duration-100 ease-out"
                    style={{ 
                        transform: `translate(${Math.cos(Date.now() / 1300) * 15 * scale}px, ${Math.sin(Date.now() / 1200) * -15 * scale}px) scale(${scale * 0.95})` 
                    }}
                />
             </div>

             {/* Connection Spinner (if not connected) */}
             {!isConnected && (
                 <div className="absolute inset-0 flex items-center justify-center z-20">
                     <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                 </div>
             )}
          </div>

          {/* Status Text */}
          <div className="mt-12 text-center space-y-2 z-10 transition-opacity duration-300">
             <h2 className="text-2xl font-display font-medium text-white tracking-tight">
                {isConnected ? (isActive ? "Listening..." : "Gemini is ready") : status}
             </h2>
             <p className="text-white/50 text-sm">
                {isScreenShareOn ? "Viewing your screen" : isCameraOn ? "Watching via camera" : "Audio only mode"}
             </p>
          </div>
      </div>

      {/* Bottom Controls Bar (Glassmorphic) */}
      <div className="relative z-20 px-6 pb-10">
          <div className="flex items-center justify-between max-w-lg mx-auto bg-[#1E1F20]/80 backdrop-blur-2xl border border-white/10 rounded-full p-2 shadow-2xl ring-1 ring-black/50">
              
              <button 
                onClick={toggleCamera}
                disabled={isScreenShareOn}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${isCameraOn ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-transparent text-white/70 hover:bg-white/10 hover:text-white'}`}
                title="Toggle Camera"
              >
                  {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </button>

              <button 
                onClick={toggleMic}
                className={`w-20 h-20 -my-4 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border-4 border-[#131314] ${isMicOn ? 'bg-[#D96570] text-white scale-110 shadow-red-500/30' : 'bg-[#2D2E30] text-red-400'}`}
                title="Toggle Microphone"
              >
                  {isMicOn ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
              </button>

              <button 
                onClick={toggleScreenShare}
                disabled={isCameraOn}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${isScreenShareOn ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-transparent text-white/70 hover:bg-white/10 hover:text-white'}`}
                title="Share Screen"
              >
                  {isScreenShareOn ? <Monitor className="w-6 h-6" /> : <MonitorOff className="w-6 h-6" />}
              </button>

              <button 
                onClick={onClose}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 bg-[#2D2E30] text-[#E3E3E3] hover:bg-red-500/20 hover:text-red-400 ml-2"
                title="End Session"
              >
                  <X className="w-6 h-6" />
              </button>
          </div>
      </div>
    </div>
  );
};

export default LiveInterface;