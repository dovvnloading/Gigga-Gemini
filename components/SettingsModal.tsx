
import React, { useState } from 'react';
import { X, User, Database, Mic, Settings, Info } from 'lucide-react';
import GeneralTab from './settings/GeneralTab';
import ProfileTab from './settings/ProfileTab';
import VoiceTab from './settings/VoiceTab';
import DataTab from './settings/DataTab';
import InfoTab from './settings/InfoTab';
import { Theme } from '../hooks/useAppSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearHistory: () => void;
  onExportData: () => void;
  onImportData: (file: File) => Promise<boolean>;
  selectedVoiceURI: string | null;
  onVoiceChange: (voiceURI: string) => void;
  isAutoRead: boolean;
  onAutoReadChange: (enabled: boolean) => void;
  isCrossReferenceEnabled: boolean;
  onCrossReferenceChange: (enabled: boolean) => void;
  userAvatar: string;
  onAvatarChange: (url: string) => void;
  systemInstruction: string;
  onSystemInstructionChange: (instruction: string) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

type SettingsTab = 'general' | 'profile' | 'voice' | 'data' | 'info';

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onClearHistory,
  onExportData,
  onImportData,
  selectedVoiceURI,
  onVoiceChange,
  isAutoRead,
  onAutoReadChange,
  isCrossReferenceEnabled,
  onCrossReferenceChange,
  userAvatar,
  onAvatarChange,
  systemInstruction,
  onSystemInstructionChange,
  apiKey,
  onApiKeyChange,
  theme,
  onThemeChange
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  if (!isOpen) return null;

  const renderContent = () => {
    switch (activeTab) {
        case 'general':
            return (
                <GeneralTab 
                  apiKey={apiKey}
                  onApiKeyChange={onApiKeyChange}
                  isCrossReferenceEnabled={isCrossReferenceEnabled}
                  onCrossReferenceChange={onCrossReferenceChange}
                  systemInstruction={systemInstruction}
                  onSystemInstructionChange={onSystemInstructionChange}
                  theme={theme}
                  onThemeChange={onThemeChange}
                />
            );

        case 'profile':
            return (
                <ProfileTab 
                  userAvatar={userAvatar}
                  onAvatarChange={onAvatarChange}
                />
            );

        case 'voice':
            return (
                <VoiceTab 
                  isAutoRead={isAutoRead}
                  onAutoReadChange={onAutoReadChange}
                  selectedVoiceURI={selectedVoiceURI}
                  onVoiceChange={onVoiceChange}
                />
            );

        case 'data':
            return (
                <DataTab 
                  onExportData={onExportData}
                  onImportData={onImportData}
                  onClearHistory={onClearHistory}
                  onCloseModal={onClose}
                />
            );
        
        case 'info':
            return <InfoTab />;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex h-[650px] max-h-[90vh]">
        
        {/* Left Sidebar */}
        <div className="w-64 bg-[var(--surface-color)] border-r border-[var(--border-color)] flex flex-col p-4">
            <div className="px-2 pb-6 pt-2">
                <h2 className="text-xl font-display font-medium text-[var(--text-primary)]">Settings</h2>
            </div>
            
            <nav className="space-y-1 flex-1">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'general' ? 'bg-[var(--surface-highlight)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]'}`}
                >
                    <Settings className="w-4 h-4" />
                    General
                </button>
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-[var(--surface-highlight)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]'}`}
                >
                    <User className="w-4 h-4" />
                    Profile
                </button>
                <button
                    onClick={() => setActiveTab('voice')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'voice' ? 'bg-[var(--surface-highlight)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]'}`}
                >
                    <Mic className="w-4 h-4" />
                    Voice
                </button>
                <button
                    onClick={() => setActiveTab('data')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'data' ? 'bg-[var(--surface-highlight)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]'}`}
                >
                    <Database className="w-4 h-4" />
                    Data
                </button>
                <button
                    onClick={() => setActiveTab('info')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'info' ? 'bg-[var(--surface-highlight)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]'}`}
                >
                    <Info className="w-4 h-4" />
                    About
                </button>
            </nav>

            <div className="mt-auto px-4 py-4 border-t border-[var(--border-color)]">
                <div className="text-[10px] text-[var(--text-secondary)]">
                    Gemini v1.3
                </div>
            </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-color)]">
             {/* Header Mobile/Desktop */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] bg-[var(--glass-surface)] backdrop-blur-md z-10">
                 <h2 className="text-lg font-medium text-[var(--text-primary)] capitalize">{activeTab}</h2>
                 <button onClick={onClose} className="p-2 hover:bg-[var(--hover-bg)] rounded-full transition-colors text-[var(--text-primary)]">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {renderContent()}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;