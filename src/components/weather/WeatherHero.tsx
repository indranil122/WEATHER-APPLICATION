import { motion } from 'motion/react';
import { WeatherData } from '../../types';
import { WeatherTheme } from '../../constants';
import { cn } from '../../lib/utils';
import { Zap } from 'lucide-react';

interface WeatherHeroProps {
  weather: WeatherData;
  theme: WeatherTheme;
}

const getInsight = (weather: WeatherData) => {
  const current = weather.current;
  const todayForecast = weather.forecast.forecastday[0];
  const maxRainChance = Math.max(...todayForecast.hour.map((h: any) => h.chance_of_rain || 0));

  if (current.feelslike_c > current.temp_c + 2) return "Feels significantly hotter due to humidity";
  if (current.feelslike_c > current.temp_c) return "Feels slightly warmer than actual";
  if (current.feelslike_c < current.temp_c - 2) return "Wind chill makes it feel colder";
  if (current.feelslike_c < current.temp_c) return "Feels slightly cooler";
  if (maxRainChance > 30) return `Expect wet conditions (${maxRainChance}% chance of rain)`;
  if (current.uv > 7) return "High UV index — wear sunscreen";
  return "Perfect conditions right now";
};

export function WeatherHero({ weather, theme }: WeatherHeroProps) {
  const current = weather.current;
  const Icon = theme.icon;
  const insight = getInsight(weather);

  return (
    <div className="flex bg-transparent items-center justify-between p-8 md:p-12 w-full text-slate-800 dark:text-slate-100 relative z-10 flex-col md:flex-row gap-8 md:gap-0">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center md:items-start z-10"
      >
        <div className="flex items-start font-display justify-center md:justify-start w-full">
          <span className="text-[100px] md:text-[140px] font-bold leading-none tracking-tighter drop-shadow-sm">
            {Math.round(current.temp_c)}<span className="text-8xl md:text-[110px]">°</span>
          </span>
          <span className="text-4xl md:text-5xl font-medium opacity-80 mt-4 md:mt-6 tracking-normal">C</span>
        </div>
        <div className="flex flex-col gap-2 mt-2 items-center md:items-start font-sans">
          <div className="flex items-center gap-3">
             <span className="text-2xl font-medium tracking-wide">{current.condition.text}</span>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2 mt-2 clay-inset px-4 py-2 rounded-full"
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold opacity-90">{insight}</span>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
        className="relative w-56 h-56 md:w-72 md:h-72 flex items-center justify-center shrink-0"
      >
        
        {theme.name === 'Sunny' && (
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
             className="absolute inset-0 bg-yellow-400/20 rounded-full blur-[40px]"
           />
        )}
        
        {theme.name === 'Rainy' && (
           <div className="absolute inset-x-8 top-12 bottom-0 z-0 overflow-hidden rounded-full">
             {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -50, x: Math.random() * 200 }}
                  animate={{ y: 250, x: Math.random() * 200 }}
                  transition={{ duration: 0.5 + Math.random(), repeat: Infinity, ease: "linear" }}
                  className="absolute w-1 h-3 bg-blue-300 rounded-full"
                />
             ))}
           </div>
        )}
        <motion.div
           animate={theme.name === 'Sunny' ? { rotate: 360 } : { y: [-5, 5, -5] }}
           transition={theme.name === 'Sunny' ? { duration: 30, repeat: Infinity, ease: "linear" } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
           className="relative z-10"
        >
          <Icon className={cn("w-36 h-36 md:w-48 md:h-48 relative z-10 drop-shadow-xl", theme.accent)} strokeWidth={1} />
        </motion.div>
      </motion.div>
    </div>
  );
}
