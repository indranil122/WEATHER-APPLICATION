import { WeatherData } from '../../types';
import { GlassCard } from '../layout/GlassCard';
import { format } from 'date-fns';
import { CloudRain } from 'lucide-react';
import { getThemeByCode } from '../../constants';

interface DailyForecastProps {
  weather: WeatherData;
}

export function DailyForecast({ weather }: DailyForecastProps) {
  // Find project-wide min/max to scale the bars
  const allTemps = weather.forecast.forecastday.flatMap(d => [d.day.maxtemp_c, d.day.mintemp_c]);
  const minTemp = Math.min(...allTemps);
  const maxTemp = Math.max(...allTemps);
  const range = maxTemp - minTemp;

  return (
    <GlassCard className="flex-1 flex flex-col p-6 h-full mt-0 rounded-[32px]" delay={0.5}>
      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-6 opacity-60 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-white/40" />
        7-Day Forecast
      </h3>
      
      <div className="flex flex-col gap-2">
        {weather.forecast.forecastday.map((day, index) => {
          const dayMin = day.day.mintemp_c;
          const dayMax = day.day.maxtemp_c;
          
          // Calculate bar positions
          const leftPos = ((dayMin - minTemp) / range) * 100;
          const widthPos = ((dayMax - dayMin) / range) * 100;

          // Precipitation chance (finding max chance in the day)
          const rainChance = Math.max(...day.hour.map(h => h.chance_of_rain));
          
          const theme = getThemeByCode(day.day.condition.code);
          const Icon = theme.icon;

          return (
            <div 
              key={day.date} 
              className="group flex items-center gap-4 hover:bg-white/10 p-3 -mx-3 rounded-2xl transition-colors cursor-default"
            >
              <div className="w-12 shrink-0">
                <span className="text-[14px] font-semibold opacity-90">{index === 0 ? 'Today' : format(new Date(day.date), 'EEE')}</span>
              </div>

              <div className="flex items-center gap-1 w-16 shrink-0 text-center">
                <div className="relative mx-auto">
                    <Icon className="w-6 h-6 text-white drop-shadow-sm group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform duration-300" strokeWidth={1.5} />
                </div>
                {rainChance > 20 && (
                    <div className="flex items-center gap-0.5 text-[10px] font-bold text-sky-300/90 ml-1">
                        <CloudRain className="w-2.5 h-2.5" />
                        {rainChance}%
                    </div>
                )}
              </div>

              <div className="flex items-center gap-3 flex-1">
                <span className="text-sm font-semibold opacity-50 w-8 text-right">{Math.round(dayMin)}°</span>
                <div className="relative h-1.5 flex-1 bg-black/20 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="absolute h-full bg-gradient-to-r from-sky-400 via-emerald-400 to-orange-500 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.3)] opacity-90 group-hover:opacity-100 transition-all duration-300"
                    style={{ 
                        left: `${leftPos}%`, 
                        width: `${widthPos}%` 
                    }}
                  />
                </div>
                <span className="text-sm font-bold w-10 text-left">{Math.round(dayMax)}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
