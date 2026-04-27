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
           exit={{ opacity: 0, filter: "blur(10px)", scale: 1.1 }}
           transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
           className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617] overflow-hidden"
        >
           {/* Ambient Background glows */}
           <motion.div 
             animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
             transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-sky-500/20 blur-[100px]"
           />
           <motion.div 
             animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
             transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] rounded-full bg-indigo-500/20 blur-[80px]"
           />
           
           <div className="relative z-10 flex flex-col items-center gap-10">
             {/* Icon Morph Container */}
             <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Ethereal Glow Behind Icon */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-[1px] border-white/5 border-t-sky-400/50 border-r-indigo-400/50 shadow-[0_0_30px_rgba(56,189,248,0.2)]"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute opacity-50 inset-[-10px] rounded-full border-[1px] border-white/5 border-b-sky-300/30 border-l-transparent"
                />
                
                <AnimatePresence mode="wait">
                  {icons.map((Icon, idx) => (
                    idx === iconIndex && (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 1.2, filter: "blur(4px)" }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="absolute text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                      >
                        <Icon strokeWidth={1} className="w-12 h-12" />
                      </motion.div>
                    )
                  ))}
                </AnimatePresence>
             </div>

             <div className="flex flex-col items-center gap-4 text-center">
               <motion.h1 
                 animate={{ opacity: [0.5, 1, 0.5] }}
                 transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                 className="text-white text-xs font-light uppercase tracking-[0.4em] ml-[0.4em]"
               >
                 SkyCast AI
               </motion.h1>
               <div className="flex gap-1.5 items-center">
                 <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} className="w-1 h-1 rounded-full bg-sky-400" />
                 <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} className="w-1 h-1 rounded-full bg-sky-400" />
                 <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} className="w-1 h-1 rounded-full bg-sky-400" />
               </div>
             </div>
           </div>
           
           {/* Bottom loading progress effect */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5, duration: 1 }}
             className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center w-[200px]"
           >
             <div className="w-full h-[1px] bg-white/10 overflow-hidden relative rounded-full">
               <motion.div 
                 initial={{ x: '-100%' }}
                 animate={{ x: '100%' }}
                 transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                 className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-sky-400 to-transparent"
               />
             </div>
             <p className="text-white/40 text-[9px] uppercase tracking-widest mt-4">Synthesizing Atmosphere</p>
           </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
