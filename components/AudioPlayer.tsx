import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, X, Volume2, VolumeX, Loader2, GripHorizontal, Download } from 'lucide-react';

interface AudioPlayerProps {
  src: string | null;
  onClose: () => void;
  isLoading?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, onClose, isLoading }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (src && audioRef.current) {
        audioRef.current.volume = volume;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error(e));
    }
  }, [src]);

  // Drag Event Listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault(); // Prevent text selection
        setPosition({
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Ignore drag if clicking interactive elements like buttons or sliders
    if (
      (e.target as HTMLElement).closest('button') || 
      (e.target as HTMLElement).closest('input') ||
      (e.target as HTMLElement).closest('a')
    ) {
      return;
    }

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      
      // Calculate offset relative to the element's top-left corner
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      // If this is the first drag, initialize position to current visual coordinates
      if (!position) {
          setPosition({ x: rect.left, y: rect.top });
      }

      setIsDragging(true);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      // Fallback duration if NaN (sometimes happens with blobs)
      if (!isNaN(audioRef.current.duration) && audioRef.current.duration !== Infinity) {
          setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!src && !isLoading) return null;

  return (
    <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        style={position ? { left: position.x, top: position.y } : undefined}
        className={`
            fixed z-50 w-full max-w-lg px-4 transition-shadow
            ${position ? '' : 'bottom-24 left-1/2 -translate-x-1/2 animate-in slide-in-from-bottom-5 fade-in duration-300'}
            ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        `}
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#1E1F20]/90 backdrop-blur-xl shadow-2xl p-4 flex flex-col gap-3 select-none">
        
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4285F4] via-[#9B72CB] to-[#D96570] opacity-50"></div>
        <div className="absolute -left-10 -top-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Drag Handle */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 text-white/10">
            <GripHorizontal className="w-8 h-4" />
        </div>

        {/* Top Row: Controls & Info */}
        <div className="flex items-center gap-4 mt-1">
           {/* Play/Pause Button */}
           <button 
             onClick={togglePlay}
             disabled={isLoading}
             className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-white/10 disabled:opacity-50 flex-shrink-0"
           >
             {isLoading ? (
                 <Loader2 className="w-5 h-5 animate-spin" />
             ) : isPlaying ? (
                 <Pause className="w-5 h-5 fill-current" />
             ) : (
                 <Play className="w-5 h-5 fill-current ml-0.5" />
             )}
           </button>

           <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center justify-between text-xs font-medium text-[#8E9196] mb-1.5">
                  <span>{formatTime(progress)}</span>
                  <span className="text-[#E3E3E3] truncate mx-2 max-w-[150px]">Gemini Speech</span>
                  <span>{formatTime(duration || 0)}</span>
              </div>
              
              {/* Custom Seek Slider */}
              <div className="relative w-full h-1.5 bg-white/10 rounded-full group cursor-pointer">
                 <input 
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={progress}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                    disabled={isLoading}
                 />
                 <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#4285F4] to-[#D96570] rounded-full transition-all duration-100"
                    style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                 >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] scale-0 group-hover:scale-100 transition-transform duration-200"></div>
                 </div>
              </div>
           </div>
        </div>

        {/* Bottom Row: Volume & Actions */}
        <div className="flex items-center justify-between border-t border-white/5 pt-2">
            <div className="flex items-center gap-2 group">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-[#8E9196] hover:text-white transition-colors"
                >
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <div className="w-20 h-1 bg-white/10 rounded-full relative overflow-hidden">
                    <input 
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                    />
                    <div 
                        className="absolute top-0 left-0 h-full bg-[#E3E3E3] rounded-full"
                        style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                    ></div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {src && !isLoading && (
                    <a 
                        href={src}
                        download={`gemini-speech-${Date.now()}.wav`}
                        className="p-1.5 hover:bg-white/10 rounded-full text-[#8E9196] hover:text-white transition-colors flex items-center justify-center"
                        title="Download Audio"
                    >
                        <Download className="w-4 h-4" />
                    </a>
                )}
                <button 
                    onClick={onClose}
                    className="p-1.5 hover:bg-white/10 rounded-full text-[#8E9196] hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>

        <audio 
            ref={audioRef} 
            src={src || undefined} 
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onLoadedMetadata={() => {
                if(audioRef.current) setDuration(audioRef.current.duration);
            }}
        />
      </div>
    </div>
  );
};

export default AudioPlayer;