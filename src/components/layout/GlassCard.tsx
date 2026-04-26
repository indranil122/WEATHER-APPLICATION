import { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hoverScale?: boolean;
}

export function GlassCard({ children, className, delay = 0, hoverScale = true }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={hoverScale ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={cn(
        "relative rounded-[32px] overflow-hidden transition-all duration-300 group",
        "bg-[#ffffff10] backdrop-blur-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
        "hover:bg-[#ffffff1a] hover:border-white/30 hover:shadow-[0_16px_48px_rgba(0,0,0,0.2)]",
        className
      )}
    >
      {/* Inner Highlight Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent opacity-50 pointer-events-none rounded-[32px]" />
      
      {/* Noise Texture */}
      <div 
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  );
}
