import React from 'react';
import { Youtube, PlayCircle } from 'lucide-react';
import { YouTubeVideo } from '../../types';

interface YouTubeGridViewProps {
  videos: YouTubeVideo[];
}

const YouTubeGridView: React.FC<YouTubeGridViewProps> = ({ videos }) => {
    return (
        <div className="mb-4">
            <div className="text-xs font-medium text-[#8E9196] uppercase tracking-wider flex items-center gap-2 mb-3">
                <Youtube className="w-4 h-4 text-red-500" />
                <span>Video Results</span>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x custom-scrollbar">
                {videos.map((video) => (
                    <a 
                        key={video.id}
                        href={video.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 w-64 group relative bg-[#1E1F20] rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all snap-start"
                    >
                        {/* Thumbnail */}
                        <div className="relative aspect-video bg-[#2D2E30] overflow-hidden">
                            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                <PlayCircle className="w-10 h-10 text-white fill-white/10" />
                            </div>
                            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-[10px] font-medium text-white">
                                {video.duration}
                            </div>
                        </div>
                        
                        {/* Info */}
                        <div className="p-3">
                            <h4 className="text-sm font-medium text-[#E3E3E3] line-clamp-2 leading-snug group-hover:text-white transition-colors">
                                {video.title}
                            </h4>
                            <div className="mt-2 flex items-center justify-between text-[11px] text-[#8E9196]">
                                <span className="truncate max-w-[100px]">{video.channel}</span>
                                <span>{video.views}</span>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default YouTubeGridView;