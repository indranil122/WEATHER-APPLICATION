import { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface ClayCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hoverScale?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, delay = 0, hoverScale = true, onClick }: ClayCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={hoverScale ? { y: -4, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
      className={cn(
        "relative rounded-[32px] overflow-hidden text-slate-800 dark:text-slate-100 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/50 dark:border-slate-800/50 shadow-xl",
        className
      )}
    >
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  );
}
