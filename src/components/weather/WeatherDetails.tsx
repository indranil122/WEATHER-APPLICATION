import { Wind, Droplets, Sun, WindIcon, Sunrise, Sunset, Microscope, Activity, Navigation, Cloud } from 'lucide-react';
import { WeatherData } from '../../types';
import { GlassCard } from '../layout/GlassCard';

interface WeatherDetailsProps {
  weather: WeatherData;
}

export function WeatherDetails({ weather }: WeatherDetailsProps) {
  const current = weather.current;
  const astro = weather.forecast.forecastday[0].astro;
  const aq = current.air_quality;

  const details = [
    { label: 'Wind', value: `${current.wind_kph} km/h`, icon: Wind, color: 'text-blue-300' },
    { label: 'Humidity', value: `${current.humidity}%`, icon: Droplets, color: 'text-sky-300' },
    { label: 'UV Index', value: current.uv, icon: Sun, color: 'text-yellow-300' },
  ];

  const pollutantLabels = [
    { label: 'PM2.5', value: Math.round(aq.pm2_5), icon: Microscope, unit: 'µg/m³' },
    { label: 'PM10', value: Math.round(aq.pm10), icon: Activity, unit: 'µg/m³' },
    { label: 'NO2', value: Math.round(aq.no2), icon: Navigation, unit: 'µg/m³' },
    { label: 'O3', value: Math.round(aq.o3), icon: Cloud, unit: 'µg/m³' },
  ];

  function getAQIStatus(index: number) {
    const statuses = ['Good', 'Moderate', 'Unhealthy (SG)', 'Unhealthy', 'Very Unhealthy', 'Hazardous'];
    return statuses[index - 1] || 'Unknown';
  }

  function getAQIColor(index: number) {
    const colors = ['bg-emerald-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-purple-500', 'bg-red-950'];
    return colors[index - 1] || 'bg-gray-500';
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        {details.map((detail, index) => (
          <GlassCard key={detail.label} delay={0.1 * index} className="p-4 flex flex-col justify-between text-left group hover:bg-[#ffffff33] transition-colors rounded-[24px]">
            <p className="text-[10px] uppercase font-bold opacity-60 mb-2">{detail.label}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xl font-semibold flex items-baseline gap-1">
                {detail.value.toString().replace(/[a-zA-Z/%]+/, '').trim()}
                <span className="text-sm opacity-70">
                  {detail.value.toString().match(/[a-zA-Z/%]+/)?.[0] || ''}
                </span>
              </p>
              <detail.icon className={detail.color + " w-4 h-4"} />
            </div>
          </GlassCard>
        ))}
        
        {/* AQI Summary Card */}
        <GlassCard delay={0.3} className="p-4 flex flex-col justify-between text-left group hover:bg-[#ffffff33] transition-colors rounded-[24px]">
          <p className="text-[10px] uppercase font-bold opacity-60 mb-2 tracking-widest">Air Quality</p>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-8 rounded-full ${getAQIColor(aq["us-epa-index"])} shadow-lg shadow-black/20`} />
            <div>
              <p className="text-lg font-bold leading-tight">{getAQIStatus(aq["us-epa-index"])}</p>
              <p className="text-[10px] opacity-60">US EPA Index {aq["us-epa-index"]}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* AQI Components Grid */}
      <GlassCard delay={0.4} className="p-4 rounded-[24px]">
        <h4 className="text-[10px] uppercase font-bold opacity-60 mb-4 flex items-center gap-2">
          <WindIcon className="w-3 h-3" />
          Pollutants Breakdown
        </h4>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {pollutantLabels.map((p) => (
            <div key={p.label} className="flex items-center justify-between group/p">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center group-hover/p:bg-white/10 transition-colors">
                  <p.icon className="w-3 h-3 text-white/70" />
                </div>
                <span className="text-xs font-medium opacity-60">{p.label}</span>
              </div>
              <span className="text-xs font-bold">{p.value}<span className="text-[8px] opacity-40 ml-0.5">{p.unit}</span></span>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="flex justify-between pt-4 border-t border-white/10 text-[10px] uppercase font-bold tracking-widest opacity-60 px-2 mt-2">
        <div className="flex items-center gap-1.5"><Sunrise className="w-3 h-3 text-orange-300" /> {astro.sunrise}</div>
        <div className="flex items-center gap-1.5"><Sunset className="w-3 h-3 text-purple-300" /> {astro.sunset}</div>
      </div>
    </div>
  );
}
