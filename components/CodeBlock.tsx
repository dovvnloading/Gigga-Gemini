import React, { useState } from 'react';
import { Check, Copy, Terminal, ExternalLink, Maximize2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  language: string;
  value: string;
  onOpenInCanvas?: (content: string, language: string) => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value, onOpenInCanvas }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-4 rounded-xl overflow-hidden border border-white/10 bg-[#1E1F20] shadow-lg transition-all hover:border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2D2E30]/50 border-b border-white/5">
        <div className="flex items-center gap-2">
           <Terminal className="w-3.5 h-3.5 text-[#8E9196]" />
           <span className="text-xs font-medium text-[#E3E3E3] uppercase tracking-wider">{language || 'text'}</span>
        </div>
        <div className="flex items-center gap-1">
           {onOpenInCanvas && (
               <button 
                  onClick={() => onOpenInCanvas(value, language)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[#A8C7FA] hover:bg-[#A8C7FA]/10 transition-colors text-xs font-medium"
               >
                  <Maximize2 className="w-3 h-3" />
                  <span>Canvas</span>
               </button>
           )}
           <div className="w-px h-3 bg-white/10 mx-1"></div>
           <button 
              onClick={handleCopy}
              className="p-1.5 text-[#8E9196] hover:text-white rounded-md hover:bg-white/5 transition-colors"
              title="Copy code"
           >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
           </button>
        </div>
      </div>

      {/* Editor Surface */}
      <div className="relative text-sm font-mono overflow-x-auto custom-scrollbar">
         <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            customStyle={{
                margin: 0,
                padding: '1.5rem',
                background: 'transparent',
                fontSize: '13px',
                lineHeight: '1.5',
            }}
            wrapLines={true}
            showLineNumbers={true}
            lineNumberStyle={{ minWidth: '2.5em', paddingRight: '1em', color: '#4b5563', textAlign: 'right' }}
         >
            {value}
         </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;