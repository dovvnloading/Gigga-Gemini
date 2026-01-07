
import React, { useState, useEffect } from 'react';
import { BrainCircuit, ChevronUp, ChevronDown, Layers, CheckCircle2, FileText, ExternalLink, Search, Loader2, Cpu, Database, Filter } from 'lucide-react';
import { DeepResearchResult } from '../../types';

interface DeepResearchViewProps {
  data: DeepResearchResult;
}

const DeepResearchView: React.FC<DeepResearchViewProps> = ({ data }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    
    // Auto-collapse when completed
    useEffect(() => {
        if (data.steps.every(s => s.status === 'completed')) {
            const t = setTimeout(() => setIsExpanded(false), 3000);
            return () => clearTimeout(t);
        }
    }, [data.steps]);

    const completedSteps = data.steps.filter(s => s.status === 'completed').length;
    const isDone = completedSteps === data.steps.length;

    // Helper for dynamic icons based on step ID/Type
    const getStepIcon = (action: string) => {
        if (action.includes("Planning")) return <BrainCircuit className="w-3.5 h-3.5" />;
        if (action.includes("Vector") || action.includes("Search")) return <Search className="w-3.5 h-3.5" />;
        if (action.includes("Extraction") || action.includes("Filter")) return <Filter className="w-3.5 h-3.5" />;
        if (action.includes("Synthesis")) return <FileText className="w-3.5 h-3.5" />;
        return <Layers className="w-3.5 h-3.5" />;
    };

    return (
        <div className="mb-6 rounded-2xl overflow-hidden border border-white/10 bg-[#1E1F20]/40 backdrop-blur-md shadow-2xl ring-1 ring-white/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Header */}
            <div 
                className="bg-gradient-to-r from-[#2D2E30]/50 to-[#1E1F20]/50 p-4 border-b border-white/5 flex items-center justify-between cursor-pointer group"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 transition-colors ${isDone ? 'bg-[#9B72CB]/20' : 'bg-[#1E1F20] animate-pulse'}`}>
                            <Cpu className={`w-4 h-4 ${isDone ? 'text-[#D0BCFF]' : 'text-[#8E9196]'}`} />
                        </div>
                        {isDone && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#1E1F20]"></div>}
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-[#E3E3E3] flex items-center gap-2">
                            Deep Research Agent v2.0
                            {!isDone && <span className="text-[10px] text-[#A8C7FA] animate-pulse">● SWARM ACTIVE</span>}
                            {isDone && <span className="px-1.5 py-0.5 rounded-md bg-[#A8C7FA]/10 text-[10px] text-[#A8C7FA] font-medium tracking-wide">COMPLETE</span>}
                        </div>
                        <div className="text-xs text-[#8E9196] flex items-center gap-2">
                            <span>{data.total_sources} verified sources</span>
                            <span className="w-1 h-1 rounded-full bg-[#8E9196]"></span>
                            <span>{data.execution_time}</span>
                        </div>
                    </div>
                </div>
                <button className="p-2 hover:bg-white/5 rounded-lg text-[#8E9196] hover:text-[#E3E3E3] transition-colors">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            {/* Content Body */}
            <div className={`transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)] ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="p-4 space-y-6">
                    
                    {/* Execution Pipeline Visualization */}
                    <div className="space-y-3">
                         <div className="flex items-center justify-between text-xs font-medium text-[#8E9196] uppercase tracking-wider">
                            <span className="flex items-center gap-2"><Layers className="w-3 h-3" /> Agent Pipeline</span>
                        </div>
                        
                        <div className="relative space-y-0">
                             {/* Connector Line */}
                             <div className="absolute left-[15px] top-4 bottom-4 w-px bg-white/10"></div>

                            {data.steps.map((step, idx) => {
                                const isActive = !isDone && idx === completedSteps;
                                const isCompleted = step.status === 'completed';
                                
                                return (
                                    <div key={step.id} className="relative flex items-start gap-4 py-2 group">
                                        {/* Status Dot */}
                                        <div className={`
                                            relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300
                                            ${isCompleted ? 'bg-[#1E1F20] border-emerald-500/50 text-emerald-500' : isActive ? 'bg-[#1E1F20] border-[#A8C7FA] text-[#A8C7FA] shadow-[0_0_10px_rgba(168,199,250,0.2)]' : 'bg-[#1E1F20] border-white/10 text-[#8E9196]'}
                                        `}>
                                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : isActive ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="text-[10px] font-mono">{idx + 1}</span>}
                                        </div>

                                        <div className="flex-1 min-w-0 pt-1">
                                            <div className="flex items-center justify-between">
                                                <div className={`text-sm font-medium transition-colors ${isCompleted ? 'text-[#E3E3E3]' : isActive ? 'text-[#A8C7FA]' : 'text-[#8E9196]'}`}>
                                                    {step.action}
                                                </div>
                                                {isActive && (
                                                    <span className="text-[9px] bg-[#A8C7FA]/10 text-[#A8C7FA] px-1.5 py-0.5 rounded uppercase tracking-wider font-medium animate-pulse">Processing</span>
                                                )}
                                            </div>
                                            <div className={`text-xs mt-1 font-mono transition-colors ${isActive ? 'text-[#E3E3E3]' : 'text-[#8E9196]'}`}>
                                                {step.description}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sources Grid */}
                    {data.sources.length > 0 && (
                        <div className="space-y-3 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                             <div className="text-xs font-medium text-[#8E9196] uppercase tracking-wider flex items-center gap-2">
                                <Database className="w-3 h-3" /> Extracted Sources
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {data.sources.map((source, i) => (
                                    <a 
                                        key={i} 
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-2 rounded-lg bg-[#2D2E30]/30 hover:bg-[#2D2E30]/60 border border-white/5 hover:border-white/10 transition-all group"
                                    >
                                        <div className="w-8 h-8 rounded bg-[#131314] flex items-center justify-center text-[10px] font-bold text-[#8E9196] border border-white/5 group-hover:border-white/20 transition-colors">
                                            WEB
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-medium text-[#E3E3E3] truncate group-hover:text-[#A8C7FA] transition-colors">{source.title}</div>
                                            <div className="text-[10px] text-[#8E9196] flex items-center justify-between mt-0.5">
                                                <span className="truncate max-w-[120px]">{new URL(source.url).hostname}</span>
                                            </div>
                                        </div>
                                        <ExternalLink className="w-3 h-3 text-[#8E9196] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Collapsed Footer Preview */}
            {!isExpanded && (
                <div className="px-4 py-2 bg-[#131314]/30 flex items-center gap-4 text-xs text-[#8E9196]">
                    <div className="flex items-center gap-1.5">
                         <Filter className="w-3 h-3" />
                         <span>{data.total_sources} verified</span>
                    </div>
                    <div className="w-px h-3 bg-white/10"></div>
                     <div className="flex items-center gap-1.5">
                         <FileText className="w-3 h-3" />
                         <span>Report Ready</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeepResearchView;
