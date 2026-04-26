import { WeatherData } from '../../types';
import { format } from 'date-fns';
import { getThemeByCode } from '../../constants';
import { cn } from '../../lib/utils';

interface DailyForecastProps {
  weather: WeatherData;
}

export function DailyForecast({ weather }: DailyForecastProps) {
  // Find project-wide min/max to scale the bars
  const allTemps = weather.forecast.forecastday.flatMap(d => [d.day.maxtemp_c, d.day.mintemp_c]);
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
          const dayMin = day.day.mintemp_c;
          const dayMax = day.day.maxtemp_c;
          
          const leftPos = ((dayMin - minTemp) / range) * 100;
          const widthPos = ((dayMax - dayMin) / range) * 100;

          const rainChance = Math.max(...day.hour.map(h => h.chance_of_rain));
          const theme = getThemeByCode(day.day.condition.code);
          const Icon = theme.icon;

          return (
            <div 
              key={day.date} 
              className="group flex items-center justify-between gap-4 py-3 border-b border-slate-100/30 last:border-0"
            >
              <div className="w-[15%] flex flex-col">
                <span className="text-[13px] font-bold text-slate-800">
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
                <div className="relative h-1 flex-1 bg-slate-100 rounded-full">
                  <div 
                    className="absolute h-full bg-slate-800 rounded-full transition-all duration-500"
                    style={{ 
                        left: `${leftPos}%`, 
                        width: `${widthPos}%` 
                    }}
                  />
                  {/* Dot for current temp if it's today */}
                  {index === 0 && (
                    <div 
                      className="absolute top-1/2 w-2 h-2 bg-white border-2 border-slate-800 rounded-full -translate-y-1/2 shadow-sm z-10"
                      style={{ 
                        left: `${((weather.current.temp_c - minTemp) / range) * 100}%`,
                        marginLeft: '-4px'
                      }}
                    />
                  )}
                </div>
                <span className="text-[12px] font-bold text-slate-800 w-8 text-left">{Math.round(dayMax)}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
