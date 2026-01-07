
import { useState } from 'react';
import { Message, ModelType, Attachment } from '../types';
import { ToolConfig } from '../services/geminiService';
import { generateChatTitle } from '../services/memoryService';
import { DEFAULT_MODEL, DEFAULT_SYSTEM_INSTRUCTION } from '../constants';
import { useChatStore } from './useChatStore';
import { useChatStream } from './useChatStream';
import { useChatMemory } from './useChatMemory';

export const useChat = () => {
  // Use the store for data persistence and session management
  const {
    sessions,
    setSessions,
    currentSessionId,
    setCurrentSessionId,
    userMemory,
    setUserMemory,
    createNewSession,
    forkSession,
    clearHistory,
    exportData,
    importData
  } = useChatStore();

  const [toolConfig, setToolConfig] = useState<ToolConfig>({
    useGoogleSearch: false,
    useGoogleMaps: false,
    useSmartTools: false,
    useDeepResearch: false,
    useYouTube: false,
    useDataViz: false,
    useCanvas: false
  });

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession ? currentSession.messages : [];

  // --- Hook Composition ---
  
  // 1. Streaming & Execution Logic
  const { isGenerating, executeGeneration } = useChatStream(
      setSessions,
      currentSessionId,
      userMemory
  );

  // 2. Background Memory Logic
  useChatMemory(
      currentSession,
      userMemory,
      setUserMemory,
      setSessions,
      isGenerating
  );

  // --- Actions ---

  const sendMessage = async (
      text: string, 
      attachments: Attachment[] = [], 
      model: ModelType = DEFAULT_MODEL,
      systemInstruction: string = DEFAULT_SYSTEM_INSTRUCTION,
      enableCrossReference: boolean = false
    ) => {
    if (!currentSessionId) return;

    // Auto-titling for new chats
    const isFirstMessage = messages.length === 0;
    if (isFirstMessage) {
        generateChatTitle(text).then((newTitle) => {
            if (newTitle) {
                setSessions(prev => prev.map(s => 
                    s.id === currentSessionId ? { ...s, title: newTitle.replace(/^["']|["']$/g, '') } : s
                ));
            }
        });
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      attachments,
      timestamp: Date.now()
    };

    // Optimistic Update: Add User Message
    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        return {
          ...session,
          messages: [...session.messages, userMessage],
          title: session.messages.length === 0 ? (text.slice(0, 30) || 'New Conversation') : session.title,
          lastModified: Date.now()
        };
      }
      return session;
    }));

    // Optimistic Update: Add Loading Message
    const aiMessageId = (Date.now() + 1).toString();
    const loadingMessage: Message = {
      id: aiMessageId,
      role: 'model',
      isLoading: true,
      timestamp: Date.now()
    };

    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, loadingMessage] } : s));

    const history = [...messages, userMessage];

    // Build Cross-Session Context
    let crossSessionContext = undefined;
    if (enableCrossReference) {
        const otherSessions = sessions
            .filter(s => s.id !== currentSessionId && s.summary)
            .sort((a, b) => b.lastModified - a.lastModified)
            .slice(0, 10);
            
        if (otherSessions.length > 0) {
            crossSessionContext = otherSessions
                .map(s => `[Chat ID: ${s.id} | Title: "${s.title}"]\nSummary: ${s.summary}`)
                .join('\n\n');
        }
    }

    const activeSummary = sessions.find(s => s.id === currentSessionId)?.summary;

    await executeGeneration(
        text, 
        attachments, 
        messages, 
        model, 
        toolConfig, 
        systemInstruction, 
        crossSessionContext, 
        aiMessageId,
        activeSummary
    );
  };

  const regenerateLastResponse = async (model: ModelType, systemInstruction: string) => {
      if (!currentSessionId || isGenerating) return;
      
      const session = sessions.find(s => s.id === currentSessionId);
      if (!session || session.messages.length === 0) return;

      const lastMessage = session.messages[session.messages.length - 1];
      if (lastMessage.role !== 'model') return;

      const previousUserMessage = session.messages[session.messages.length - 2];
      if (!previousUserMessage || previousUserMessage.role !== 'user') {
          return;
      }

      const historyWithoutLastAi = session.messages.slice(0, -1);
      const historyForApi = session.messages.slice(0, -2);
      const newAiMessageId = Date.now().toString();

      // Reset UI state for regeneration
      setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
              return {
                  ...s,
                  messages: [
                      ...historyWithoutLastAi,
                      {
                          id: newAiMessageId,
                          role: 'model',
                          isLoading: true,
                          timestamp: Date.now()
                      }
                  ]
              };
          }
          return s;
      }));

      await executeGeneration(
          previousUserMessage.text || '', 
          previousUserMessage.attachments || [], 
          historyForApi, 
          model, 
          toolConfig,
          systemInstruction, 
          undefined, 
          newAiMessageId,
          session.summary
      );
  };

  const editLastUserMessage = async (newText: string, model: ModelType, systemInstruction: string) => {
    if (!currentSessionId || isGenerating) return;

    const session = sessions.find(s => s.id === currentSessionId);
    if (!session || session.messages.length === 0) return;

    const reversedMessages = [...session.messages].reverse();
    const lastUserIndexReversed = reversedMessages.findIndex(m => m.role === 'user');
    
    if (lastUserIndexReversed === -1) return;

    const lastUserIndex = session.messages.length - 1 - lastUserIndexReversed;
    const historyToKeep = session.messages.slice(0, lastUserIndex);
    const originalUserMessage = session.messages[lastUserIndex];

    setSessions(prev => prev.map(s => {
        if(s.id === currentSessionId) {
            return { ...s, messages: historyToKeep };
        }
        return s;
    }));
    
    const userMessage: Message = {
      ...originalUserMessage,
      id: Date.now().toString(),
      text: newText,
      timestamp: Date.now()
    };

    const aiMessageId = (Date.now() + 1).toString();
    const loadingMessage: Message = {
        id: aiMessageId,
        role: 'model',
        isLoading: true,
        timestamp: Date.now()
    };

    setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
            return {
                ...s,
                messages: [...historyToKeep, userMessage, loadingMessage]
            };
        }
        return s;
    }));

    await executeGeneration(
        newText, 
        userMessage.attachments || [], 
        historyToKeep, 
        model, 
        toolConfig,
        systemInstruction, 
        undefined, 
        aiMessageId,
        session.summary
    );
  };

  return {
    sessions,
    currentSessionId,
    currentSession,
    messages,
    isGenerating,
    toolConfig,
    setToolConfig,
    createNewSession,
    setCurrentSessionId,
    sendMessage,
    regenerateLastResponse,
    editLastUserMessage,
    forkSession,
    clearHistory,
    exportData,
    importData
  };
};
