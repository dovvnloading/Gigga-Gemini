
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import CodeBlock from '../CodeBlock';

interface MessageContentProps {
  isLoading?: boolean;
  text?: string;
  onOpenCanvas?: (content: string, language: string) => void;
}

const MessageContent: React.FC<MessageContentProps> = ({ isLoading, text, onOpenCanvas }) => {
  if (isLoading) {
    return (
      <div className="flex gap-1.5 h-6 items-center pt-2">
        <div className="w-2 h-2 bg-[#4285F4] rounded-full animate-[bounce_1s_infinite_-0.3s]"></div>
        <div className="w-2 h-2 bg-[#EA4335] rounded-full animate-[bounce_1s_infinite_-0.15s]"></div>
        <div className="w-2 h-2 bg-[#FBBC05] rounded-full animate-[bounce_1s_infinite]"></div>
        <div className="w-2 h-2 bg-[#34A853] rounded-full animate-[bounce_1s_infinite_0.15s]"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          className="text-[var(--text-primary)] leading-relaxed"
          components={{
              // Links
              a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-[#A8C7FA] hover:underline hover:text-[#D3E3FD] transition-colors font-medium" />,
              
              // Headings
              h1: ({node, ...props}) => <h1 {...props} className="text-2xl font-bold text-[var(--text-primary)] mt-8 mb-4 first:mt-0" />,
              h2: ({node, ...props}) => <h2 {...props} className="text-xl font-bold text-[var(--text-primary)] mt-6 mb-3 first:mt-0" />,
              h3: ({node, ...props}) => <h3 {...props} className="text-lg font-bold text-[var(--text-primary)] mt-5 mb-2 first:mt-0" />,
              h4: ({node, ...props}) => <h4 {...props} className="text-base font-semibold text-[var(--text-primary)] mt-4 mb-2" />,
              
              // Paragraphs (Fixing the stacking issue with margins)
              p: ({node, ...props}) => <p {...props} className="mb-4 last:mb-0 leading-7 text-[var(--text-primary)] opacity-95" />,
              
              // Lists
              ul: ({node, ...props}) => <ul {...props} className="list-disc pl-6 mb-4 space-y-2 marker:text-[var(--text-secondary)]" />,
              ol: ({node, ...props}) => <ol {...props} className="list-decimal pl-6 mb-4 space-y-2 marker:text-[var(--text-secondary)]" />,
              li: ({node, ...props}) => <li {...props} className="pl-1" />,
              
              // Formatting
              strong: ({node, ...props}) => <strong {...props} className="font-bold text-[var(--text-primary)]" />,
              em: ({node, ...props}) => <em {...props} className="italic text-[var(--text-primary)] opacity-80" />,
              blockquote: ({node, ...props}) => <blockquote {...props} className="border-l-4 border-[#A8C7FA]/40 pl-4 italic text-[var(--text-primary)] opacity-80 my-4 py-1" />,
              hr: ({node, ...props}) => <hr {...props} className="my-6 border-[var(--border-color)]" />,
              
              // Code
              code: ({node, className, children, ...props}) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match && !String(children).includes('\n');
                  
                  if (isInline) {
                       return <code className="bg-[var(--surface-highlight)] px-1.5 py-0.5 rounded text-[#A8C7FA] font-mono text-[13px] border border-[var(--border-color)] whitespace-nowrap" {...props}>{children}</code>;
                  }

                  return (
                      <CodeBlock 
                          language={match ? match[1] : ''} 
                          value={String(children).replace(/\n$/, '')}
                          onOpenInCanvas={onOpenCanvas}
                      />
                  );
              },
              
              // Tables (Glassmorphic)
              table: ({node, ...props}) => <div className="overflow-x-auto my-6 rounded-lg border border-[var(--border-color)] shadow-sm"><table {...props} className="w-full text-left border-collapse bg-[var(--surface-color)] bg-opacity-30" /></div>,
              thead: ({node, ...props}) => <thead {...props} className="bg-[var(--surface-highlight)]" />,
              tbody: ({node, ...props}) => <tbody {...props} className="divide-y divide-[var(--border-color)]" />,
              tr: ({node, ...props}) => <tr {...props} className="hover:bg-[var(--hover-bg)] transition-colors" />,
              th: ({node, ...props}) => <th {...props} className="px-4 py-3 text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border-color)]" />,
              td: ({node, ...props}) => <td {...props} className="px-4 py-3 text-sm text-[var(--text-primary)] opacity-90 border-b border-[var(--border-color)] whitespace-pre-wrap leading-relaxed" />,
          }}
      >
          {text || ''}
      </ReactMarkdown>
    </div>
  );
};

export default MessageContent;
