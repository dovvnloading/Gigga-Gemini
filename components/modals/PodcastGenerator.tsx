
import React, { useEffect, useState } from 'react';
import { Sparkles, FileText, X, Play } from 'lucide-react';
import { usePodcast } from '../../hooks/usePodcast';
import { Message } from '../../types';

interface PodcastGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onPlay: (url: string) => void;
}

const PodcastGenerator: React.FC<PodcastGeneratorProps> = ({ isOpen, onClose, messages, onPlay }) => {
  const { isGenerating, stage, error, audioUrl, generate, reset } = usePodcast(messages);
  const [shouldRender, setShouldRender] = useState(false);

  // Handle mounting/unmounting animation
  useEffect(() => {
    if (isOpen) {
        setShouldRender(true);
        if (stage === 'idle' && !audioUrl) {
            generate();
        }
    } else {
        const t = setTimeout(() => {
            setShouldRender(false);
            if (stage === 'complete' || error) {
                reset();
            }
        }, 300);
        return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Auto-play trigger handled by parent, but we show the button now for manual control
  const handlePlay = () => {
      if (audioUrl) {
          onPlay(audioUrl);
      }
  };

  if (!shouldRender) return null;

  return (
    <div className={`fixed inset-0 z-[80] flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#000000]/70 backdrop-blur-sm"
        onClick={isGenerating ? undefined : onClose}
      />
      
      {/* Modal Card */}
      <div className={`
          relative w-full max-w-[400px] bg-[#131314] rounded-[32px] overflow-hidden shadow-2xl
          transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)]
          border border-white/10
          ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}
      `}>
          
          {/* Close Button */}
          {!isGenerating && (
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/5 text-[#E3E3E3] hover:bg-white/10 transition-colors"
              >
                  <X className="w-5 h-5" />
              </button>
          )}

          {/* Background Ambient Glow */}
          <div className="absolute inset-0 z-0">
             <div className={`absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(66,133,244,0.1),transparent_60%)] transition-opacity duration-1000 ${stage === 'scripting' ? 'opacity-100' : 'opacity-0'}`}></div>
             <div className={`absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(217,101,112,0.1),transparent_60%)] transition-opacity duration-1000 ${stage === 'synthesizing' ? 'opacity-100' : 'opacity-0'}`}></div>
             <div className={`absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(52,168,83,0.1),transparent_60%)] transition-opacity duration-1000 ${stage === 'complete' ? 'opacity-100' : 'opacity-0'}`}></div>
          </div>

          <div className="relative z-10 flex flex-col items-center pt-12 pb-8 px-8 min-h-[400px]">
              
              {/* --- VISUALIZER AREA --- */}
              <div className="flex-1 flex items-center justify-center w-full mb-8">
                  
                  {/* Stage 1: Scripting (Document Analysis) */}
                  {stage === 'scripting' && (
                      <div className="relative animate-in zoom-in fade-in duration-500">
                          <div className="w-24 h-32 rounded-xl bg-gradient-to-br from-[#4285F4]/20 to-[#9B72CB]/20 border border-white/10 flex flex-col p-3 gap-2 shadow-[0_0_30px_rgba(66,133,244,0.2)]">
                              <div className="w-3/4 h-2 rounded-full bg-white/20 animate-pulse"></div>
                              <div className="w-full h-2 rounded-full bg-white/10 animate-[pulse_1.5s_infinite_0.2s]"></div>
                              <div className="w-5/6 h-2 rounded-full bg-white/10 animate-[pulse_1.5s_infinite_0.4s]"></div>
                              <div className="w-full h-2 rounded-full bg-white/10 animate-[pulse_1.5s_infinite_0.6s]"></div>
                          </div>
                          <div className="absolute -bottom-4 -right-4 p-2.5 rounded-full bg-[#131314] border border-white/10 shadow-lg">
                              <Sparkles className="w-5 h-5 text-[#A8C7FA] animate-spin-slow" />
                          </div>
                      </div>
                  )}

                  {/* Stage 2: Synthesis (Two Orbs / Voices) */}
                  {stage === 'synthesizing' && (
                      <div className="relative flex items-center gap-6 animate-in zoom-in fade-in duration-500">
                          {/* Host 1: Kore */}
                          <div className="relative">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4285F4] to-[#8AB4F8] blur-xl opacity-40 animate-[pulse_2s_infinite]"></div>
                              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#4285F4] to-[#8AB4F8] opacity-80 scale-75 animate-[ping_2s_infinite]"></div>
                          </div>
                          {/* Host 2: Fenrir */}
                          <div className="relative">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D96570] to-[#F28B82] blur-xl opacity-40 animate-[pulse_2s_infinite_0.5s]"></div>
                              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#D96570] to-[#F28B82] opacity-80 scale-75 animate-[ping_2s_infinite_0.5s]"></div>
                          </div>
                      </div>
                  )}

                  {/* Stage 3: Complete (Play Button) */}
                  {stage === 'complete' && (
                      <div className="relative animate-in zoom-in fade-in duration-500">
                          <button 
                             onClick={handlePlay}
                             className="w-24 h-24 rounded-full bg-[#E3E3E3] text-[#131314] flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform group"
                          >
                              <Play className="w-10 h-10 ml-1 fill-current group-hover:scale-110 transition-transform" />
                          </button>
                      </div>
                  )}
                  
                  {/* Error State */}
                  {stage === 'idle' && error && (
                       <div className="text-center p-4 rounded-xl bg-[#D96570]/10 border border-[#D96570]/20 text-[#D96570]">
                           <div className="text-sm font-medium">Generation Failed</div>
                           <div className="text-xs mt-1 opacity-80">{error}</div>
                           <button onClick={() => generate()} className="mt-4 text-xs bg-[#D96570] text-white px-3 py-1.5 rounded-full">Try Again</button>
                       </div>
                  )}
              </div>

              {/* --- TEXT INFO AREA --- */}
              <div className="w-full text-center space-y-2">
                   <h2 className="text-2xl font-display font-medium text-white tracking-tight">
                       {stage === 'scripting' && "Creating Script"}
                       {stage === 'synthesizing' && "Generating Audio"}
                       {stage === 'complete' && "Audio Overview Ready"}
                       {stage === 'idle' && !error && "Initializing"}
                   </h2>
                   
                   <p className="text-sm text-[#8E9196] h-10 flex items-center justify-center">
                       {stage === 'scripting' && "Gemini is analyzing the conversation depth..."}
                       {stage === 'synthesizing' && "Kore and Fenrir are recording the overview..."}
                       {stage === 'complete' && "Deep dive generated successfully."}
                   </p>
              </div>

              {/* Progress Bar */}
              {(stage === 'scripting' || stage === 'synthesizing') && (
                  <div className="w-full max-w-[200px] h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r from-[#4285F4] to-[#D96570] transition-all duration-[3000ms] ease-out w-0 ${stage === 'scripting' ? 'w-1/2' : 'w-full'}`}
                      ></div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default PodcastGenerator;
