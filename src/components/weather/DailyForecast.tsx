import { WeatherData } from '../../types';
import { format } from 'date-fns';
import { getThemeByCode } from '../../constants';
import { cn } from '../../lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface DailyForecastProps {
  weather: WeatherData;
}

export function DailyForecast({ weather }: DailyForecastProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Find project-wide min/max to scale the bars
  const allTemps = weather.forecast.forecastday.flatMap(d => [d.day.maxtemp_c, d.day.mintemp_c]);
  const minTemp = Math.min(...allTemps) - 2; // Add some padding
  const maxTemp = Math.max(...allTemps) + 2;
  const range = maxTemp - minTemp;

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col gap-5 px-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">7-Day Forecast</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        {weather.forecast.forecastday.map((day, index) => {
          const dayMin = day.day.mintemp_c;
          const dayMax = day.day.maxtemp_c;
          
          const leftPos = ((dayMin - minTemp) / range) * 100;
          const widthPos = ((dayMax - dayMin) / range) * 100;

          const rainChance = day.hour.length > 0 
            ? Math.max(...day.hour.map(h => h.chance_of_rain))
            : ((day.day as any).pop || 0);

          const theme = getThemeByCode(day.day.condition.code);
          const Icon = theme.icon;
          const isExpanded = expandedIndex === index;
          const hasHourlyData = day.hour.length > 0;

          return (
            <div key={day.date} className="flex flex-col border-b border-slate-100/30 last:border-0 relative">
              <div 
                onClick={() => hasHourlyData ? toggleExpand(index) : null}
                className={cn("group flex items-center justify-between gap-4 py-3 rounded-lg -mx-2 px-2 transition-colors", hasHourlyData ? "cursor-pointer hover:bg-white/5" : "")}
              >
                <div className="w-[15%] flex flex-col">
                  <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100">
                    {index === 0 ? 'Today' : format(new Date(day.date), 'EEE')}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {format(new Date(day.date), 'MMM d')}
                  </span>
                </div>

                <div className="w-[12%] flex flex-col items-center">
                  <Icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", theme.accent)} strokeWidth={2.5} />
                  {rainChance > 10 && (
                    <span className="text-[9px] font-black text-sky-500 mt-0.5 tracking-tighter">
                      {rainChance}%
                    </span>
                  )}
                </div>

                <div className="flex-1 flex items-center gap-3">
                  <span className="text-[12px] font-bold text-slate-400 w-8 text-right">{Math.round(dayMin)}°</span>
                  <div className="relative h-1 flex-1 bg-slate-100 dark:bg-slate-800/50 rounded-full">
                    <div 
                      className="absolute h-full bg-slate-800 dark:bg-slate-300 rounded-full transition-all duration-500"
                      style={{ 
                          left: `${leftPos}%`, 
                          width: `${widthPos}%` 
                      }}
                    />
                    {/* Dot for current temp if it's today */}
                    {index === 0 && (
                      <div 
                        className="absolute top-1/2 w-2 h-2 bg-white dark:bg-slate-900 border-2 border-slate-800 dark:border-slate-300 rounded-full -translate-y-1/2 shadow-sm z-10"
                        style={{ 
                          left: `${((weather.current.temp_c - minTemp) / range) * 100}%`,
                          marginLeft: '-4px'
                        }}
                      />
                    )}
                  </div>
                  <span className="text-[12px] font-bold text-slate-800 dark:text-slate-100 w-8 text-left">{Math.round(dayMax)}°</span>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 pb-4 px-2 select-none">
                      <div className="flex items-center justify-between text-[11px] mb-3 text-slate-500 dark:text-slate-400">
                        <span className="capitalize">{day.day.condition.text}</span>
                        <div className="flex gap-3">
                          <span>Sunrise: {day.astro.sunrise}</span>
                          <span>Sunset: {day.astro.sunset}</span>
                        </div>
                      </div>
                      <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                        {/* Only show next 12 hours or evenly spaced 6 hours to save space */}
                        {day.hour.filter((_, i) => i % 3 === 0).map((h) => {
                           const hourTheme = getThemeByCode(h.condition.code || day.day.condition.code); // Fallback to day code if missing
                           const HourIcon = hourTheme.icon;
                           return (
                              <div key={h.time} className="flex flex-col items-center flex-shrink-0 snap-start w-12 gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-white/5">
                                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{format(new Date(h.time), 'ha')}</span>
                                <HourIcon className={cn("w-4 h-4", hourTheme.accent)} />
                                <span className="text-[12px] font-bold text-slate-800 dark:text-slate-100">{Math.round(h.temp_c)}°</span>
                                {h.chance_of_rain > 10 && (
                                  <span className="text-[8px] font-bold text-sky-500">{h.chance_of_rain}%</span>
                                )}
                              </div>
                           )
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
