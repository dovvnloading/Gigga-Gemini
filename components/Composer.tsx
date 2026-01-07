import React, { useState, useEffect } from 'react';
import { Send, Mic, Plus, Grip, Mic2 } from 'lucide-react';
import { ModelType, Attachment } from '../types';
import { ToolConfig } from '../services/geminiService';
import ModelSelect from './ModelSelect';
import { MODEL_LABELS } from '../constants';

// Sub-components & Hooks
import { useComposerInput } from '../hooks/useComposerInput';
import AttachmentList from './composer/AttachmentList';
import ToolsMenu from './composer/ToolsMenu';

interface ComposerProps {
  onSend: (text: string, attachments: Attachment[], model: ModelType) => void;
  isGenerating: boolean;
  currentModel: ModelType;
  onModelChange: (model: ModelType) => void;
  toolConfig: ToolConfig;
  onToolToggle: (key: keyof ToolConfig) => void;
  onResetTools: () => void;
  hasMessages: boolean;
  inputOverride?: string;
  onError?: (message: string) => void;
}

const Composer: React.FC<ComposerProps> = ({
  onSend,
  isGenerating,
  currentModel,
  onModelChange,
  toolConfig,
  onToolToggle,
  onResetTools,
  inputOverride,
  onError
}) => {
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const { 
    input, setInput, attachments, fileInputRef, textareaRef,
    isListening, toggleListening, handleFileUpload, processFiles, 
    removeAttachment, handleSend 
  } = useComposerInput({ onSend, currentModel, inputOverride, onError });

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input, textareaRef]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeToolCount = Object.values(toolConfig).filter(Boolean).length;

  return (
    <div 
        className={`
          relative transition-all duration-300 rounded-[32px]
          glass-panel
          ${isFocused || isDragOver ? 'ring-2 ring-[var(--border-highlight)] shadow-2xl' : 'ring-1 ring-[var(--border-color)] shadow-lg'}
          group/composer
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            processFiles(e.dataTransfer.files);
        }}
    >
        {/* Active Glow Effect on Focus */}
        {(isFocused || isDragOver) && (
            <div className="absolute -inset-px rounded-[32px] bg-gradient-to-r from-[#4285F4]/20 via-[#9B72CB]/20 to-[#D96570]/20 opacity-100 pointer-events-none blur-md transition-opacity duration-500"></div>
        )}

        <AttachmentList attachments={attachments} onRemove={removeAttachment} />

        <div className="flex flex-col relative z-10 rounded-[32px]">
            <div className="flex items-center min-h-[64px] px-2 py-2 gap-2">
                
                {/* Left Actions */}
                <div className="flex items-center gap-1 self-end pb-2 pl-2">
                    <button 
                        className="p-2.5 text-[var(--text-primary)] hover:bg-[var(--hover-bg)] rounded-full transition-colors relative group"
                        onClick={() => fileInputRef.current?.click()}
                        title="Add image or file"
                    >
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--surface-highlight)] border border-[var(--border-color)] group-hover:bg-[var(--text-primary)] group-hover:text-[var(--text-inverse)] transition-all">
                            <Plus className="w-5 h-5" />
                        </div>
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        multiple
                        onChange={handleFileUpload}
                    />

                     <div className="relative">
                         <button 
                            onClick={() => setIsToolsOpen(!isToolsOpen)}
                            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors text-xs font-medium border border-transparent ${activeToolCount > 0 ? 'bg-[#D3E3FD]/20 text-[#D3E3FD] border-[#D3E3FD]/20' : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]'}`}
                         >
                            <Grip className="w-4 h-4" />
                         </button>
                         
                         <ToolsMenu 
                            isOpen={isToolsOpen} 
                            onClose={() => setIsToolsOpen(false)}
                            toolConfig={toolConfig}
                            onToggle={onToolToggle}
                            onReset={onResetTools}
                         />
                     </div>
                </div>

                {/* Text Area */}
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={activeToolCount > 0 ? `Ask with ${activeToolCount} active tool${activeToolCount > 1 ? 's' : ''}` : `Ask ${MODEL_LABELS[currentModel]}`}
                    className="flex-1 bg-transparent border-none focus:ring-0 outline-none resize-none py-4 px-2 text-[var(--text-primary)] placeholder-[var(--text-secondary)] max-h-48 custom-scrollbar text-[16px] leading-relaxed"
                    rows={1}
                />

                {/* Right Actions */}
                <div className="flex items-center gap-2 pr-2 self-end pb-2">
                    <div className="hidden sm:block">
                        <ModelSelect currentModel={currentModel} onModelChange={onModelChange} />
                    </div>

                    {isListening ? (
                         <div className="relative">
                            <div className="absolute inset-0 bg-[#D96570] rounded-full blur-md opacity-50 animate-pulse"></div>
                            <button 
                                onClick={toggleListening}
                                className="relative p-2.5 rounded-full bg-[#D96570] text-white shadow-lg transition-transform hover:scale-105"
                                title="Stop Listening"
                            >
                                <Mic2 className="w-5 h-5 animate-[pulse_1.5s_infinite]" />
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={toggleListening}
                            className="p-2.5 text-[var(--text-primary)] hover:bg-[var(--hover-bg)] rounded-full transition-colors"
                            title="Speech to Text"
                        >
                            <Mic className="w-5 h-5" />
                        </button>
                    )}

                    {(input || attachments.length > 0) && (
                        <button 
                            onClick={handleSend}
                            disabled={isGenerating}
                            className={`p-2.5 rounded-full transition-all duration-300 ${isGenerating ? 'text-[var(--text-secondary)] cursor-not-allowed bg-[var(--surface-highlight)]' : 'text-[#041E49] bg-[var(--text-primary)] hover:opacity-90 shadow-lg hover:scale-105'}`}
                        >
                            <Send className="w-5 h-5 ml-0.5 text-inherit" style={{ color: isGenerating ? 'currentColor' : '#131314' }} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Composer;