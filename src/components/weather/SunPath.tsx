import { motion } from 'motion/react';
import { Sun, Sunrise, Sunset, Clock } from 'lucide-react';
import { GlassCard } from '../layout/GlassCard';
import { useMemo, useState, useEffect } from 'react';
import { format, differenceInMinutes } from 'date-fns';

interface SunPathProps {
  sunrise: string;
  sunset: string;
  /** Current time string in ISO format or valid date string, if not provided will use new Date() */
  currentTime?: string;
  delay?: number;
}

export function SunPath({ sunrise, sunset, currentTime, delay = 0.2 }: SunPathProps) {
  const [now, setNow] = useState(currentTime ? new Date(currentTime) : new Date());

  useEffect(() => {
    // If not given a fixed time to mock, keep it updated
    if (currentTime) return;
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, [currentTime]);

  const { progress, rotateDegree, timeLeftStr, totalDurationStr, formattedSunrise, formattedSunset, isDay } = useMemo(() => {
    try {
      const start = new Date(sunrise);
      const end = new Date(sunset);
      const current = now;

      // Extract time cleanly for display
      const fmtStart = format(start, 'h:mm a');
      const fmtEnd = format(end, 'h:mm a');

      const totalMins = differenceInMinutes(end, start);
      const passedMins = differenceInMinutes(current, start);
      
      let p = passedMins / totalMins;
      let isDaytime = true;

      if (p < 0) {
        p = 0; // before sunrise
        isDaytime = false;
      }
      if (p > 1) {
        p = 1; // after sunset
        isDaytime = false;
      }

      // Time left calculation
      const leftMins = Math.max(0, totalMins - passedMins);
      const hoursLeft = Math.floor(leftMins / 60);
      const minsLeft = leftMins % 60;
      let leftStr = "";
      if (!isDaytime) {
         leftStr = p === 0 ? "Before Sunrise" : "After Sunset";
      } else {
         leftStr = `${hoursLeft}h ${minsLeft}m left`;
      }

      // Total duration
      const totalHours = Math.floor(totalMins / 60);
      const totalMinsRem = totalMins % 60;
      const totalD = `${totalHours}h ${totalMinsRem}m`;

      return {
        progress: p,
        rotateDegree: -90 + (p * 180),
        timeLeftStr: leftStr,
        totalDurationStr: totalD,
        formattedSunrise: fmtStart,
        formattedSunset: fmtEnd,
        isDay: isDaytime
      };
    } catch(e) {
      return {
        progress: 0.5,
        rotateDegree: 0,
        timeLeftStr: "Unknown",
        totalDurationStr: "Unknown",
        formattedSunrise: sunrise,
        formattedSunset: sunset,
        isDay: true
      };
    }
  }, [sunrise, sunset, now]);

  return (
    <GlassCard className="p-6 rounded-[32px] flex flex-col gap-2 relative overflow-hidden" delay={delay}>
      <div className="flex items-center justify-between mb-2">
         <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Daylight</span>
         <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            <span>{totalDurationStr}</span>
         </div>
      </div>
      
      <div className="flex flex-col items-center justify-center mt-4">
         <span className="text-3xl font-black text-slate-800 dark:text-slate-100 drop-shadow-sm">
           {format(now, 'h:mm a')}
         </span>
         <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mt-1 dark:text-orange-400">
           {timeLeftStr}
         </span>
      </div>
      
      <div className="relative w-full">
        <svg viewBox="0 0 200 100" className="w-full h-auto overflow-visible mt-2">
          {/* Background Arc */}
          <path 
             d="M 20 90 A 80 80 0 0 1 180 90" 
             fill="none" 
             stroke="currentColor" 
             strokeWidth="2" 
             strokeDasharray="4 4" 
             className="text-slate-200 dark:text-slate-700/50"
          />
          
          {/* Animated Painted Arc representing current time */}
          <motion.path 
             d="M 20 90 A 80 80 0 0 1 180 90" 
             fill="none" 
             stroke="url(#sun-gradient)" 
             strokeWidth="4" 
             initial={{ pathLength: 0 }}
             animate={{ pathLength: progress }}
             transition={{ duration: 2.5, ease: "easeOut", delay: delay + 0.2 }}
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
            animate={{ rotate: rotateDegree }}
            transition={{ duration: 2.5, ease: "easeOut", delay: delay + 0.2 }}
            style={{ transformOrigin: "100px 90px" }}
          >
            {/* The sun placed to orbit exactly along the arc edge */}
            <foreignObject x="88" y="-2" width="24" height="24">
              <div className="w-full h-full bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-600 transition-opacity" style={{ opacity: isDay ? 1 : 0.5 }}>
                <Sun className="w-3.5 h-3.5 text-yellow-500 animate-[spin_6s_linear_infinite]" />
              </div>
            </foreignObject>
          </motion.g>
        </svg>

        {/* Labels under the Arc */}
        <div className="flex justify-between items-center w-[85%] mx-auto mt-2">
          {/* Sunrise */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center mb-2 shadow-inner">
               <Sunrise className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100">{formattedSunrise}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sunrise</span>
          </div>

          {/* Sunset */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mb-2 shadow-inner">
               <Sunset className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100">{formattedSunset}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sunset</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
