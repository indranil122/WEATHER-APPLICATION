import { useParams, useNavigate } from 'react-router-dom';
import { WeatherData } from '../types';
import { getThemeByCode } from '../constants';
import { motion } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { GlassCard } from '../components/layout/GlassCard';
import { ArrowLeft, Sunrise, Sunset, CloudRain, Thermometer, Wind, Droplets } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { SunPath } from '../components/weather/SunPath';
import { cn } from '../lib/utils';

interface DayDetailProps {
  weather: WeatherData | null;
}

export function DayDetail({ weather }: DayDetailProps) {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();

  if (!weather || !date) {
    return (
      <div className="flex flex-col items-center justify-center p-8 mt-12 gap-4">
        <p className="text-slate-500">Weather data unavailable.</p>
        <button onClick={() => navigate('/')} className="clay-button px-6 py-3 rounded-full font-bold uppercase tracking-wider text-xs">
          Go Back
        </button>
      </div>
    );
  }

  const dayData = weather.forecast.forecastday.find(d => d.date.startsWith(date));

  if (!dayData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 mt-12 gap-4">
        <p className="text-slate-500">Day details not found.</p>
        <button onClick={() => navigate('/')} className="clay-button px-6 py-3 rounded-full font-bold uppercase tracking-wider text-xs">
          Go Back
        </button>
      </div>
    );
  }

  const theme = getThemeByCode(dayData.day.condition.code);
  const Icon = theme.icon;

  // Format hourly data for the chart
  const hourlyData = dayData.hour.map((h) => {
    const timeStr = typeof h.time === 'string' ? h.time : String(h.time);
    return {
      time: timeStr.includes('T') ? format(parseISO(timeStr), 'h a') : timeStr.split(' ')[1] || '00:00',
      temp: h.temp_c,
      rain: h.chance_of_rain
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full flex-1 flex flex-col gap-6 relative pb-12"
    >
      <button 
        onClick={() => navigate('/')}
        className="absolute -top-12 left-0 clay-button p-3 rounded-full flex items-center justify-center z-50 text-slate-600 dark:text-slate-300 transition-transform active:scale-90"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Hero Header */}
      <GlassCard className="p-8 rounded-[32px] overflow-hidden flex flex-col items-center justify-center text-center relative mt-6 border-b border-slate-100/20" delay={0.1}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-white/5 opacity-50" />
        <Icon className={cn("w-20 h-20 mb-4 drop-shadow-xl animate-pulse-slow", theme.accent)} strokeWidth={1.5} />
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
          {format(new Date(dayData.date), 'EEEE')}
        </h2>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
          {format(new Date(dayData.date), 'MMMM do, yyyy')}
        </p>
        
        <div className="flex items-center gap-6 mt-2">
            <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-slate-800 dark:text-slate-100">{Math.round(dayData.day.maxtemp_c)}°</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">High</span>
            </div>
            <div className="w-px h-12 bg-slate-300 dark:bg-slate-700/50" />
            <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-slate-800 dark:text-slate-100">{Math.round(dayData.day.mintemp_c)}°</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Low</span>
            </div>
        </div>
        <p className="mt-6 text-lg font-medium text-slate-600 dark:text-slate-300">
            {dayData.day.condition.text}
        </p>
      </GlassCard>

      {/* Sun Path Animation */}
      <SunPath sunrise={dayData.astro.sunrise} sunset={dayData.astro.sunset} delay={0.2} />

      {/* Hourly Forecast Chart */}
      <GlassCard className="p-6 rounded-[32px] flex flex-col gap-6" delay={0.4}>
        <div className="flex items-center gap-2">
           <CloudRain className="w-4 h-4 text-sky-500" />
           <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Hourly Rain & Temp</span>
        </div>
        
        <div className="h-[220px] w-full -ml-4">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
               <defs>
                 <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                   <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                 </linearGradient>
                 <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                   <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800/50" />
               <XAxis 
                 dataKey="time" 
                 axisLine={false} 
                 tickLine={false} 
                 tick={{ fontSize: 10, fill: '#94a3b8' }}
                 tickFormatter={(val) => val}      
               />
               <YAxis 
                 yAxisId="temp"
                 orientation="left"
                 axisLine={false} 
                 tickLine={false} 
                 tick={{ fontSize: 10, fill: '#f59e0b' }} 
                 domain={['dataMin - 2', 'dataMax + 2']}
               />
               <YAxis 
                 yAxisId="rain"
                 orientation="right"
                 axisLine={false} 
                 tickLine={false} 
                 tick={{ fontSize: 10, fill: '#0ea5e9' }} 
                 domain={[0, 100]}
               />
               <Tooltip 
                 contentStyle={{ 
                   borderRadius: '16px', 
                   border: 'none',
                   backgroundColor: 'rgba(255, 255, 255, 0.9)',
                   boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                   color: '#0f172a',
                   fontWeight: 'bold',
                   fontSize: '12px'
                 }}
               />
               <Area 
                 yAxisId="rain"
                 type="monotone" 
                 dataKey="rain" 
                 stroke="#0ea5e9" 
                 fillOpacity={1} 
                 fill="url(#colorRain)" 
                 strokeWidth={2}
                 name="Rain Chance (%)"
               />
               <Area 
                 yAxisId="temp"
                 type="monotone" 
                 dataKey="temp" 
                 stroke="#f59e0b" 
                 fillOpacity={1} 
                 fill="url(#colorTemp)" 
                 strokeWidth={3}
                 name="Temp (°C)"
               />
             </AreaChart>
           </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Hourly Scroll View for Detailed Temp checking */}
      <GlassCard className="p-6 rounded-[32px] flex flex-col gap-4" delay={0.5}>
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Time Breakdown</span>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2 snap-x">
          {hourlyData.map((hour, idx) => (
             <div key={idx} className="flex flex-col items-center gap-3 snap-start min-w-[60px] p-3 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/40 dark:border-slate-700/50 shadow-sm shrink-0">
               <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{hour.time}</span>
               <div className="flex flex-col items-center gap-1">
                 <span className="text-sm font-black text-slate-800 dark:text-slate-100">{Math.round(hour.temp)}°</span>
                 {hour.rain > 0 && <span className="text-[9px] font-bold text-sky-500 mt-1">{hour.rain}%</span>}
               </div>
             </div>
          ))}
        </div>
      </GlassCard>

    </motion.div>
  );
}
