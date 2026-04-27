import { motion, AnimatePresence } from 'motion/react';
import { CloudSun, CloudRain, Sun, Wind, CloudLightning } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Preloader({ loading }: { loading: boolean }) {
  const [iconIndex, setIconIndex] = useState(0);
  const icons = [Sun, CloudSun, CloudRain, CloudLightning, Wind];
  
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % icons.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
           key="preloader"
           initial={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.5, ease: "easeInOut" }}
           className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white overflow-hidden"
        >
           <div className="relative z-10 flex flex-col items-center gap-8">
             <div className="relative w-16 h-16 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {icons.map((Icon, idx) => (
                    idx === iconIndex && (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="absolute text-slate-900"
                      >
                        <Icon strokeWidth={1} className="w-10 h-10" />
                      </motion.div>
                    )
                  ))}
                </AnimatePresence>
             </div>

             <div className="flex flex-col items-center gap-2 text-center">
               <h1 className="text-slate-900 text-xs font-medium uppercase tracking-[0.3em]">
                 SkyCast
               </h1>
             </div>
           </div>
           
           {/* Simple bottom loading progress */}
           <div className="absolute bottom-8 w-24 h-[2px] bg-slate-100 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ x: '-100%' }}
                 animate={{ x: '100%' }}
                 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-y-0 left-0 w-1/2 bg-slate-400"
               />
           </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
