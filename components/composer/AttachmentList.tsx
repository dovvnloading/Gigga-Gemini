import React from 'react';
import { X, FileText, FileCode } from 'lucide-react';
import { Attachment } from '../../types';

interface AttachmentListProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}

const AttachmentList: React.FC<AttachmentListProps> = ({ attachments, onRemove }) => {
  if (attachments.length === 0) return null;

  return (
    <div className="flex gap-2 p-3 pb-0 overflow-x-auto custom-scrollbar relative z-10 px-4">
        {attachments.map((att) => (
            <div key={att.id} className="relative group flex-shrink-0 animate-in zoom-in duration-200">
                {att.type === 'image' && !att.mimeType.includes('pdf') ? (
                        <div className="relative rounded-xl overflow-hidden border border-white/10 w-20 h-20 bg-[#2D2E30]">
                            <img src={att.content} alt={att.name} className="w-full h-full object-cover" />
                        </div>
                ) : (
                        <div className="flex flex-col items-center justify-center w-20 h-20 bg-[#2D2E30] rounded-xl border border-white/10 gap-1 p-2">
                            {att.mimeType.includes('pdf') ? (
                            <FileText className="w-6 h-6 text-[#D96570]" />
                            ) : (
                            <FileCode className="w-6 h-6 text-[#A8C7FA]" />
                            )}
                            <span className="text-[9px] text-[#E3E3E3] w-full truncate text-center leading-tight">
                                {att.name}
                            </span>
                        </div>
                )}
                <button 
                    onClick={() => onRemove(att.id)}
                    className="absolute -top-1.5 -right-1.5 bg-[#131314] text-white rounded-full p-0.5 shadow-md hover:bg-red-500/20 hover:text-red-400 transition-colors border border-white/10"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        ))}
    </div>
  );
};

export default AttachmentList;