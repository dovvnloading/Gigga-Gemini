import React from 'react';
import { Sparkles, ImageIcon, Zap, MapPin, BookOpen } from 'lucide-react';
import { ModelType } from '../types';
import { ToolConfig } from '../services/geminiService';

interface WelcomeScreenProps {
  onSuggestionClick: (text: string, model?: ModelType, configChange?: Partial<ToolConfig>) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSuggestionClick }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-[780px] space-y-10 animate-in fade-in zoom-in duration-500 pb-20 flex flex-col items-center">
            
            {/* Greeting */}
            <div className="space-y-4 flex flex-col items-center text-center">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-color)] border border-[var(--border-color)] backdrop-blur-md shadow-sm">
                    <Sparkles className="w-4 h-4 text-[var(--accent-blue)]" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">Gemini AI</span>
                 </div>
                 <h1 className="text-[44px] md:text-[64px] leading-[1.1] font-display font-medium bg-gradient-to-r from-[#4285F4] via-[#9B72CB] to-[#D96570] text-transparent bg-clip-text tracking-tight pb-2">
                    How can I help you today?
                 </h1>
            </div>

            {/* Suggestion Pills */}
            <div className="flex flex-wrap gap-3 justify-center w-full">
                <button 
                    onClick={() => onSuggestionClick("Create an image of...", ModelType.IMAGE_GEN)}
                    className="flex items-center gap-3 px-5 py-3 bg-[var(--surface-color)] hover:bg-[var(--surface-highlight)] rounded-2xl transition-all border border-[var(--border-color)] hover:border-[var(--border-highlight)] group shadow-sm backdrop-blur-sm"
                >
                    <div className="p-2 rounded-full bg-[var(--icon-red)]/10 group-hover:bg-[var(--icon-red)]/20 transition-colors">
                        <ImageIcon className="w-5 h-5 text-[var(--icon-red)]" />
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)] opacity-90 group-hover:opacity-100">Create image</span>
                </button>

                 <button 
                    onClick={() => onSuggestionClick("What's the weather in Tokyo?", undefined, { useSmartTools: true })}
                    className="flex items-center gap-3 px-5 py-3 bg-[var(--surface-color)] hover:bg-[var(--surface-highlight)] rounded-2xl transition-all border border-[var(--border-color)] hover:border-[var(--border-highlight)] group shadow-sm backdrop-blur-sm"
                >
                    <div className="p-2 rounded-full bg-[var(--icon-blue)]/10 group-hover:bg-[var(--icon-blue)]/20 transition-colors">
                        <Zap className="w-5 h-5 text-[var(--icon-blue)]" />
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)] opacity-90 group-hover:opacity-100">Weather Check</span>
                </button>
                 
                <button 
                    onClick={() => onSuggestionClick("Research the future of solid state batteries", undefined, { useDeepResearch: true })}
                    className="flex items-center gap-3 px-5 py-3 bg-[var(--surface-color)] hover:bg-[var(--surface-highlight)] rounded-2xl transition-all border border-[var(--border-color)] hover:border-[var(--border-highlight)] group shadow-sm backdrop-blur-sm"
                >
                    <div className="p-2 rounded-full bg-[var(--icon-purple)]/10 group-hover:bg-[var(--icon-purple)]/20 transition-colors">
                        <BookOpen className="w-5 h-5 text-[var(--icon-purple)]" />
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)] opacity-90 group-hover:opacity-100">Deep Research</span>
                </button>

                 <button 
                    onClick={() => onSuggestionClick("Find coffee shops in Seattle", undefined, { useGoogleMaps: true })}
                    className="flex items-center gap-3 px-5 py-3 bg-[var(--surface-color)] hover:bg-[var(--surface-highlight)] rounded-2xl transition-all border border-[var(--border-color)] hover:border-[var(--border-highlight)] group shadow-sm backdrop-blur-sm"
                >
                    <div className="p-2 rounded-full bg-[var(--icon-green)]/10 group-hover:bg-[var(--icon-green)]/20 transition-colors">
                        <MapPin className="w-5 h-5 text-[var(--icon-green)]" />
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)] opacity-90 group-hover:opacity-100">Find places</span>
                </button>
            </div>
        </div>
    </div>
  );
};

export default WelcomeScreen;