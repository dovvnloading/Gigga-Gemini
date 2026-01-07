

import React, { useState, useEffect, useRef } from 'react';
import { X, Bot, Sparkles, Copy, Check, FileText, Code2, Play, Eraser } from 'lucide-react';
import { CanvasState, ModelType } from '../types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CanvasProps {
  isOpen: boolean;
  state: CanvasState;
  onClose: () => void;
  onUpdateContent: (content: string) => void;
  onAiEditRequest: (prompt: string, currentSelection: string) => void;
  isGenerating: boolean;
}

const Canvas: React.FC<CanvasProps> = ({ 
  isOpen, 
  state, 
  onClose, 
  onUpdateContent, 
  onAiEditRequest,
  isGenerating 
}) => {
  const [localContent, setLocalContent] = useState(state.content);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [selection, setSelection] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiInput, setShowAiInput] = useState(false);
  const [copied, setCopied] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlighterRef = useRef<HTMLDivElement>(null);

  const isWeb = state.language === 'html';

  useEffect(() => {
    setLocalContent(state.content);
  }, [state.content]);

  // Sync scrolling between textarea and syntax highlighter
  const handleScroll = () => {
    if (textareaRef.current && highlighterRef.current) {
        highlighterRef.current.scrollTop = textareaRef.current.scrollTop;
        highlighterRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Handle Text Selection for "Edit with AI"
  const handleSelect = () => {
    if (textareaRef.current) {
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        if (start !== end) {
            setSelection(localContent.substring(start, end));
            setShowAiInput(true);
        } else {
            setShowAiInput(false);
        }
    }
  };

  const handleAiSubmit = () => {
    if (!aiPrompt.trim()) return;
    onAiEditRequest(aiPrompt, selection || localContent);
    setAiPrompt('');
    setShowAiInput(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(localContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to construct srcDoc for web preview with Tailwind injection
  const getIframeContent = (code: string) => {
    // Check if tailwind is already there
    const hasTailwind = code.includes('cdn.tailwindcss.com');
    let headInjection = '';
    if (!hasTailwind) {
       headInjection += '<script src="https://cdn.tailwindcss.com"></script>';
    }
    
    // Basic error handling for the user script
    headInjection += `<style>body { background-color: transparent; }</style>`;

    if (code.includes('<html') || code.includes('<!DOCTYPE html>')) {
        // It's a full page
        if (!hasTailwind) {
            return code.replace('</head>', `${headInjection}</head>`);
        }
        return code;
    } else {
        // It's a fragment
        return `
          <!DOCTYPE html>
          <html>
              <head>
                  <meta charset="UTF-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                  ${headInjection}
              </head>
              <body class="bg-transparent p-4 text-white">
                  ${code}
              </body>
          </html>
        `;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`
      fixed md:relative inset-0 md:inset-auto z-40 md:z-0 flex-1 
      bg-[#131314] md:bg-transparent flex flex-col h-full border-l border-white/5 
      animate-in slide-in-from-right duration-300
    `}>
      
      {/* Canvas Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/5 bg-[#1E1F20]/50 backdrop-blur-md flex-shrink-0">
         <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                 {state.mode === 'code' ? <Code2 className="w-4 h-4 text-[#A8C7FA]" /> : <FileText className="w-4 h-4 text-[#F28B82]" />}
                 <h2 className="text-sm font-medium text-[#E3E3E3]">{state.title}</h2>
             </div>
             
             {/* Mode Toggle Pills */}
             <div className="hidden md:flex bg-[#000000]/20 rounded-lg p-0.5 border border-white/5">
                 <button 
                   onClick={() => setActiveTab('editor')}
                   className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === 'editor' ? 'bg-[#2D2E30] text-[#E3E3E3] shadow-sm' : 'text-[#8E9196] hover:text-[#E3E3E3]'}`}
                 >
                    Editor
                 </button>
                 <button 
                   onClick={() => setActiveTab('preview')}
                   className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === 'preview' ? 'bg-[#2D2E30] text-[#E3E3E3] shadow-sm' : 'text-[#8E9196] hover:text-[#E3E3E3]'}`}
                 >
                    Preview
                 </button>
             </div>
         </div>

         <div className="flex items-center gap-2">
             <button onClick={handleCopy} className="p-2 text-[#8E9196] hover:text-[#E3E3E3] rounded-lg transition-colors">
                 {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
             </button>
             <button onClick={onClose} className="p-2 text-[#8E9196] hover:text-[#E3E3E3] rounded-lg transition-colors">
                 <X className="w-4 h-4" />
             </button>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden bg-[#1E1F20]/30">
        
        {/* Editor Mode */}
        <div className={`absolute inset-0 flex flex-col ${activeTab === 'editor' ? 'z-10' : 'z-0 hidden'}`}>
            <div className="relative flex-1 min-h-0">
                 {/* Syntax Highlight Underlay (Syncs with Textarea) - Only for code */}
                 {(state.mode === 'code' || isWeb) && (
                     <div 
                        ref={highlighterRef}
                        className="absolute inset-0 pointer-events-none p-6 font-mono text-sm leading-relaxed overflow-hidden bg-[#1E1F20]"
                        aria-hidden="true"
                     >
                        <SyntaxHighlighter
                            language={state.language}
                            style={vscDarkPlus}
                            customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
                            wrapLines={true}
                            showLineNumbers={false}
                        >
                            {localContent}
                        </SyntaxHighlighter>
                     </div>
                 )}

                 {/* Editable Textarea */}
                 <textarea
                    ref={textareaRef}
                    value={localContent}
                    onChange={(e) => {
                        setLocalContent(e.target.value);
                        onUpdateContent(e.target.value);
                    }}
                    onScroll={handleScroll}
                    onSelect={handleSelect}
                    spellCheck={false}
                    className={`
                        absolute inset-0 w-full h-full bg-transparent p-6 outline-none resize-none custom-scrollbar
                        ${(state.mode === 'code' || isWeb) ? 'font-mono text-sm leading-relaxed text-transparent caret-white selection:bg-blue-500/30' : 'font-sans text-base leading-relaxed text-[#E3E3E3] bg-[#1E1F20]'}
                    `}
                    placeholder="Start typing or ask Gemini to write something..."
                 />
            </div>

            {/* AI Edit Floating Bar */}
            <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg transition-all duration-300 ${showAiInput ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
                <div className="bg-[#1E1F20] border border-white/10 rounded-xl shadow-2xl p-2 flex items-center gap-2 ring-1 ring-white/5 backdrop-blur-xl">
                    <div className="p-2 bg-gradient-to-br from-[#4285F4] to-[#9B72CB] rounded-lg">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <input 
                        type="text" 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAiSubmit()}
                        placeholder={selection ? "Edit selection..." : "Edit document..."}
                        className="flex-1 bg-transparent border-none outline-none text-sm text-[#E3E3E3] placeholder-[#8E9196]"
                        autoFocus
                    />
                    <button 
                        onClick={handleAiSubmit}
                        disabled={!aiPrompt.trim()}
                        className="p-1.5 bg-[#333537] hover:bg-[#4285F4] rounded-lg transition-colors text-white disabled:opacity-50"
                    >
                        <Check className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>

        {/* Preview Mode */}
        {activeTab === 'preview' && (
             <div className="absolute inset-0 overflow-y-auto custom-scrollbar bg-[#1E1F20]">
                {isWeb ? (
                    <div className="w-full h-full bg-[#131314] flex flex-col">
                        <div className="flex-1 bg-white relative">
                             <iframe 
                                title="Web Preview"
                                className="w-full h-full bg-white"
                                srcDoc={getIframeContent(localContent)}
                                sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
                             />
                        </div>
                    </div>
                ) : state.mode === 'code' ? (
                     <div className="p-8">
                         <div className="rounded-xl overflow-hidden border border-white/10 bg-[#1E1F20] shadow-2xl">
                             <div className="flex items-center justify-between px-4 py-2 bg-[#2D2E30] border-b border-white/5">
                                <span className="text-xs font-mono text-[#8E9196]">output.{state.language === 'javascript' ? 'js' : state.language === 'python' ? 'py' : 'txt'}</span>
                                <Play className="w-3 h-3 text-emerald-400" />
                             </div>
                             <SyntaxHighlighter
                                language={state.language}
                                style={vscDarkPlus}
                                customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent', fontSize: '13px' }}
                                showLineNumbers={true}
                             >
                                {localContent}
                             </SyntaxHighlighter>
                         </div>
                     </div>
                ) : (
                    <div className="prose prose-invert prose-lg max-w-3xl mx-auto p-8">
                        {/* Simple markdown rendering for document preview */}
                        {localContent.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                    </div>
                )}
             </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="h-8 flex items-center justify-between px-4 bg-[#1E1F20] border-t border-white/5 text-[10px] text-[#8E9196] flex-shrink-0">
         <div className="flex items-center gap-3">
             <span>{localContent.length} chars</span>
             <span>{localContent.split('\n').length} lines</span>
         </div>
         <div className="flex items-center gap-2">
             {isGenerating && (
                 <span className="flex items-center gap-1.5 text-[#A8C7FA]">
                     <span className="w-1.5 h-1.5 rounded-full bg-[#A8C7FA] animate-pulse"></span>
                     Writing...
                 </span>
             )}
             <span className="uppercase">{state.language}</span>
         </div>
      </div>
    </div>
  );
};

export default Canvas;