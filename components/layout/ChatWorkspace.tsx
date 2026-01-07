import React from 'react';
import Sidebar from '../Sidebar';
import Header from '../Header';
import WelcomeScreen from '../WelcomeScreen';
import ChatList from '../ChatList';
import Composer from '../Composer';
import Canvas from '../Canvas';
import { ModelType } from '../../types';
import { ToolConfig } from '../../services/geminiService';

interface ChatWorkspaceProps {
  settings: any;
  chat: any;
  canvas: any;
  audio: any;
  handlers: {
    onSuggestionClick: (text: string, model?: ModelType, configChange?: Partial<ToolConfig>) => void;
    handleToolToggle: (key: keyof ToolConfig) => void;
    handleCanvasAiRequest: (prompt: string, currentSelection: string) => void;
    onResetTools: () => void;
    onError: (msg: string) => void;
    onRegenerate: () => void;
    onEditMessage: (newText: string) => void;
  };
}

const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  settings,
  chat,
  canvas,
  audio,
  handlers
}) => {
  const hasMessages = chat.messages.length > 0;

  return (
    <>
      <Sidebar 
        isOpen={settings.isSidebarOpen} 
        toggleSidebar={settings.toggleSidebar}
        sessions={chat.sessions}
        currentSessionId={chat.currentSessionId || ''}
        onNewChat={chat.createNewSession}
        onSelectSession={(id: string) => {
            chat.setCurrentSessionId(id);
            if (window.innerWidth < 768) settings.setIsSidebarOpen(false);
        }}
        onOpenSettings={() => settings.setIsSettingsOpen(true)}
      />

      {/* Main Split View */}
      <div className={`flex-1 flex min-w-0 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${settings.isSidebarOpen ? 'md:ml-[280px]' : 'md:ml-[68px]'}`}>
          
          {/* Chat Column */}
          <div className={`flex flex-col relative transition-all duration-500 ease-in-out ${canvas.canvasState.isOpen ? 'w-full md:w-[45%] lg:w-[40%] border-r border-[var(--border-color)] bg-[var(--bg-color)]/50 backdrop-blur-sm' : 'w-full'}`}>
                <Header 
                    onMenuClick={settings.toggleSidebar} 
                    isSidebarOpen={settings.isSidebarOpen}
                    userAvatar={settings.userAvatar}
                    onPodcastClick={() => settings.setIsPodcastOpen(true)}
                    showPodcastButton={hasMessages}
                />

                {/* Scrollable Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth relative">
                    {!hasMessages ? (
                        <WelcomeScreen onSuggestionClick={handlers.onSuggestionClick} />
                    ) : (
                        <ChatList 
                            messages={chat.messages} 
                            onPlayAudio={audio.playMessage}
                            onOpenCanvas={canvas.openCanvas}
                            onRegenerate={handlers.onRegenerate}
                            onFork={(msgId) => chat.currentSessionId && chat.forkSession(chat.currentSessionId, msgId)}
                            onEditMessage={handlers.onEditMessage}
                            userAvatar={settings.userAvatar}
                        />
                    )}
                </div>

                {/* Input Area */}
                <div className={`${hasMessages ? 'sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--bg-color)] via-[var(--bg-color)]/80 to-transparent z-30' : 'w-full px-4 pb-8 max-w-[780px] mx-auto'}`}>
                    <div className={`${hasMessages ? 'max-w-[800px] mx-auto w-full' : ''}`}>
                        <Composer 
                            onSend={(text, attachments, model) => chat.sendMessage(text, attachments, model, settings.systemInstruction, settings.isCrossReferenceEnabled)}
                            isGenerating={chat.isGenerating}
                            currentModel={settings.currentModel}
                            onModelChange={settings.handleModelChange}
                            toolConfig={chat.toolConfig}
                            onToolToggle={handlers.handleToolToggle}
                            onResetTools={handlers.onResetTools}
                            hasMessages={hasMessages}
                            inputOverride={settings.inputOverride}
                            onError={handlers.onError}
                        />
                         {hasMessages && (
                            <div className="text-center mt-3 text-[11px] text-[var(--text-secondary)]">
                                Gemini can make mistakes, so double-check it.
                            </div>
                        )}
                    </div>
                </div>
          </div>

          {/* Canvas Column */}
          {canvas.canvasState.isOpen && (
              <Canvas 
                 isOpen={canvas.canvasState.isOpen}
                 state={canvas.canvasState}
                 onClose={canvas.closeCanvas}
                 onUpdateContent={canvas.updateContent}
                 onAiEditRequest={handlers.handleCanvasAiRequest}
                 isGenerating={chat.isGenerating}
              />
          )}
      </div>
    </>
  );
};

export default ChatWorkspace;