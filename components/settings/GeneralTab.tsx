
import React from 'react';
import { Key, ExternalLink, GitBranch, FileText, RotateCcw, Moon, Sun, Laptop } from 'lucide-react';
import { DEFAULT_SYSTEM_INSTRUCTION } from '../../constants';
import { Theme } from '../../hooks/useAppSettings';

interface GeneralTabProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  isCrossReferenceEnabled: boolean;
  onCrossReferenceChange: (enabled: boolean) => void;
  systemInstruction: string;
  onSystemInstructionChange: (instruction: string) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const GeneralTab: React.FC<GeneralTabProps> = ({
  apiKey,
  onApiKeyChange,
  isCrossReferenceEnabled,
  onCrossReferenceChange,
  systemInstruction,
  onSystemInstructionChange,
  theme,
  onThemeChange
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Theme Section */}
      <div className="space-y-4">
         <div className="flex items-center gap-3 text-[var(--text-primary)]">
            <Sun className="w-5 h-5 text-[var(--accent-blue)]" />
            <div>
              <h3 className="font-medium text-base">Appearance</h3>
              <p className="text-xs text-[var(--text-secondary)]">Customize interface theme</p>
            </div>
         </div>
         
         <div className="p-1.5 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] inline-flex">
            <button
                onClick={() => onThemeChange('system')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${theme === 'system' ? 'bg-[var(--surface-highlight)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]'}`}
            >
                <Laptop className="w-4 h-4" />
                System
            </button>
            <button
                onClick={() => onThemeChange('light')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${theme === 'light' ? 'bg-[var(--surface-highlight)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]'}`}
            >
                <Sun className="w-4 h-4" />
                Light
            </button>
            <button
                onClick={() => onThemeChange('dark')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${theme === 'dark' ? 'bg-[var(--surface-highlight)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]'}`}
            >
                <Moon className="w-4 h-4" />
                Dark
            </button>
         </div>
      </div>

      <div className="h-px bg-[var(--border-color)]" />

      {/* API Key Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-[var(--text-primary)]">
          <Key className="w-5 h-5 text-[var(--text-primary)]" />
          <div>
            <h3 className="font-medium text-base">API Key</h3>
            <p className="text-xs text-[var(--text-secondary)]">Required to access Gemini models</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] space-y-3">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="Paste your API key here..."
            className="w-full px-4 py-3 bg-[var(--surface-highlight)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] transition-all"
          />

          <div className="flex justify-end">
            <a
              href="https://aistudio.google.com/app/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] text-[var(--accent-blue)] hover:text-[var(--accent-blue)]/80 transition-colors"
            >
              <span>Get a key here</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="h-px bg-[var(--border-color)]" />

      {/* Cross Reference Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-[var(--surface-highlight)]">
            <GitBranch className="w-4 h-4 text-[var(--accent-blue)]" />
          </div>
          <div>
            <div className="text-sm font-medium text-[var(--text-primary)]">Cross-Message Reference</div>
            <div className="text-xs text-[var(--text-secondary)]">Allow AI to see summaries of your other chats</div>
          </div>
        </div>
        <button
          onClick={() => onCrossReferenceChange(!isCrossReferenceEnabled)}
          className={`w-11 h-6 rounded-full transition-colors relative ${isCrossReferenceEnabled ? 'bg-[var(--accent-blue)]' : 'bg-[var(--border-highlight)]'}`}
        >
          <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${isCrossReferenceEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      <div className="h-px bg-[var(--border-color)]" />

      {/* System Instructions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[var(--text-primary)]">
            <FileText className="w-5 h-5 text-[#34A853]" />
            <div>
              <h3 className="font-medium text-base">System Persona</h3>
              <p className="text-xs text-[var(--text-secondary)]">Define how Gemini behaves</p>
            </div>
          </div>
          <button
            onClick={() => onSystemInstructionChange(DEFAULT_SYSTEM_INSTRUCTION)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-highlight)] hover:bg-[var(--hover-bg)] transition-colors border border-[var(--border-color)]"
            title="Reset to default"
          >
            <RotateCcw className="w-3 h-3 text-[var(--accent-blue)]" />
            <span className="text-[11px] text-[var(--text-primary)]">Reset</span>
          </button>
        </div>

        <div className="p-1 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)]">
          <textarea
            value={systemInstruction}
            onChange={(e) => onSystemInstructionChange(e.target.value)}
            placeholder="e.g. You are a senior software engineer..."
            className="w-full h-40 bg-transparent border-none rounded-lg p-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-0 resize-none custom-scrollbar leading-relaxed font-mono"
          />
        </div>
      </div>
    </div>
  );
};

export default GeneralTab;
