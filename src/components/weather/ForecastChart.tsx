import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeatherData } from '../../types';
import { GlassCard } from '../layout/GlassCard';
import { format, parse } from 'date-fns';
import { useUnit } from '../../context';
import { getTemp } from '../../lib/utils';

interface ForecastChartProps {
  weather: WeatherData;
}

export function ForecastChart({ weather }: ForecastChartProps) {
  const { unit } = useUnit();

  const hourlyData = weather.forecast.forecastday[0].hour.map((h, i) => ({
    time: format(new Date(h.time), 'HH:mm'),
    temp: Math.round(getTemp(h.temp_c, unit)),
    rain: h.chance_of_rain,
  })).filter((_, i) => i % 2 === 0); // Show every 2 hours for better spacing

  return (
    <section className="flex-1 flex flex-col gap-3 min-h-0 mt-2 text-slate-800 w-full px-2">
      <div className="flex justify-between items-end">
        <h3 className="text-sm font-bold uppercase tracking-wider opacity-80">Hourly Forecast</h3>
        <span className="text-xs font-medium opacity-60">Next 24 Hours</span>
      </div>
      <GlassCard className="flex-1 p-6" delay={0.4}>
        <div className="h-64 w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                dy={10}
              />
              <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#eef2f6', border: 'none', borderRadius: '16px', color: '#334155', boxShadow: '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff' }}
                itemStyle={{ color: '#334155', fontWeight: 600 }}
                labelStyle={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}
                cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '4 4' }}
              />
              <Area 
                type="monotone" 
                dataKey="temp" 
                stroke="#64748b" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#tempGradient)" 
                isAnimationActive={true}
                animationDuration={2000}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-between mt-2 px-2 border-t border-slate-300/50 pt-4">
          {hourlyData.slice(0, 8).map((hour, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-slate-500 font-medium text-[10px] mb-1">{hour.rain}%</span>
              <div className="w-1 bg-[#d1d9e6] rounded-full h-8 relative overflow-hidden shadow-inner">
                 <div 
                   className="absolute bottom-0 left-0 right-0 bg-blue-400 rounded-full transition-all duration-1000"
                   style={{ height: `${hour.rain}%` }}
                 />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </section>
  );
}
