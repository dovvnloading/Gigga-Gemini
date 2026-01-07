import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles, Zap, Image as ImageIcon, Mic, Check } from 'lucide-react';
import { ModelType } from '../types';
import { MODEL_LABELS, MODEL_DESCRIPTIONS } from '../constants';

interface ModelSelectProps {
  currentModel: ModelType;
  onModelChange: (model: ModelType) => void;
}

const ModelSelect: React.FC<ModelSelectProps> = ({ currentModel, onModelChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex-shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[var(--hover-bg)] transition-colors text-xs font-medium text-[var(--text-secondary)] bg-[var(--surface-color)] border border-[var(--border-color)]"
      >
        <span>{MODEL_LABELS[currentModel]}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-secondary)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-72 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden py-2 z-50 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-[var(--border-highlight)]">
          <div className="px-4 py-2 text-xs font-medium text-[var(--text-secondary)]">Gemini 3</div>
          {(Object.keys(MODEL_LABELS) as ModelType[]).map((model) => (
            <button
              key={model}
              onClick={() => {
                onModelChange(model);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-[var(--hover-bg)] transition-colors flex items-start gap-3 group"
            >
              <div className="flex-1">
                <div className={`text-sm font-medium ${currentModel === model ? 'text-[var(--accent-blue)]' : 'text-[var(--text-primary)]'}`}>
                  {MODEL_LABELS[model]}
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-0.5 leading-tight group-hover:text-[var(--text-primary)]">
                  {MODEL_DESCRIPTIONS[model]}
                </div>
              </div>
              {currentModel === model && (
                  <Check className="w-4 h-4 text-[var(--accent-blue)] mt-1" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelSelect;