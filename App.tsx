
import React, { useEffect, useRef } from 'react';
import GlobalOverlays from './components/layout/GlobalOverlays';
import ChatWorkspace from './components/layout/ChatWorkspace';

// Hooks
import { useChat } from './hooks/useChat';
import { useAudio } from './hooks/useAudio';
import { useToast } from './hooks/useToast';
import { useAppSettings } from './hooks/useAppSettings';
import { useCanvasManager } from './hooks/useCanvasManager';

import { ModelType } from './types';
import { ToolConfig } from './services/geminiService';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const App: React.FC = () => {
  // --- 1. Domain Logic & State Management ---
  
  // App Settings & Layout
  const settings = useAppSettings();

  // Chat Logic
  const chat = useChat();

  // Canvas Logic (Depends on chat messages)
  const canvas = useCanvasManager(chat.messages);

  // UI Utilities
  const { toast, showToast, hideToast } = useToast();
  
  // Audio Logic
  const audio = useAudio(settings.preferredVoiceURI);
  const lastReadMessageIdRef = useRef<string | null>(null);

  // --- 2. Effects & orchestrators ---

  // Initialize Session
  useEffect(() => {
    if (chat.sessions.length === 0) {
        chat.createNewSession();
    }
  }, [chat.sessions.length, chat.createNewSession]);

  // Auto-read logic
  useEffect(() => {
    // Only read if auto-read is on, we have messages, and generation is completely finished
    if (settings.isAutoRead && chat.messages.length > 0 && !chat.isGenerating) {
        const lastMsg = chat.messages[chat.messages.length - 1];
        // Ensure it's a model message, not loading, has text, and hasn't been read yet
        if (lastMsg.role === 'model' && !lastMsg.isLoading && lastMsg.text && lastMsg.id !== lastReadMessageIdRef.current) {
            lastReadMessageIdRef.current = lastMsg.id;
            // Ensure we don't try to read empty text or extremely short glitches
            if (lastMsg.text.trim().length > 0) {
               audio.playMessage(lastMsg.text);
            }
        }
    }
  }, [chat.messages, settings.isAutoRead, audio.playMessage, chat.isGenerating]);

  // --- 3. Interaction Handlers ---

  const handleSuggestionClick = (text: string, model?: ModelType, configChange?: Partial<ToolConfig>) => {
    if (model) settings.setCurrentModel(model);
    if (configChange) chat.setToolConfig(prev => ({ ...prev, ...configChange }));
    settings.setInputOverride(text);
  };

  const handleToolToggle = (key: keyof ToolConfig) => {
     chat.setToolConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Bridge between Canvas and Chat
  const handleCanvasAiRequest = (prompt: string, currentSelection: string) => {
      // Ensure canvas tool is active so it can use 'edit_canvas'
      chat.setToolConfig(prev => ({ ...prev, useCanvas: true }));
      
      const contextPrompt = canvas.composeAiEditPrompt(prompt, currentSelection);
      chat.sendMessage(contextPrompt, null, settings.currentModel, settings.systemInstruction, settings.isCrossReferenceEnabled);
  };

  return (
    <div className="flex h-screen overflow-hidden text-[#E3E3E3] font-sans bg-transparent">
      
      {/* Layer 1: Global Modals, Toasts, and Overlays */}
      <GlobalOverlays 
        settings={settings}
        audio={audio}
        toast={toast}
        onHideToast={hideToast}
        chatHandlers={{
          clearHistory: chat.clearHistory,
          exportData: chat.exportData,
          importData: chat.importData
        }}
        messages={chat.messages}
      />

      {/* Layer 2: Main Application Workspace */}
      <ChatWorkspace 
        settings={settings}
        chat={chat}
        canvas={canvas}
        audio={audio}
        handlers={{
          onSuggestionClick: handleSuggestionClick,
          handleToolToggle: handleToolToggle,
          handleCanvasAiRequest: handleCanvasAiRequest,
          onError: (msg) => showToast(msg, 'error'),
          onRegenerate: () => chat.regenerateLastResponse(settings.currentModel, settings.systemInstruction),
          onEditMessage: (newText) => chat.editLastUserMessage(newText, settings.currentModel, settings.systemInstruction),
          onResetTools: () => chat.setToolConfig({
             useGoogleSearch: false, useGoogleMaps: false, useSmartTools: false, 
             useDeepResearch: false, useYouTube: false, useDataViz: false, useCanvas: false
          })
        }}
      />
    </div>
  );
};

export default App;
