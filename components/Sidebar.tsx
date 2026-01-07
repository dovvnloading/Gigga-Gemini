import React from 'react';
import { Plus, MessageSquare, Settings, History, PanelLeftClose, PanelLeft } from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  toggleSidebar,
  sessions, 
  currentSessionId, 
  onNewChat, 
  onSelectSession,
  onOpenSettings
}) => {
  return (
    <>
    {/* Overlay for mobile */}
    <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
    />
    
    <div 
      className={`
        fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]
        bg-[var(--glass-surface)] backdrop-blur-2xl border-r border-[var(--glass-border)]
        ${isOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full md:translate-x-0 md:w-[68px]'}
      `}
    >
      {/* Header */}
      <div className={`p-4 flex items-center ${isOpen ? 'justify-between' : 'justify-center'}`}>
        <button 
          onClick={toggleSidebar} 
          className="p-2 rounded-lg hover:bg-[var(--hover-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* New Chat Button */}
      <div className={`px-3 pb-4 ${!isOpen && 'flex justify-center'}`}>
        <button
          onClick={() => onNewChat()}
          className={`
            flex items-center gap-3 transition-all duration-200 text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm
            ${isOpen 
                ? 'w-full px-4 py-3 bg-[var(--surface-highlight)] hover:bg-[var(--active-bg)] rounded-full text-sm font-medium' 
                : 'w-10 h-10 bg-[var(--surface-highlight)] hover:bg-[var(--active-bg)] rounded-full justify-center'
            }
          `}
          title="New Chat"
        >
          <Plus className="w-4 h-4 text-[var(--accent-blue)]" />
          {isOpen && <span className="truncate">New chat</span>}
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
        {isOpen && (
            <div className="px-4 py-2 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider opacity-60 truncate">
            Recent
            </div>
        )}
        
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`
              flex items-center gap-3 transition-all duration-200 group relative
              ${isOpen 
                ? 'w-full text-left px-4 py-2.5 rounded-full text-sm' 
                : 'w-10 h-10 justify-center rounded-full mx-auto'
              }
              ${session.id === currentSessionId ? 'bg-[var(--active-bg)] text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]'}
            `}
            title={!isOpen ? session.title : undefined}
          >
            <MessageSquare className={`w-4 h-4 flex-shrink-0 ${session.id === currentSessionId ? 'text-[var(--accent-blue)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`} />
            {isOpen && <span className="truncate opacity-90">{session.title}</span>}
          </button>
        ))}
        
        {sessions.length === 0 && isOpen && (
          <div className="px-4 py-8 text-center text-[var(--text-secondary)] text-sm flex flex-col items-center gap-2">
            <History className="w-5 h-5 opacity-30" />
            <span>No chat history</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`p-3 mt-auto border-t border-[var(--border-color)] ${!isOpen && 'flex justify-center'}`}>
        <button 
          onClick={onOpenSettings}
          className={`
            flex items-center gap-3 text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-colors group
            ${isOpen ? 'w-full px-4 py-3 rounded-full text-sm' : 'p-2 rounded-lg justify-center'}
          `}
          title="Settings"
        >
          <Settings className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
          {isOpen && <span className="truncate">Settings</span>}
        </button>
      </div>
    </div>
    </>
  );
};

export default Sidebar;