import React, { useRef, useEffect } from 'react';
import { Maximize2, Globe, BarChart3, Youtube, BookOpen, MapPin, Zap, Check } from 'lucide-react';
import { ToolConfig } from '../../services/toolRegistry';

interface ToolsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  toolConfig: ToolConfig;
  onToggle: (key: keyof ToolConfig) => void;
  onReset: () => void;
}

const TOOLS_LIST = [
    { key: 'useCanvas', icon: Maximize2, label: 'Canvas', sub: 'Web Preview, Docs, Code', color: '#A8C7FA' },
    { key: 'useGoogleSearch', icon: Globe, label: 'Google Search', sub: 'Real-time web info', color: '#4285F4' },
    { key: 'useDataViz', icon: BarChart3, label: 'Data Analyst', sub: 'Generate interactive charts', color: '#FF00FF' },
    { key: 'useYouTube', icon: Youtube, label: 'YouTube', sub: 'Find videos', color: '#FF0000' },
    { key: 'useDeepResearch', icon: BookOpen, label: 'Deep Research', sub: 'Multi-step analysis', color: '#9B72CB' },
    { key: 'useGoogleMaps', icon: MapPin, label: 'Google Maps', sub: 'Locations & Places', color: '#34A853' },
    { key: 'useSmartTools', icon: Zap, label: 'Smart Data', sub: 'Weather, Stocks, etc.', color: '#D96570' }
] as const;

const ToolsMenu: React.FC<ToolsMenuProps> = ({ isOpen, onClose, toolConfig, onToggle, onReset }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeCount = Object.values(toolConfig).filter(Boolean).length;

  return (
    <div 
        ref={menuRef}
        className="absolute bottom-full left-0 mb-4 w-72 bg-[#1E1F20]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-white/5"
    >
        <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-medium text-[#8E9196] uppercase tracking-wide">Enabled Tools</span>
            {activeCount > 0 && <span className="text-[10px] text-[#A8C7FA] cursor-pointer" onClick={onReset}>Reset</span>}
        </div>
        
        <div className="space-y-1 max-h-[320px] overflow-y-auto custom-scrollbar">
            {TOOLS_LIST.map((tool) => (
                <button
                key={tool.key}
                onClick={() => onToggle(tool.key as keyof ToolConfig)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${toolConfig[tool.key as keyof ToolConfig] ? `bg-[${tool.color}]/20` : 'bg-[#333537]'}`} style={{ backgroundColor: toolConfig[tool.key as keyof ToolConfig] ? `${tool.color}33` : undefined }}>
                        <tool.icon className="w-4 h-4" style={{ color: toolConfig[tool.key as keyof ToolConfig] ? tool.color : '#E3E3E3' }} />
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-medium text-[#E3E3E3]">{tool.label}</div>
                        <div className="text-[10px] text-[#8E9196]">{tool.sub}</div>
                    </div>
                </div>
                {toolConfig[tool.key as keyof ToolConfig] && <Check className="w-4 h-4 text-[#A8C7FA]" />}
                </button>
            ))}
        </div>
    </div>
  );
};

export default ToolsMenu;