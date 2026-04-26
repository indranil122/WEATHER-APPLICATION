import { Sparkles, BrainCircuit, RefreshCw } from 'lucide-react';
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
    <GlassCard className="mt-0 p-5 flex items-start gap-4 mb-0" delay={0.6}>
      <div className="p-2 bg-white/20 rounded-xl shrink-0">
        <Sparkles className="w-6 h-6 text-white" />
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-1">
            AI Weather Summary
          </h3>
          {summary && (
            <button 
              onClick={onGenerate}
              disabled={isLoading}
              className="p-1.5 hover:bg-white/10 rounded-full text-white/70 transition-colors disabled:opacity-30"
              title="Regenerate Summary"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
            </button>
          )}
        </div>

        <div className="min-h-[60px] flex items-center relative z-10">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-2 items-center"
              >
                {[0, 1, 2].map((i) => (
                  <div 
                    key={i} 
                    className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" 
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
                <span className="text-white/60 text-xs font-medium ml-2">Brewing insights...</span>
              </motion.div>
            ) : summary ? (
              <motion.p
                key="content"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm leading-relaxed opacity-90 font-medium"
              >
                {summary}
              </motion.p>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-start gap-3"
              >
                <p className="text-xs text-white/50 italic">Get deep AI-powered insights for this location.</p>
                <button
                  onClick={onGenerate}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#ffffff33] hover:bg-[#ffffff4d] rounded-lg text-xs font-bold uppercase tracking-wider transition-all border border-white/20"
                >
                  <Sparkles className="w-3 h-3" />
                  Generate Summary
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </GlassCard>
  );
}
