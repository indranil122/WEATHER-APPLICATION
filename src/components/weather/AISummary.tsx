import { Sparkles, RefreshCw, Wand2 } from 'lucide-react';
import { GlassCard } from '../layout/GlassCard';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface AISummaryProps {
  summary: string;
  isLoading: boolean;
  onGenerate: () => void;
}

export function AISummary({ summary, isLoading, onGenerate }: AISummaryProps) {
  return (
    <GlassCard 
      className="mt-0 p-1 flex mb-0 relative group" 
      delay={0.6}
      hoverScale={false}
    >
      {/* Animated Gradient Border Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-fuchsia-500/30 to-blue-500/30 opacity-20 group-hover:opacity-40 transition-opacity duration-700 blur"></div>
      
      <div className="relative bg-[#ffffff10] backdrop-blur-3xl w-full h-full rounded-[28px] p-5 md:p-6 flex items-start gap-4 md:gap-5 border border-white/10 z-10">
        
        {/* Magical Icon container */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-400 to-indigo-500 rounded-2xl blur-lg opacity-50 relative animate-pulse-slow"></div>
          <div className="relative w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden">
             {/* Small animated shimmer inside icon box */}
             <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/20 opacity-40 group-hover:animate-shimmer" />
             <Sparkles className="w-5.5 h-5.5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] relative z-10" />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center min-h-[48px]">
          <div className="flex items-center justify-between mb-1.5 md:mb-2">
            <h3 className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] opacity-80 flex items-center gap-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-200 to-indigo-200 font-extrabold">Gemini Insight</span>
            </h3>
            {summary && (
              <button 
                onClick={onGenerate}
                disabled={isLoading}
                className="p-1.5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all disabled:opacity-30 group/btn"
                title="Regenerate Summary"
              >
                <RefreshCw className={cn("w-3.5 h-3.5 group-hover/btn:rotate-180 transition-transform duration-500", isLoading && "animate-spin")} />
              </button>
            )}
          </div>

          <div className="relative z-10 w-full">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-2.5 items-center py-2"
                >
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div 
                        key={i} 
                        animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                        className="w-1.5 h-1.5 bg-fuchsia-300 rounded-full shadow-[0_0_8px_rgba(232,121,249,0.8)]" 
                      />
                    ))}
                  </div>
                  <motion.span 
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-white/70 text-xs font-medium tracking-wide uppercase"
                  >
                    Brewing synthesis...
                  </motion.span>
                </motion.div>
              ) : summary ? (
                <motion.p
                  key="content"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="text-sm md:text-base leading-relaxed opacity-95 font-medium font-sans text-white/90"
                >
                  {summary}
                </motion.p>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-1"
                >
                  <p className="text-[13px] text-white/60 font-medium">Unlock deep meteorological insights tailored to this location.</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onGenerate}
                    className="relative overflow-hidden flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-fuchsia-500/80 to-indigo-500/80 hover:from-fuchsia-500 hover:to-indigo-500 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] border border-fuchsia-300/30 w-full sm:w-auto shrink-0"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    Analyze Sky
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
