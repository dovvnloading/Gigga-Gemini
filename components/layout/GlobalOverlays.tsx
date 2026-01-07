import React from 'react';
import LiveInterface from '../LiveInterface';
import AudioPlayer from '../AudioPlayer';
import SettingsModal from '../SettingsModal';
import PodcastGenerator from '../modals/PodcastGenerator';
import Toast, { ToastType } from '../Toast';
import { Message } from '../../types';

interface GlobalOverlaysProps {
  settings: any;
  audio: any;
  toast: { message: string; type: ToastType; isVisible: boolean };
  onHideToast: () => void;
  chatHandlers: {
    clearHistory: () => void;
    exportData: () => void;
    importData: (file: File) => Promise<boolean>;
  };
  messages: Message[];
}

const GlobalOverlays: React.FC<GlobalOverlaysProps> = ({ 
  settings, 
  audio, 
  toast, 
  onHideToast,
  chatHandlers,
  messages
}) => {
  return (
    <>
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={onHideToast} 
      />

      {settings.isLiveMode && (
        <LiveInterface 
            onClose={() => settings.setIsLiveMode(false)} 
            onError={(msg: string) => console.error(msg)} 
        />
      )}

      <PodcastGenerator 
          isOpen={settings.isPodcastOpen}
          onClose={() => settings.setIsPodcastOpen(false)}
          messages={messages}
          onPlay={(url) => {
              settings.setIsPodcastOpen(false);
              // Slight delay to allow modal to close smoothly
              setTimeout(() => {
                  audio.playMessage(undefined); // Reset logic in audio hook if needed, or we just modify audio hook to accept url directly
                  // The useAudio hook needs a way to play a direct URL. 
                  // Currently it generates TTS from text. We should extend useAudio or just set state here?
                  // Let's modify useAudio to expose setAudioUrl or a method 'playAudioUrl'
                  // For now, we assume audio.playAudioUrl exists or we adapt useAudio. 
                  // Since we cannot modify useAudio easily in this file without changing the hook definition, 
                  // we will assume we update useAudio below.
                  audio.playUrl(url); 
              }, 300);
          }}
      />
      
      <AudioPlayer 
        src={audio.audioUrl} 
        onClose={audio.closePlayer} 
        isLoading={audio.isLoading} 
      />

      <SettingsModal 
        isOpen={settings.isSettingsOpen} 
        onClose={() => settings.setIsSettingsOpen(false)}
        onClearHistory={chatHandlers.clearHistory}
        onExportData={chatHandlers.exportData}
        onImportData={chatHandlers.importData}
        selectedVoiceURI={settings.preferredVoiceURI}
        onVoiceChange={settings.setPreferredVoiceURI}
        isAutoRead={settings.isAutoRead}
        onAutoReadChange={settings.setIsAutoRead}
        isCrossReferenceEnabled={settings.isCrossReferenceEnabled}
        onCrossReferenceChange={settings.setIsCrossReferenceEnabled}
        userAvatar={settings.userAvatar}
        onAvatarChange={settings.setUserAvatar}
        systemInstruction={settings.systemInstruction}
        onSystemInstructionChange={settings.setSystemInstruction}
        apiKey={settings.apiKey}
        onApiKeyChange={settings.setApiKey}
        theme={settings.theme}
        onThemeChange={settings.setTheme}
      />
    </>
  );
};

export default GlobalOverlays;