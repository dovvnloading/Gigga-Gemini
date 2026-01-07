
import React from 'react';
import { Globe, Github, Twitter, Code2, Heart } from 'lucide-react';

const InfoTab: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-[var(--text-primary)]">
          <Code2 className="w-5 h-5 text-[var(--accent-blue)]" />
          <div>
            <h3 className="font-medium text-base">Developer Credits</h3>
            <p className="text-xs text-[var(--text-secondary)]">Meet the creator behind The App</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] p-8 group transition-all hover:border-[var(--border-highlight)] hover:shadow-2xl">
           {/* Decorative Background */}
           <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[var(--accent-blue)]/5 rounded-full blur-3xl group-hover:bg-[var(--accent-blue)]/10 transition-colors duration-700"></div>
           <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[var(--accent-purple)]/5 rounded-full blur-3xl group-hover:bg-[var(--accent-purple)]/10 transition-colors duration-700"></div>

           <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              
              {/* Avatar / Icon Placeholder */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--surface-highlight)] to-[var(--surface-color)] border border-[var(--border-color)] flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-300">
                   <span className="text-3xl font-display font-bold bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] text-transparent bg-clip-text">MW</span>
                </div>
                {/* Status Indicator */}
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-[var(--surface-color)] rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
              </div>

              <div className="space-y-2">
                 <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Matthew Robert Wesney</h2>
                 <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                    Passionate frontend engineer crafting high-fidelity user experiences and pushing the boundaries of web UI.
                 </p>
              </div>

              {/* Links */}
              <div className="flex flex-wrap justify-center gap-3 pt-4">
                 <a 
                    href="https://dovvnloading.github.io/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--surface-highlight)] hover:bg-[var(--accent-blue)]/10 border border-[var(--border-color)] hover:border-[var(--accent-blue)]/30 rounded-full transition-all group/link hover:-translate-y-0.5"
                 >
                    <Globe className="w-4 h-4 text-[var(--text-secondary)] group-hover/link:text-[var(--accent-blue)] transition-colors" />
                    <span className="text-sm font-medium text-[var(--text-primary)] group-hover/link:text-[var(--accent-blue)] transition-colors">Portfolio</span>
                 </a>

                 <a 
                    href="https://github.com/dovvnloading" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--surface-highlight)] hover:bg-[var(--text-primary)]/10 border border-[var(--border-color)] hover:border-[var(--text-primary)]/30 rounded-full transition-all group/link hover:-translate-y-0.5"
                 >
                    <Github className="w-4 h-4 text-[var(--text-secondary)] group-hover/link:text-[var(--text-primary)] transition-colors" />
                    <span className="text-sm font-medium text-[var(--text-primary)] group-hover/link:text-[var(--text-primary)] transition-colors">Github</span>
                 </a>

                 <a 
                    href="https://x.com/D3VAUX" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--surface-highlight)] hover:bg-[#1DA1F2]/10 border border-[var(--border-color)] hover:border-[#1DA1F2]/30 rounded-full transition-all group/link hover:-translate-y-0.5"
                 >
                    <Twitter className="w-4 h-4 text-[var(--text-secondary)] group-hover/link:text-[#1DA1F2] transition-colors" />
                    <span className="text-sm font-medium text-[var(--text-primary)] group-hover/link:text-[#1DA1F2] transition-colors">D3VAUX</span>
                 </a>
              </div>
           </div>
        </div>

        {/* Footer Credit */}
        <div className="flex flex-col items-center justify-center gap-2 pt-12 opacity-40">
           <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
             
           </div>
           <div className="text-[10px] text-[var(--text-secondary)] font-mono">
             v1.2.0
           </div>
        </div>
      </div>
    </div>
  );
};

export default InfoTab;
