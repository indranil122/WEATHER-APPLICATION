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
      <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-8 opacity-50">
        7-Day Forecast
      </h3>
      
      <div className="flex flex-col gap-6">
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
              className="group flex items-center gap-4"
            >
              <div className="w-12">
                <span className="text-sm font-medium opacity-80">{index === 0 ? 'Today' : format(new Date(day.date), 'EEE')}</span>
              </div>

              <div className="flex items-center gap-2 w-16">
                <div className="relative">
                    <Icon className="w-6 h-6 text-white drop-shadow-sm group-hover:scale-110 transition-transform" />
                </div>
                {rainChance > 20 && (
                    <div className="flex items-center gap-0.5 text-[8px] font-black text-sky-400">
                        <CloudRain className="w-2 h-2" />
                        {rainChance}%
                    </div>
                )}
              </div>

              <div className="flex items-center gap-3 flex-1">
                <span className="text-xs font-medium opacity-40 w-8 text-right">{Math.round(dayMin)}°</span>
                <div className="relative h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="absolute h-full bg-gradient-to-r from-sky-400 to-orange-400 rounded-full opacity-80"
                    style={{ 
                        left: `${leftPos}%`, 
                        width: `${widthPos}%` 
                    }}
                  />
                </div>
                <span className="text-xs font-bold w-10">{Math.round(dayMax)}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
