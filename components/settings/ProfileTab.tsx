
import React, { useRef, useState } from 'react';
import { User, Upload, Image as ImageIcon, X } from 'lucide-react';
import { DEFAULT_USER_AVATAR } from '../../constants';

interface ProfileTabProps {
  userAvatar: string;
  onAvatarChange: (url: string) => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ userAvatar, onAvatarChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onAvatarChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onAvatarChange(urlInput.trim());
      setUrlInput('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-[var(--text-primary)]">
          <User className="w-5 h-5 text-[var(--accent-blue)]" />
          <div>
            <h3 className="font-medium text-base">User Avatar</h3>
            <p className="text-xs text-[var(--text-secondary)]">Customize how you appear in chat</p>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] flex flex-col items-center gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[var(--border-color)] ring-4 ring-transparent group-hover:ring-[var(--accent-blue)]/20 transition-all flex items-center justify-center bg-[var(--surface-highlight)]">
              {userAvatar ? (
                <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-[var(--text-primary)]" />
              )}
            </div>
            {userAvatar !== DEFAULT_USER_AVATAR && (
              <button
                onClick={() => onAvatarChange(DEFAULT_USER_AVATAR)}
                className="absolute top-0 right-0 p-2 bg-[var(--surface-highlight)] text-[var(--text-primary)] rounded-full shadow-lg border border-[var(--border-color)] hover:bg-[#D96570] hover:text-white transition-colors"
                title="Reset to default"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="w-full max-w-sm space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--surface-highlight)] hover:bg-[var(--hover-bg)] rounded-lg transition-colors border border-[var(--border-color)] text-sm text-[var(--text-primary)]"
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />

              <div className="relative">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="URL..."
                  className="w-full pl-3 pr-9 py-2.5 bg-[var(--surface-highlight)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                />
                <button
                  onClick={handleUrlSubmit}
                  disabled={!urlInput}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-[var(--accent-blue)] text-white rounded-md hover:opacity-90 transition-colors disabled:opacity-50 disabled:bg-transparent disabled:text-[var(--text-secondary)]"
                >
                  <ImageIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
