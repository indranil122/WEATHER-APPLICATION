import { Wind, Droplets, Sun, Sunrise, Sunset, Moon as MoonIcon, Cloud, Activity, Thermometer, CloudRain, Gauge, Compass } from 'lucide-react';
import { WeatherData } from '../../types';
import { GlassCard } from '../layout/GlassCard';
import { cn } from '../../lib/utils';
import { useState, useEffect } from 'react';
import { getMoonPhase, getMoonPhaseName, getNextMoonPhaseDate } from '../../lib/moon';
import { SunPath } from './SunPath';
import { format } from 'date-fns';

interface WeatherDetailsProps {
  weather: WeatherData;
}

export function WeatherDetails({ weather }: WeatherDetailsProps) {
  const current = weather.current;
  const astro = weather.forecast.forecastday[0].astro;
  const currentDate = new Date(weather.location.localtime);
  
  const phaseValue = getMoonPhase(currentDate);
  const phaseName = getMoonPhaseName(phaseValue);
  const nextFullMoon = getNextMoonPhaseDate(currentDate, 0.5);
  const nextLastQuarter = getNextMoonPhaseDate(currentDate, 0.75);

  return (
    <div className="flex flex-col gap-6 h-full font-sans text-slate-800 pb-12 w-full">
      
      {/* 2-Column Grid for Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard delay={0.1} className="p-4 flex flex-col text-left group">
          <div className="flex items-center gap-1.5 mb-3 text-rose-500">
            <Thermometer className="w-3.5 h-3.5" />
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Feels Like</p>
          </div>
          <p className="text-xl font-bold flex items-baseline gap-1 mt-auto text-slate-800 dark:text-slate-100">
            {Math.round(current.feelslike_c)}
            <span className="text-[11px] text-slate-500 font-medium tracking-normal">°C</span>
          </p>
        </GlassCard>

        <GlassCard delay={0.15} className="p-4 flex flex-col text-left group">
          <div className="flex items-center gap-1.5 mb-3 text-sky-500">
            <CloudRain className="w-3.5 h-3.5" />
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Chance of Rain</p>
          </div>
          <p className="text-xl font-bold flex items-baseline gap-1 mt-auto text-slate-800 dark:text-slate-100">
            {current.precip_chance}
            <span className="text-[11px] text-slate-500 font-medium tracking-normal">%</span>
          </p>
        </GlassCard>

        <GlassCard delay={0.2} className="p-4 flex flex-col text-left group">
          <div className="flex items-center gap-1.5 mb-3 text-indigo-500">
            <Droplets className="w-3.5 h-3.5" />
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Precipitation</p>
          </div>
          <p className="text-xl font-bold flex items-baseline gap-1 mt-auto text-slate-800 dark:text-slate-100">
            {current.precip_mm}
            <span className="text-[11px] text-slate-500 font-medium tracking-normal">mm/m²</span>
          </p>
        </GlassCard>

        <GlassCard delay={0.25} className="p-4 flex flex-col text-left group">
          <div className="flex items-center gap-1.5 mb-3 text-teal-500">
            <Wind className="w-3.5 h-3.5" />
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Wind</p>
          </div>
          <p className="text-xl font-bold flex items-baseline gap-1 mt-auto text-slate-800 dark:text-slate-100">
            {current.wind_kph}
            <span className="text-[11px] text-slate-500 font-medium tracking-normal">km/h</span>
          </p>
        </GlassCard>

        <GlassCard delay={0.3} className="p-4 flex flex-col text-left group">
          <div className="flex items-center gap-1.5 mb-3 text-emerald-500">
            <Compass className="w-3.5 h-3.5" />
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Gusts</p>
          </div>
          <p className="text-xl font-bold flex items-baseline gap-1 mt-auto text-slate-800 dark:text-slate-100">
            {current.wind_gusts_kph}
            <span className="text-[11px] text-slate-500 font-medium tracking-normal">km/h</span>
          </p>
        </GlassCard>

        <GlassCard delay={0.35} className="p-4 flex flex-col text-left group">
          <div className="flex items-center gap-1.5 mb-3 text-violet-500">
            <Gauge className="w-3.5 h-3.5" />
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Pressure</p>
          </div>
          <p className="text-xl font-bold flex items-baseline gap-1 mt-auto text-slate-800 dark:text-slate-100">
            {current.pressure_mb}
            <span className="text-[11px] text-slate-500 font-medium tracking-normal">hPa</span>
          </p>
        </GlassCard>

        <GlassCard delay={0.4} className="p-4 flex flex-col text-left group">
          <div className="flex items-center gap-1.5 mb-3 text-blue-500">
            <Droplets className="w-3.5 h-3.5 opacity-60" />
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Humidity</p>
          </div>
          <p className="text-xl font-bold flex items-baseline gap-1 mt-auto text-slate-800 dark:text-slate-100">
            {current.humidity}
            <span className="text-[11px] text-slate-500 font-medium tracking-normal">%</span>
          </p>
        </GlassCard>

        <GlassCard delay={0.45} className="p-4 flex flex-col text-left group">
          <div className="flex items-center gap-1.5 mb-3 text-slate-400">
            <Cloud className="w-3.5 h-3.5" />
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Cloud Cover</p>
          </div>
          <p className="text-xl font-bold flex items-baseline gap-1 mt-auto text-slate-800 dark:text-slate-100">
            {current.cloud_cover}
            <span className="text-[11px] text-slate-500 font-medium tracking-normal">%</span>
          </p>
        </GlassCard>
      </div>

      {/* Sun and Moon Section */}
      <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mt-2 px-2">Sun & Moon</h3>
      
      {/* Sun Path Animated Card */}
      <SunPath sunrise={astro.sunrise} sunset={astro.sunset} delay={0.5} currentTime={weather.location.localtime} />

      {/* Moon Section */}
      <GlassCard delay={0.6} className="p-6 flex flex-col gap-5 overflow-hidden relative">
        <div className="absolute -top-12 -right-8 opacity-5">
           <MoonIcon className="w-48 h-48" />
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <MoonIcon className="w-4 h-4 text-slate-400 dark:text-slate-300" />
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Moon Phase</span>
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-full bg-slate-800 shadow-[inset_-6px_6px_10px_rgba(255,255,255,0.2)] flex items-center justify-center relative overflow-hidden">
             {/* Simple moon styling to mimic phase */}
             <div className="absolute inset-0 bg-slate-200" style={{ opacity: phaseValue > 0.4 && phaseValue < 0.6 ? 1 : 0.8 }}></div>
             <div className="absolute inset-0 bg-slate-900 rounded-full" 
               style={{ 
                 transform: `translateX(${phaseValue < 0.5 ? -100 + (phaseValue * 200) : (phaseValue - 0.5) * 200}%)`,
                 opacity: phaseValue > 0.45 && phaseValue < 0.55 ? 0 : 0.8
               }} 
             />
          </div>
          <div className="flex flex-col">
            <h4 className="text-xl font-black tracking-tight text-slate-800 dark:text-slate-100">{phaseName}</h4>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
              Next Full Moon: {format(nextFullMoon, 'MMM do')}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2 relative z-10">
           <div className="flex flex-col gap-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
             <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Full Moon</span>
             <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{format(nextFullMoon, 'MMM d, yyyy')}</span>
           </div>
           <div className="flex flex-col gap-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
             <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Last Qtr Moon</span>
             <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{format(nextLastQuarter, 'MMM d, yyyy')}</span>
           </div>
        </div>
      </GlassCard>

    </div>
  );
}
