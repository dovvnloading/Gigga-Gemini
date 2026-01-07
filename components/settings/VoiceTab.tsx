
import React from 'react';
import { Sparkles, Mic, Volume2 } from 'lucide-react';

interface VoiceTabProps {
  isAutoRead: boolean;
  onAutoReadChange: (enabled: boolean) => void;
  selectedVoiceURI: string | null;
  onVoiceChange: (voiceURI: string) => void;
}

const GEMINI_VOICES = [
  { name: 'Puck', value: 'Puck', desc: 'Neutral, Balanced' },
  { name: 'Charon', value: 'Charon', desc: 'Deep, Authoritative' },
  { name: 'Kore', value: 'Kore', desc: 'Calm, Soothing' },
  { name: 'Fenrir', value: 'Fenrir', desc: 'Energetic, Fast' },
  { name: 'Zephyr', value: 'Zephyr', desc: 'Soft, Gentle' },
];

const VoiceTab: React.FC<VoiceTabProps> = ({
  isAutoRead,
  onAutoReadChange,
  selectedVoiceURI,
  onVoiceChange,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Auto-Read Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-[var(--surface-highlight)]">
            <Sparkles className="w-4 h-4 text-[var(--text-primary)]" />
          </div>
          <div>
            <div className="text-sm font-medium text-[var(--text-primary)]">Auto-read Responses</div>
            <div className="text-xs text-[var(--text-secondary)]">Automatically play TTS when Gemini replies</div>
          </div>
        </div>
        <button
          onClick={() => onAutoReadChange(!isAutoRead)}
          className={`w-11 h-6 rounded-full transition-colors relative ${isAutoRead ? 'bg-[var(--accent-blue)]' : 'bg-[var(--border-highlight)]'}`}
        >
          <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${isAutoRead ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 text-[var(--text-primary)]">
          <Mic className="w-5 h-5 text-[var(--accent-purple)]" />
          <div>
            <h3 className="font-medium text-base">Gemini Voice</h3>
            <p className="text-xs text-[var(--text-secondary)]">Choose the voice for TTS & Live mode</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {GEMINI_VOICES.map((voice) => (
            <button
              key={voice.value}
              onClick={() => onVoiceChange(voice.value)}
              className={`
                w-full flex items-center justify-between px-4 py-4 rounded-xl border transition-all group
                ${selectedVoiceURI === voice.value
                  ? 'bg-[var(--gemini-grad-start)] border-[var(--accent-blue)] text-[var(--accent-blue)] shadow-[0_0_20px_rgba(66,133,244,0.15)]'
                  : 'bg-[var(--surface-color)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--hover-bg)] hover:border-[var(--border-highlight)]'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${selectedVoiceURI === voice.value ? 'bg-[var(--accent-blue)]/20' : 'bg-[var(--surface-highlight)]'}`}>
                  <Volume2 className={`w-4 h-4 ${selectedVoiceURI === voice.value ? 'text-[var(--accent-blue)]' : 'text-[var(--text-secondary)]'}`} />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">{voice.name}</div>
                  <div className="text-xs opacity-60">{voice.desc}</div>
                </div>
              </div>
              {selectedVoiceURI === voice.value && (
                <div className="w-2 h-2 rounded-full bg-[var(--accent-blue)]"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceTab;
