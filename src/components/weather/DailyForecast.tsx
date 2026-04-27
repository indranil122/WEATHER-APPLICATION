import { WeatherData } from '../../types';
import { format } from 'date-fns';
import { getThemeByCode } from '../../constants';
import { Link } from 'react-router-dom';
import { cn, getTemp } from '../../lib/utils';
import { useUnit } from '../../context';

interface DailyForecastProps {
  weather: WeatherData;
}

export function DailyForecast({ weather }: DailyForecastProps) {
  const { unit } = useUnit();

  // Find project-wide min/max to scale the bars
  const allTemps = weather.forecast.forecastday.flatMap(d => [getTemp(d.day.maxtemp_c, unit), getTemp(d.day.mintemp_c, unit)]);
  const minTemp = Math.min(...allTemps) - 2; // Add some padding
  const maxTemp = Math.max(...allTemps) + 2;
  const range = maxTemp - minTemp;

  return (
    <div className="flex flex-col gap-5 px-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">7-Day Forecast</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        {weather.forecast.forecastday.map((day, index) => {
          const dayMin = getTemp(day.day.mintemp_c, unit);
          const dayMax = getTemp(day.day.maxtemp_c, unit);
          
          const leftPos = ((dayMin - minTemp) / range) * 100;
          const widthPos = ((dayMax - dayMin) / range) * 100;

          const rainChance = Math.max(...day.hour.map(h => h.chance_of_rain));
          const theme = getThemeByCode(day.day.condition.code);
          const Icon = theme.icon;

          return (
            <Link 
              to={`/day/${day.date.split('T')[0]}`}
              key={day.date} 
              className="group flex items-center justify-between gap-4 py-3 border-b border-slate-100/30 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 px-2 -mx-2 rounded-xl transition-colors cursor-pointer"
            >
              <div className="w-[15%] flex flex-col">
                <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-500 transition-colors">
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
                        left: `${((getTemp(weather.current.temp_c, unit) - minTemp) / range) * 100}%`,
                        marginLeft: '-4px'
                      }}
                    />
                  )}
                </div>
                <span className="text-[12px] font-bold text-slate-800 dark:text-slate-100 w-8 text-left">{Math.round(dayMax)}°</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
