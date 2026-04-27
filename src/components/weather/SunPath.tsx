import { motion } from 'motion/react';
import { Sun, Sunrise, Sunset } from 'lucide-react';
import { GlassCard } from '../layout/GlassCard';

interface SunPathProps {
  sunrise: string;
  sunset: string;
  delay?: number;
}

export function SunPath({ sunrise, sunset, delay = 0.2 }: SunPathProps) {
  return (
    <GlassCard className="p-6 rounded-[32px] flex flex-col gap-2 relative overflow-hidden" delay={delay}>
      <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-2">Daylight Timeline</span>
      
      <div className="relative w-full pt-4">
        <svg viewBox="0 0 200 100" className="w-full h-auto overflow-visible pb-2">
          {/* Background Arc */}
          <path 
             d="M 20 90 A 80 80 0 0 1 180 90" 
             fill="none" 
             stroke="currentColor" 
             strokeWidth="2" 
             strokeDasharray="4 4" 
             className="text-slate-200 dark:text-slate-700/50"
          />
          
          {/* Animated Painted Arc */}
          <motion.path 
             d="M 20 90 A 80 80 0 0 1 180 90" 
             fill="none" 
             stroke="url(#sun-gradient)" 
             strokeWidth="4" 
             initial={{ pathLength: 0 }}
             animate={{ pathLength: 1 }}
             transition={{ duration: 2.5, ease: "easeInOut", delay: delay + 0.2 }}
             strokeLinecap="round"
          />
          <defs>
            <linearGradient id="sun-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          {/* Rotating Sun Assembly */}
          <motion.g
            initial={{ rotate: -90 }}
            animate={{ rotate: 90 }}
            transition={{ duration: 2.5, ease: "easeInOut", delay: delay + 0.2 }}
            style={{ transformOrigin: "100px 90px" }}
          >
            {/* The sun placed to orbit along the edge */}
            <foreignObject x="86" y="-4" width="28" height="28">
              <div className="w-full h-full bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-700">
                <Sun className="w-[14px] h-[14px] text-yellow-500 animate-[spin_6s_linear_infinite]" />
              </div>
            </foreignObject>
          </motion.g>
        </svg>

        {/* Labels under the Arc */}
        <div className="flex justify-between items-center w-[80%] mx-auto mt-2">
          {/* Sunrise */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center mb-2 shadow-inner">
               <Sunrise className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100">{sunrise}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sunrise</span>
          </div>

          {/* Sunset */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mb-2 shadow-inner">
               <Sunset className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100">{sunset}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sunset</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
