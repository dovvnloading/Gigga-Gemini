import React from 'react';
import { MapPin, ExternalLink, Globe } from 'lucide-react';
import { GroundingMetadata } from '../../types';

interface GroundingChipsProps {
  metadata: GroundingMetadata;
}

const GroundingChips: React.FC<GroundingChipsProps> = ({ metadata }) => {
  // Filter out duplicate Web URIs
  const webSources = metadata?.groundingChunks?.reduce((acc, chunk) => {
    if (chunk.web?.uri && !acc.some(s => s.web?.uri === chunk.web?.uri)) {
        acc.push(chunk);
    }
    return acc;
  }, [] as typeof metadata.groundingChunks) || [];

  // Filter out Maps URIs
  const mapSources = metadata?.groundingChunks?.filter(c => c.maps) || [];

  if (webSources.length === 0 && mapSources.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 mt-3">
        {/* Maps Chips */}
        {mapSources.length > 0 && (
             <div className="flex flex-wrap gap-2">
                 {mapSources.map((chunk, idx) => (
                     <a 
                        key={idx}
                        href={chunk.maps?.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-2 bg-[#1E1F20] hover:bg-[#2D2E30] border border-[#34A853]/30 rounded-xl transition-all group min-w-[200px]"
                     >
                        <div className="w-8 h-8 rounded-full bg-[#34A853]/20 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-4 h-4 text-[#34A853]" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-[#E3E3E3] truncate">{chunk.maps?.title || 'Location'}</span>
                            <span className="text-[10px] text-[#8E9196] truncate">{chunk.maps?.address || 'View on Maps'}</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-[#8E9196] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                     </a>
                 ))}
             </div>
        )}

        {/* Web Sources Chips */}
        {webSources.length > 0 && (
            <div className="pt-1 flex flex-col gap-2">
                <div className="text-xs font-medium text-[#8E9196] uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-3 h-3" /> Sources
                </div>
                <div className="flex flex-wrap gap-2">
                    {webSources.map((chunk, idx) => chunk.web?.uri ? (
                        <a 
                            key={idx}
                            href={chunk.web.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-[#1E1F20] hover:bg-[#2D2E30] border border-white/10 rounded-lg transition-colors max-w-[240px] group"
                        >
                            <div className="w-5 h-5 rounded-full bg-[#3C4043] flex items-center justify-center flex-shrink-0">
                                <div className="text-[10px] font-bold text-[#E3E3E3]">
                                    {new URL(chunk.web.uri).hostname.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-xs font-medium text-[#E3E3E3] truncate">{chunk.web.title || 'Source'}</span>
                                <span className="text-[10px] text-[#8E9196] truncate">{new URL(chunk.web.uri).hostname}</span>
                            </div>
                        </a>
                    ) : null)}
                </div>
            </div>
        )}
    </div>
  );
};

export default GroundingChips;