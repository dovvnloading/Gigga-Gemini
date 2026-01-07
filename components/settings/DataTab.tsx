
import React, { useRef, useState } from 'react';
import { HardDrive, Download, Upload, Trash2 } from 'lucide-react';

interface DataTabProps {
  onExportData: () => void;
  onImportData: (file: File) => Promise<boolean>;
  onClearHistory: () => void;
  onCloseModal: () => void;
}

const DataTab: React.FC<DataTabProps> = ({
  onExportData,
  onImportData,
  onClearHistory,
  onCloseModal
}) => {
  const geminiFileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleGeminiImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsImporting(true);
      const success = await onImportData(file);
      setIsImporting(false);
      if (success) {
        onCloseModal();
      } else {
        alert('Failed to import Living Memory file. Please check the file format.');
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Living Memory (Import/Export) */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-[var(--text-primary)]">
          <HardDrive className="w-5 h-5 text-[#E9B600]" />
          <div>
            <h3 className="font-medium text-base">Living Memory</h3>
            <p className="text-xs text-[var(--text-secondary)]">Backup and restore your conversations</p>
          </div>
        </div>
        <div className="p-6 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] space-y-6">
          <div className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Save your entire conversation history, semantic memory, images, and data visualizations to a local file.
          </div>
          <div className="flex gap-3">
            <button
              onClick={onExportData}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--surface-highlight)] hover:bg-[var(--hover-bg)] rounded-lg transition-colors border border-[var(--border-color)] text-sm text-[var(--text-primary)]"
            >
              <Download className="w-4 h-4" />
              <span>Export Backup</span>
            </button>

            <button
              onClick={() => geminiFileInputRef.current?.click()}
              disabled={isImporting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--surface-highlight)] hover:bg-[var(--hover-bg)] rounded-lg transition-colors border border-[var(--border-color)] text-sm text-[var(--text-primary)] disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isImporting ? 'Restoring...' : 'Import Backup'}</span>
            </button>
            <input
              type="file"
              ref={geminiFileInputRef}
              className="hidden"
              accept=".gemini,.json"
              onChange={handleGeminiImport}
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-[var(--border-color)]" />

      {/* Clear Data */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-[var(--text-primary)]">
          <Trash2 className="w-5 h-5 text-[#D96570]" />
          <div>
            <h3 className="font-medium text-base">Danger Zone</h3>
            <p className="text-xs text-[var(--text-secondary)]">Irreversible actions</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-highlight)] border border-[#D96570]/20">
          <div>
            <div className="text-sm font-medium text-[#D96570]">Clear all chat history</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">This action cannot be undone.</div>
          </div>

          {confirmClear ? (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
              <span className="text-xs text-[#D96570] font-medium mr-2">Are you sure?</span>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-colors border border-[var(--border-color)]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearHistory();
                  onCloseModal();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#D96570] text-white hover:bg-[#C0525D] transition-colors shadow-[0_0_15px_rgba(217,101,112,0.3)] border border-[#D96570]"
              >
                Yes, delete
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="px-4 py-2 bg-[#D96570]/10 hover:bg-[#D96570]/20 text-[#D96570] text-sm font-medium rounded-lg transition-colors border border-[#D96570]/20"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataTab;
