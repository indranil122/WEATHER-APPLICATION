import { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function GlassCard({ children, className, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "bg-[#ffffff26] backdrop-blur-md md:backdrop-blur-xl border border-[#ffffff40] rounded-[24px] shadow-xl overflow-hidden text-white transition-all duration-300",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
