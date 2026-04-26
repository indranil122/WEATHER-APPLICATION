import { Wind, Droplets, Sun, WindIcon, Sunrise, Sunset, Microscope } from 'lucide-react';
import { WeatherData } from '../../types';
import { GlassCard } from '../layout/GlassCard';

interface WeatherDetailsProps {
  weather: WeatherData;
}

export function WeatherDetails({ weather }: WeatherDetailsProps) {
  const current = weather.current;
  const astro = weather.forecast.forecastday[0].astro;

  const details = [
    { label: 'Wind', value: `${current.wind_kph} km/h`, icon: Wind, color: 'text-blue-300' },
    { label: 'Humidity', value: `${current.humidity}%`, icon: Droplets, color: 'text-sky-300' },
    { label: 'UV Index', value: current.uv, icon: Sun, color: 'text-yellow-300' },
    { label: 'AQI', value: getAQIStatus(current.air_quality["us-epa-index"]), icon: WindIcon, color: 'text-emerald-300' },
    { label: 'Sunrise', value: astro.sunrise, icon: Sunrise, color: 'text-orange-300' },
    { label: 'Sunset', value: astro.sunset, icon: Sunset, color: 'text-purple-300' },
  ];

  function getAQIStatus(index: number) {
    const statuses = ['Good', 'Moderate', 'Unhealthy (SG)', 'Unhealthy', 'Very Unhealthy', 'Hazardous'];
    return statuses[index - 1] || 'Unknown';
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        {details.slice(0, 4).map((detail, index) => (
          <GlassCard key={detail.label} delay={0.1 * index} className="p-4 flex flex-col justify-between text-left group hover:bg-[#ffffff33] transition-colors rounded-[24px]">
            <p className="text-[10px] uppercase font-bold opacity-60 mb-2">{detail.label}</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xl font-semibold flex items-baseline gap-1">
                {detail.value.toString().replace(/[a-zA-Z/%]+/, '').trim()}
                <span className="text-sm opacity-70">
                  {detail.value.toString().match(/[a-zA-Z/%]+/)?.[0] || ''}
                </span>
              </p>
            </div>
          </GlassCard>
        ))}
      </div>
      <div className="flex justify-between pt-4 border-t border-white/10 text-[10px] uppercase font-bold tracking-widest opacity-60 px-2 mt-2">
        <div>Sunrise {astro.sunrise}</div>
        <div>Sunset {astro.sunset}</div>
      </div>
    </div>
  );
}
