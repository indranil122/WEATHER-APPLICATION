import { Sparkles, RefreshCw, Wand2, Bot } from 'lucide-react';
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
      <div className="relative clay-inset w-full h-full rounded-[28px] p-5 md:p-6 flex items-start gap-4 md:gap-5 z-10">
        
        {/* Magical Icon container */}
        <div className="relative shrink-0">
          <div className="relative w-12 h-12 clay-button rounded-2xl flex items-center justify-center overflow-hidden">
             <Bot className="w-5 h-5 text-indigo-500 relative z-10" />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center min-h-[48px]">
          <div className="flex items-center justify-between mb-1.5 md:mb-2">
            <h3 className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] opacity-80 flex items-center gap-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 font-extrabold">Gemini Insight</span>
            </h3>
            {summary && (
              <button 
                onClick={onGenerate}
                disabled={isLoading}
                className="p-1.5 hover:bg-black/5 rounded-full text-slate-400 hover:text-slate-600 transition-all disabled:opacity-30 group/btn"
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
                        className="w-1.5 h-1.5 bg-indigo-500 rounded-full" 
                      />
                    ))}
                  </div>
                  <motion.span 
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-slate-500 text-xs font-medium tracking-wide uppercase"
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
                  className="text-sm md:text-base leading-relaxed opacity-95 font-medium font-sans text-slate-700"
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
                  <p className="text-[13px] text-slate-500 font-medium">Unlock deep meteorological insights tailored to this location.</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onGenerate}
                    className="relative clay-button flex items-center justify-center gap-2 px-6 py-2.5 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider transition-all w-full sm:w-auto shrink-0"
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
