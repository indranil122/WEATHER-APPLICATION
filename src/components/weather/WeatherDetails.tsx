import { Wind, Droplets, Sun, Sunrise, Sunset, Microscope, Cloud, Activity } from 'lucide-react';
import { WeatherData } from '../../types';
import { GlassCard } from '../layout/GlassCard';
import { cn } from '../../lib/utils';
import { useState } from 'react';

interface WeatherDetailsProps {
  weather: WeatherData;
}

export function WeatherDetails({ weather }: WeatherDetailsProps) {
  const current = weather.current;
  const astro = weather.forecast.forecastday[0].astro;
  const aq = current.air_quality;
  const [aqiStandard, setAqiStandard] = useState<'us'|'in'>('in');

  const pollutantLabels = [
    { label: 'PM2.5', value: Math.round(aq.pm2_5), unit: 'µg/m³' },
    { label: 'PM10', value: Math.round(aq.pm10), unit: 'µg/m³' },
    { label: 'NO2', value: Math.round(aq.no2), unit: 'µg/m³' },
  ];

  // US EPA standard
  function getUSAQIStatus(index: number) {
    const statuses = ['Good', 'Moderate', 'Unhealthy (SG)', 'Unhealthy', 'Very Unhealthy', 'Hazardous'];
    return statuses[index - 1] || 'Unknown';
  }

  function getUSAQIColor(index: number) {
    const colors = ['bg-emerald-500', 'bg-amber-500', 'bg-orange-500', 'bg-red-500', 'bg-purple-500', 'bg-red-900'];
    return colors[index - 1] || 'bg-slate-400';
  }

  // Indian NAQI Estimation
  function getIndiaNAQI(aq: any) {
    const calcSubIndex = (c: number, bps: [number, number, number, number][]) => {
      for (const [bpLow, bpHigh, iLow, iHigh] of bps) {
        if (c <= bpHigh) {
          return Math.round(((iHigh - iLow) / (bpHigh - bpLow)) * (c - bpLow) + iLow);
        }
      }
      return 500;
    };

    const pm25Bps: [number, number, number, number][] = [[0, 30, 0, 50], [31, 60, 51, 100], [61, 90, 101, 200], [91, 120, 201, 300], [121, 250, 301, 400], [251, 9999, 401, 500]];
    const pm10Bps: [number, number, number, number][] = [[0, 50, 0, 50], [51, 100, 51, 100], [101, 250, 101, 200], [251, 350, 201, 300], [351, 430, 301, 400], [431, 9999, 401, 500]];
    const no2Bps: [number, number, number, number][] = [[0, 40, 0, 50], [41, 80, 51, 100], [81, 180, 101, 200], [181, 280, 201, 300], [281, 400, 301, 400], [401, 9999, 401, 500]];

    const naqi = Math.max(
      calcSubIndex(aq.pm2_5 || 0, pm25Bps),
      calcSubIndex(aq.pm10 || 0, pm10Bps),
      calcSubIndex(aq.no2 || 0, no2Bps)
    );
    
    let status = 'Good'; let color = 'bg-emerald-500'; let textColor = 'text-emerald-500';
    let segments = 1;
    if (naqi > 400) { status = 'Severe'; color = 'bg-red-900'; textColor = 'text-red-900'; segments = 6;}
    else if (naqi > 300) { status = 'Very Poor'; color = 'bg-purple-500'; textColor = 'text-purple-500'; segments = 5;}
    else if (naqi > 200) { status = 'Poor'; color = 'bg-red-500'; textColor = 'text-red-500'; segments = 4;}
    else if (naqi > 100) { status = 'Moderate'; color = 'bg-orange-500'; textColor = 'text-orange-500'; segments = 3;}
    else if (naqi > 50) { status = 'Satisfactory'; color = 'bg-amber-500'; textColor = 'text-amber-500'; segments = 2;}
    
    return { value: naqi, status, color, textColor, segments };
  }

  const indiaAQI = getIndiaNAQI(aq);
  const isUS = aqiStandard === 'us';
  const activeColor = isUS ? getUSAQIColor(aq["us-epa-index"]) : indiaAQI.color;

  return (
    <div className="flex flex-col gap-5 h-full font-sans text-slate-800">
      
      {/* MINIMALISTIC AIR QUALITY */}
      <div className="px-1 flex flex-col items-stretch">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Air Quality</span>
            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", activeColor)} />
          </div>
          
          <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200/60 dark:bg-slate-800">
            <button 
              onClick={() => setAqiStandard('in')}
              className={cn("text-[9px] px-2 py-1 font-bold rounded-md uppercase tracking-wider transition-all", !isUS ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100" : "text-slate-400 hover:text-slate-600")}
            >
              India (NAQI)
            </button>
            <button 
              onClick={() => setAqiStandard('us')}
              className={cn("text-[9px] px-2 py-1 font-bold rounded-md uppercase tracking-wider transition-all", isUS ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100" : "text-slate-400 hover:text-slate-600")}
            >
              US EPA
            </button>
          </div>
        </div>
        
        {/* Segmented Progress Bar */}
        <div className="mb-5 h-1.5 w-full bg-slate-100/50 rounded-full flex gap-1 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              className={cn(
                "h-full flex-1 rounded-full transition-all duration-500",
                i <= (isUS ? aq["us-epa-index"] : indiaAQI.segments) ? activeColor : "bg-slate-200/50"
              )}
            />
          ))}
        </div>

        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
               <h3 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 leading-none">
                 {isUS ? getUSAQIStatus(aq["us-epa-index"]) : indiaAQI.status}
               </h3>
               {!isUS && <span className={cn("text-sm font-bold", indiaAQI.textColor)}>{indiaAQI.value}</span>}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-wider">
              {isUS ? "EPA Standard • [1-6]" : "Calculated NAQI Est."}
            </p>
          </div>
          
          <div className="flex gap-4">
            {pollutantLabels.map((p) => (
              <div key={p.label} className="flex flex-col items-end">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{p.label}</span>
                <div className="flex items-baseline gap-0.5 mt-0.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{p.value}</span>
                  <span className="text-[7px] text-slate-400 font-bold uppercase">{p.unit.split('/')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[1px] w-full bg-slate-200/50 my-1" />

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
