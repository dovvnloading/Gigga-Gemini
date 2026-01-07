
import { useState, useEffect, useCallback } from 'react';
import { ChatSession, GeminiBackup, ModelType } from '../types';
import { DEFAULT_MODEL } from '../constants';

const STORAGE_KEY = 'gemini_chat_sessions';
const MEMORY_KEY = 'gemini_user_memory';

export const useChatStore = () => {
  // --- State Initialization ---
  
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load chat history:", e);
      return [];
    }
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed[0].id;
            }
        }
    } catch (e) {}
    return null;
  });

  const [userMemory, setUserMemory] = useState<string[]>(() => {
    const saved = localStorage.getItem(MEMORY_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // --- Persistence Effects ---

  useEffect(() => {
    try {
        if (sessions.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
        } else {
            if (localStorage.getItem(STORAGE_KEY)) {
                 localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
            }
        }
    } catch (e) {
        console.error("Failed to save chat history (Storage likely full):", e);
    }
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(userMemory));
  }, [userMemory]);

  // --- Actions ---

  const createNewSession = useCallback((modelInput?: ModelType | unknown) => {
    const model = (typeof modelInput === 'string') ? (modelInput as ModelType) : DEFAULT_MODEL;

    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      model,
      lastModified: Date.now(),
      summary: ''
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  }, []);

  const forkSession = useCallback((sessionId: string, messageId: string) => {
    const newId = Date.now().toString();
    
    setSessions(prev => {
        const sourceSession = prev.find(s => s.id === sessionId);
        if (!sourceSession) return prev;

        const msgIndex = sourceSession.messages.findIndex(m => m.id === messageId);
        if (msgIndex === -1) return prev;

        // Deep copy messages up to the fork point to ensure independence
        const newMessages = JSON.parse(JSON.stringify(sourceSession.messages.slice(0, msgIndex + 1)));
        
        const newTitle = `Forked from: ${sourceSession.title}`;

        const newSession: ChatSession = {
            id: newId,
            title: newTitle,
            messages: newMessages,
            model: sourceSession.model,
            lastModified: Date.now(),
            summary: sourceSession.summary
        };

        return [newSession, ...prev];
    });

    setCurrentSessionId(newId);
  }, []);

  const clearHistory = useCallback(() => {
    setSessions([]);
    localStorage.removeItem(STORAGE_KEY);
    createNewSession();
  }, [createNewSession]);

  const exportData = useCallback(() => {
    const backup: GeminiBackup = {
      version: 1,
      exportDate: Date.now(),
      sessions: sessions,
      userMemory: userMemory
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_hist_${new Date().toISOString().slice(0, 10)}.gemini`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [sessions, userMemory]);

  const importData = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const backup: GeminiBackup = JSON.parse(content);
          
          if (!backup.sessions || !Array.isArray(backup.sessions)) {
            throw new Error("Invalid file format");
          }

          setSessions(backup.sessions);
          setUserMemory(backup.userMemory || []);
          
          if (backup.sessions.length > 0) {
            setCurrentSessionId(backup.sessions[0].id);
          } else {
            createNewSession();
          }
          
          resolve(true);
        } catch (err) {
          console.error("Import failed:", err);
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsText(file);
    });
  }, [createNewSession]);

  return {
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
  };
};
