import { motion } from 'motion/react';
import { Home, Wind, Bot } from 'lucide-react';
import { cn } from '../../lib/utils';

export type TabId = 'home' | 'environment' | 'ai';

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Current' },
    { id: 'environment', icon: Wind, label: 'Quality' },
    { id: 'ai', icon: Bot, label: 'AI Chat' },
  ] as const;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div 
        className="flex items-center gap-1.5 p-1.5 bg-white/60 backdrop-blur-[40px] backdrop-saturate-[180%] border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.8)] rounded-full text-slate-700 hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-shadow duration-500"
      >        
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative px-4 sm:px-6 py-2.5 rounded-full flex items-center justify-center gap-2 transition-all duration-300 z-10 select-none cursor-default sm:cursor-pointer",
                isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-700 hover:bg-white/40"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/90 shadow-[0_2px_12px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,1)] md:shadow-[0_4px_16px_rgba(0,0,0,0.1),inset_0_1px_0px_rgba(255,255,255,1)] rounded-full z-0"
                  transition={{ type: 'spring', bounce: 0.25, duration: 0.6 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-2">
                <Icon className={cn("w-[22px] h-[22px] transition-all duration-300", isActive ? "text-indigo-600 scale-110 drop-shadow-sm" : "")} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <motion.span 
                    initial={{ opacity: 0, width: 0, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, width: 'auto', filter: 'blur(0px)' }}
                    transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
                    className="text-[13px] font-bold text-indigo-700 tracking-wide pr-1"
                  >
                    {tab.label}
                  </motion.span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
