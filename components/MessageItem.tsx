import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Copy, Check, RotateCw, Pencil, ChevronDown, ChevronRight, BrainCircuit, Sparkles, FileText, FileCode, GitFork } from 'lucide-react';
import { Message, Attachment } from '../types';
import ChartVisualization from './visualizations/ChartVisualization';
import YouTubeGridView from './visualizations/YouTubeGridView';
import DeepResearchView from './visualizations/DeepResearchView';
import GroundingChips from './message/GroundingChips';
import MessageContent from './message/MessageContent';
import MessageAvatar from './message/MessageAvatar';

interface MessageItemProps {
  message: Message;
  onPlayAudio?: (text: string) => void;
  onOpenCanvas?: (content: string, language: string) => void;
  userAvatar: string;
  isLast?: boolean;
  onRegenerate?: () => void;
  onFork?: () => void;
  onEdit?: (newText: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  onPlayAudio, 
  onOpenCanvas, 
  userAvatar, 
  isLast,
  onRegenerate,
  onFork,
  onEdit
}) => {
  const isModel = message.role === 'model';
  const [copied, setCopied] = useState(false);
  const [isThinkingOpen, setIsThinkingOpen] = useState(false);
  
  // Timer for active thinking
  const [thinkingTimer, setThinkingTimer] = useState(0);

  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.text || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let interval: any;
    if (message.isLoading && !message.text && message.thoughtProcess) {
       interval = setInterval(() => {
          setThinkingTimer(prev => prev + 0.1);
       }, 100);
    } else if (message.thinkingDuration) {
       setThinkingTimer(message.thinkingDuration);
    }
    return () => clearInterval(interval);
  }, [message.isLoading, message.text, message.thoughtProcess, message.thinkingDuration]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const handleCopy = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveEdit = () => {
      if (editedText.trim() !== message.text && onEdit) {
          onEdit(editedText);
      }
      setIsEditing(false);
  };

  const isThinking = message.isLoading && !message.text;

  const allAttachments: Attachment[] = [
      ...(message.attachments || []),
      ...(message.image ? [{ 
          id: 'legacy', 
          type: 'image' as const, 
          mimeType: 'image/png', 
          name: 'Image', 
          content: message.image 
      }] : [])
  ];

  const isCodeFile = (name: string) => {
      const codeExts = ['.ts', '.tsx', '.js', '.jsx', '.py', '.rb', '.java', '.c', '.cpp', '.h', '.cs', '.php', '.go', '.rs', '.swift', '.kt', '.html', '.css', '.json', '.xml', '.sql', '.sh', '.bat', '.ps1', '.yml', '.yaml'];
      return codeExts.some(ext => name.toLowerCase().endsWith(ext));
  };

  return (
    <div className={`group flex gap-4 md:gap-6 p-2 transition-colors relative mb-6`}>
      <MessageAvatar isModel={isModel} userAvatar={userAvatar} />

      <div className="flex-1 min-w-0 space-y-1">
        {/* Header */}
        <div className="flex items-center gap-2 h-7">
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {isModel ? 'Gemini' : 'You'}
          </span>
        </div>

        {/* Attachments Grid */}
        {allAttachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
                {allAttachments.map((att) => (
                    <div key={att.id} className="relative group overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--surface-highlight)] transition-all hover:border-[var(--border-highlight)]">
                         {att.type === 'image' && !att.mimeType.includes('pdf') ? (
                             <div className="relative h-32 w-32">
                                <img src={att.content} alt={att.name} className="h-full w-full object-cover" />
                             </div>
                         ) : (
                             <div className="flex items-center gap-3 p-3 min-w-[160px]">
                                <div className="p-2 bg-[var(--surface-color)] rounded-lg">
                                    {att.mimeType.includes('pdf') ? (
                                        <FileText className="w-5 h-5 text-[#D96570]" />
                                    ) : isCodeFile(att.name) ? (
                                        <FileCode className="w-5 h-5 text-[#A8C7FA]" />
                                    ) : (
                                        <FileText className="w-5 h-5 text-[var(--text-primary)]" />
                                    )}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-xs font-medium text-[var(--text-primary)] truncate max-w-[120px]">{att.name}</span>
                                    <span className="text-[10px] text-[var(--text-secondary)] uppercase">{att.mimeType.split('/').pop() || 'FILE'}</span>
                                </div>
                             </div>
                         )}
                    </div>
                ))}
            </div>
        )}

        {/* Thinking Process Accordion */}
        {isModel && message.thoughtProcess && (
          <div className="my-2 max-w-full">
             <div 
               className={`
                 rounded-xl overflow-hidden transition-all duration-300
                 ${isThinkingOpen ? 'bg-[var(--surface-color)] border border-[var(--border-color)]' : 'bg-[var(--surface-highlight)]/50 hover:bg-[var(--surface-highlight)] border border-transparent'}
                 ${isThinking ? 'ring-1 ring-[#A8C7FA]/30 shadow-[0_0_15px_rgba(66,133,244,0.1)]' : ''}
               `}
             >
                <button 
                    onClick={() => setIsThinkingOpen(!isThinkingOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left"
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${isThinking ? 'bg-gradient-to-br from-[#4285F4] to-[#9B72CB]' : 'bg-[var(--surface-highlight)]'}`}>
                             {isThinking ? (
                                <Sparkles className="w-3.5 h-3.5 text-white animate-[pulse_2s_infinite]" />
                             ) : (
                                <BrainCircuit className="w-3.5 h-3.5 text-[var(--text-primary)]" />
                             )}
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-xs font-medium transition-colors ${isThinking ? 'text-[#A8C7FA]' : 'text-[var(--text-primary)]'}`}>
                                {isThinking ? 'Thinking...' : 'Thought Process'}
                            </span>
                            <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                                {isThinking 
                                   ? `${thinkingTimer.toFixed(1)}s` 
                                   : `Thought for ${message.thinkingDuration?.toFixed(1) || thinkingTimer.toFixed(1)}s`
                                }
                            </span>
                        </div>
                    </div>
                    {isThinkingOpen ? <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />}
                </button>
                
                {isThinkingOpen && (
                    <div className="px-4 pb-4 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                        {isThinking && (
                            <div className="h-0.5 w-full bg-[var(--border-color)] overflow-hidden mb-3 rounded-full">
                                <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#A8C7FA] to-transparent animate-[shimmer_1.5s_infinite] translate-x-[-100%]"></div>
                            </div>
                        )}
                        <div className="pl-3 text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap font-mono border-l-2 border-[var(--border-color)] opacity-90">
                            {message.thoughtProcess}
                            {isThinking && <span className="inline-block w-1.5 h-3 ml-1 bg-[#A8C7FA] animate-pulse align-middle"></span>}
                        </div>
                    </div>
                )}
             </div>
          </div>
        )}

        {/* Edit Mode UI */}
        {isEditing ? (
            <div className="mt-2 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl p-4 shadow-lg animate-in fade-in zoom-in-95 duration-200 ring-1 ring-[var(--border-color)]">
                <textarea 
                    ref={textareaRef}
                    value={editedText}
                    onChange={(e) => {
                        setEditedText(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSaveEdit();
                        }
                        if (e.key === 'Escape') setIsEditing(false);
                    }}
                    className="w-full bg-transparent border-none outline-none text-[var(--text-primary)] resize-none text-base leading-relaxed p-0 placeholder-[var(--text-secondary)] custom-scrollbar max-h-[300px]"
                />
                <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-[var(--border-color)]">
                    <button 
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSaveEdit}
                        disabled={!editedText.trim()}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--text-primary)] text-[var(--text-inverse)] hover:opacity-90 transition-colors disabled:opacity-50"
                    >
                        Update
                    </button>
                </div>
            </div>
        ) : (
            <>
                {/* Visualizations */}
                {message.chartData && <ChartVisualization data={message.chartData} />}
                {message.deepResearchData && <DeepResearchView data={message.deepResearchData} />}
                {message.youTubeData && message.youTubeData.length > 0 && <YouTubeGridView videos={message.youTubeData} />}
                
                {/* Text Content */}
                <MessageContent 
                    isLoading={message.isLoading && !message.text} 
                    text={message.text} 
                    onOpenCanvas={onOpenCanvas} 
                />

                {/* Footer / Grounding */}
                {!message.isLoading && message.groundingMetadata && (
                    <GroundingChips metadata={message.groundingMetadata} />
                )}
            </>
        )}

        {/* Actions Bar */}
        {!message.isLoading && !isEditing && (
          <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
             {isModel && (
                 <button 
                    onClick={() => onPlayAudio && message.text && onPlayAudio(message.text)} 
                    className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] rounded-full transition-colors flex items-center gap-1.5 group/sound" 
                    title="Read Aloud"
                 >
                    <Volume2 className="w-4 h-4 group-hover/sound:text-[var(--accent-blue)]" />
                    <span className="text-[10px] font-medium hidden group-hover/sound:block text-[var(--accent-blue)]">Read</span>
                 </button>
             )}

             <button onClick={handleCopy} className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] rounded-full transition-colors" title="Copy">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
             </button>

             {isModel && onRegenerate && (
                 <button 
                    onClick={onRegenerate}
                    className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] rounded-full transition-colors" 
                    title="Regenerate response"
                 >
                    <RotateCw className="w-4 h-4" />
                 </button>
             )}

             {isModel && onFork && (
                 <button 
                    onClick={onFork}
                    className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] rounded-full transition-colors" 
                    title="Fork conversation from here"
                 >
                    <GitFork className="w-4 h-4" />
                 </button>
             )}

             {!isModel && onEdit && (
                 <button 
                    onClick={() => {
                        setEditedText(message.text || '');
                        setIsEditing(true);
                    }}
                    className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] rounded-full transition-colors" 
                    title="Edit message"
                 >
                    <Pencil className="w-4 h-4" />
                 </button>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;