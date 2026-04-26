import { motion } from 'motion/react';
import { WeatherData } from '../../types';
import { WeatherTheme } from '../../constants';

interface WeatherHeroProps {
  weather: WeatherData;
  theme: WeatherTheme;
}

export function WeatherHero({ weather, theme }: WeatherHeroProps) {
  const current = weather.current;
  const Icon = theme.icon;

  return (
    <div className="flex bg-transparent items-center justify-between p-6 w-full text-white relative z-10 flex-col md:flex-row gap-8 md:gap-0">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center md:items-start"
      >
        <div className="flex items-baseline gap-2">
          <span className="text-[80px] md:text-[140px] font-bold leading-none tracking-tighter drop-shadow-xl">
            {Math.round(current.temp_c)}°
          </span>
          <span className="text-5xl font-medium opacity-80 mb-8 tracking-normal">C</span>
        </div>
        <div className="flex items-center gap-3 -mt-4">
          <span className="text-2xl font-light">{current.condition.text}</span>
          <span className="w-1.5 h-1.5 bg-white/50 rounded-full" />
          <span className="text-lg opacity-80">Feels like {Math.round(current.temp_c)}°</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="relative w-48 h-48 flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-2xl md:blur-3xl shadow-[0_0_40px_rgba(255,220,100,0.3)] md:shadow-[0_0_80px_rgba(255,220,100,0.4)] md:animate-pulse" />
        <Icon className="w-32 h-32 relative z-10 drop-shadow-2xl" strokeWidth={1.5} />
      </motion.div>
    </div>
  );
}
