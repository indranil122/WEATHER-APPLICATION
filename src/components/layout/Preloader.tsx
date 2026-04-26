import { motion, AnimatePresence } from 'motion/react';
import { CloudRainWind } from 'lucide-react';

export function Preloader({ loading }: { loading: boolean }) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: loading ? 1 : 0 }}
      // Delay the fade-out of the wrapper until the curtain animation finishes
      transition={{ delay: loading ? 0 : 0.8, duration: 0.1 }}
      className={`fixed inset-0 z-[100] flex ${loading ? 'pointer-events-auto' : 'pointer-events-none'}`}
    >
      {/* Left Curtain */}
      <motion.div
        initial={false}
        animate={{ x: loading ? 0 : '-100%' }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        className="relative w-1/2 h-full bg-[#020617] border-r border-white/5 shadow-[20px_0_50px_rgba(0,0,0,0.5)] z-10"
      />
      
      {/* Right Curtain */}
      <motion.div
        initial={false}
        animate={{ x: loading ? 0 : '100%' }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        className="relative w-1/2 h-full bg-[#020617] border-l border-white/5 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-10"
      />

      {/* Central Content */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="center-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none"
          >
            {/* Minimalist Glowing Spinner around Icon */}
            <div className="relative flex items-center justify-center mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute w-28 h-28 rounded-full border-[1px] border-white/10 border-t-sky-400/80 shadow-[0_0_20px_rgba(56,189,248,0.2)]"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute w-20 h-20 rounded-full border-[1px] border-white/5 border-b-white/50"
              />
              <motion.div
                animate={{ scale: [1, 1.05, 1], filter: ['blur(0px)', 'blur(2px)', 'blur(0px)'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <CloudRainWind className="w-10 h-10 text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" strokeWidth={1} />
              </motion.div>
            </div>
            
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2"
            >
              <h1 className="text-white tracking-[0.4em] font-light text-sm uppercase">Skylines</h1>
              <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
