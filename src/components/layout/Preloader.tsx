import { motion } from 'motion/react';
import { Cloud } from 'lucide-react';

export function Preloader({ loading }: { loading: boolean }) {
  return (
    <motion.div
      initial={false}
      animate={loading ? { opacity: 1 } : { opacity: 0 }}
      pointerEvents={loading ? 'auto' : 'none'}
      className="fixed inset-0 z-[100] flex"
    >
      <motion.div
        animate={loading ? { x: 0 } : { x: '-100%' }}
        transition={{ duration: 0.8, ease: [0.6, 0.05, -0.01, 0.9] }}
        className="w-1/2 h-full bg-[#1e293b] flex items-center justify-end pr-4"
      >
        <motion.div
            animate={loading ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
        >
            <Cloud className="w-12 h-12 text-sky-400" />
        </motion.div>
      </motion.div>
      <motion.div
        animate={loading ? { x: 0 } : { x: '100%' }}
        transition={{ duration: 0.8, ease: [0.6, 0.05, -0.01, 0.9] }}
        className="w-1/2 h-full bg-[#1e293b] flex items-center justify-start pl-4"
      >
        <motion.div
            animate={loading ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
        >
            <span className="text-white text-2xl font-bold tracking-widest italic">Skylines</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
