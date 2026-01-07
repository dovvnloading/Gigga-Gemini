import { useState, useEffect } from 'react';
import { DEFAULT_USER_AVATAR, DEFAULT_SYSTEM_INSTRUCTION } from '../constants';
import { ModelType } from '../types';
import { DEFAULT_MODEL } from '../constants';

export type Theme = 'light' | 'dark' | 'system';

export const useAppSettings = () => {
  // Transient App State
  const [currentModel, setCurrentModel] = useState<ModelType>(DEFAULT_MODEL);
  const [preferredVoiceURI, setPreferredVoiceURI] = useState<string>('Kore');
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isPodcastOpen, setIsPodcastOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAutoRead, setIsAutoRead] = useState(false);
  const [isCrossReferenceEnabled, setIsCrossReferenceEnabled] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('gemini_theme') as Theme) || 'system';
    }
    return 'system';
  });

  // User Profile & Config
  const [userAvatar, setUserAvatar] = useState<string>(DEFAULT_USER_AVATAR);
  const [systemInstruction, setSystemInstruction] = useState<string>(DEFAULT_SYSTEM_INSTRUCTION);
  const [inputOverride, setInputOverride] = useState<string | undefined>(undefined);
  
  // API Key Configuration
  const [apiKey, setApiKeyState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('gemini_api_key') || '';
    }
    return '';
  });

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    localStorage.setItem('gemini_api_key', key);
  };

  // Layout State
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
     if (typeof window !== 'undefined') {
         return window.innerWidth >= 768;
     }
     return false;
  });

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const handleModelChange = (model: ModelType) => {
    if (model === ModelType.LIVE) {
        setIsLiveMode(true);
    } else {
        setCurrentModel(model);
    }
  };

  // Theme Logic
  useEffect(() => {
    localStorage.setItem('gemini_theme', theme);
    const root = document.documentElement;
    
    const applyTheme = (t: 'light' | 'dark') => {
        root.setAttribute('data-theme', t);
    };

    if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        applyTheme(systemTheme);
        
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = (e: MediaQueryListEvent) => applyTheme(e.matches ? 'dark' : 'light');
        mediaQuery.addEventListener('change', listener);
        
        return () => mediaQuery.removeEventListener('change', listener);
    } else {
        applyTheme(theme);
    }
  }, [theme]);

  return {
    // State
    currentModel,
    preferredVoiceURI,
    isLiveMode,
    isPodcastOpen,
    isSettingsOpen,
    isAutoRead,
    isCrossReferenceEnabled,
    userAvatar,
    systemInstruction,
    inputOverride,
    isSidebarOpen,
    apiKey,
    theme,
    
    // Setters
    setCurrentModel,
    setPreferredVoiceURI,
    setIsLiveMode,
    setIsPodcastOpen,
    setIsSettingsOpen,
    setIsAutoRead,
    setIsCrossReferenceEnabled,
    setUserAvatar,
    setSystemInstruction,
    setInputOverride,
    setIsSidebarOpen,
    setApiKey,
    setTheme,

    // Actions
    toggleSidebar,
    handleModelChange
  };
};