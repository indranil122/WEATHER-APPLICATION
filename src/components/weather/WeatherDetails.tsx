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

  const pollutantLabels = [
    { label: 'PM2.5', value: Math.round(aq.pm2_5), icon: Microscope, unit: 'µg/m³' },
    { label: 'O3', value: Math.round(aq.o3), icon: Cloud, unit: 'µg/m³' },
  ];

  function getAQIStatus(index: number) {
    const statuses = ['Good', 'Moderate', 'Unhealthy (SG)', 'Unhealthy', 'Very Unhealthy', 'Hazardous'];
    return statuses[index - 1] || 'Unknown';
  }

  function getAQIColor(index: number) {
    const colors = ['bg-emerald-500', 'bg-amber-500', 'bg-orange-500', 'bg-red-500', 'bg-purple-500', 'bg-red-900'];
    return colors[index - 1] || 'bg-slate-400';
  }

  return (
    <div className="flex flex-col gap-4 h-full font-sans text-slate-800">
      
      {/* BIG CARD: AQI & Pollutants */}
      <GlassCard delay={0.1} className="p-5 flex flex-col group">
        <div className="flex items-center gap-1.5 opacity-60 mb-4 text-slate-500">
          <WindIcon className="w-3.5 h-3.5" />
          <p className="text-[11px] uppercase font-bold tracking-widest">Air Quality</p>
        </div>
        <div className="flex items-center gap-4 mb-5">
          <div className={`w-2.5 h-10 rounded-full ${getAQIColor(aq["us-epa-index"])} shadow-inner`} />
          <div>
            <p className="text-2xl font-bold leading-tight tracking-tight text-slate-800">{getAQIStatus(aq["us-epa-index"])}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Targeting US EPA Index {aq["us-epa-index"]}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-4 border-t border-slate-300/50">
          {pollutantLabels.map((p) => (
            <div key={p.label} className="flex flex-col gap-1">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.label}</span>
               <span className="text-sm font-semibold text-slate-700">{p.value}<span className="text-[9px] text-slate-400 ml-0.5 font-normal">{p.unit}</span></span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* MEDIUM CARDS: Grid for Wind, Humidity */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard delay={0.2} className="p-4 flex flex-col text-left group">
          <div className="flex items-center gap-1.5 mb-3 text-sky-500">
            <Wind className="w-3.5 h-3.5" />
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Wind</p>
          </div>
          <p className="text-xl font-bold flex items-baseline gap-1 mt-auto text-slate-800">
            {current.wind_kph}
            <span className="text-[11px] text-slate-500 font-medium tracking-normal">km/h</span>
          </p>
        </GlassCard>

        <GlassCard delay={0.25} className="p-4 flex flex-col text-left group">
          <div className="flex items-center gap-1.5 mb-3 text-blue-500">
            <Droplets className="w-3.5 h-3.5" />
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Humidity</p>
          </div>
          <p className="text-xl font-bold flex items-baseline gap-1 mt-auto text-slate-800">
            {current.humidity}
            <span className="text-[11px] text-slate-500 font-medium tracking-normal">%</span>
          </p>
        </GlassCard>
      </div>
      
      {/* MEDIUM CARD: UV Index */}
      <GlassCard delay={0.3} className="p-4 flex flex-col text-left group">
         <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-2 text-amber-500">
                <Sun className="w-3.5 h-3.5" />
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">UV Index</p>
              </div>
              <p className="text-xl font-bold mt-1 text-slate-800">{current.uv} <span className="text-xs font-medium text-slate-500">
                {current.uv > 7 ? 'High' : current.uv > 3 ? 'Moderate' : 'Low'}
              </span></p>
            </div>
            <div className="flex flex-col gap-2 pl-4 border-l border-slate-300/50 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                <div className="flex items-center gap-2"><Sunrise className="w-3.5 h-3.5 text-amber-500" /> {astro.sunrise}</div>
                <div className="flex items-center gap-2"><Sunset className="w-3.5 h-3.5 text-indigo-400" /> {astro.sunset}</div>
            </div>
         </div>
      </GlassCard>
    </div>
  );
}
