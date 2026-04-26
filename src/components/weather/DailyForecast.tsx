import { WeatherData } from '../../types';
import { GlassCard } from '../layout/GlassCard';
import { format } from 'date-fns';

interface DailyForecastProps {
  weather: WeatherData;
}

export function DailyForecast({ weather }: DailyForecastProps) {
  return (
    <GlassCard className="flex-1 flex flex-col p-6 h-full mt-0" delay={0.5}>
      <h3 className="text-sm font-bold uppercase tracking-wider mb-6 opacity-80">
        7-Day Forecast
      </h3>
      
      <div className="flex flex-col gap-5">
        {weather.forecast.forecastday.map((day, index) => (
          <div 
            key={day.date} 
            className="flex items-center justify-between"
          >
            <span className="w-16 text-sm">{index === 0 ? 'Today' : format(new Date(day.date), 'EEE')}</span>
            <div className="flex items-center justify-center flex-1">
              {day.day.condition.icon && (
                <img 
                  src={day.day.condition.icon} 
                  alt={day.day.condition.text} 
                  className="w-8 h-8 drop-shadow-md"
                />
              )}
            </div>
            <div className="flex gap-3 w-20 justify-end text-sm font-bold">
              <span>{Math.round(day.day.maxtemp_c)}°</span>
              <span className="opacity-50">{Math.round(day.day.mintemp_c)}°</span>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
