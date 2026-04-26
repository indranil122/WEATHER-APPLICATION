import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeatherData } from '../../types';
import { GlassCard } from '../layout/GlassCard';
import { format, parse } from 'date-fns';

interface ForecastChartProps {
  weather: WeatherData;
}

export function ForecastChart({ weather }: ForecastChartProps) {
  const hourlyData = weather.forecast.forecastday[0].hour.map((h, i) => ({
    time: format(new Date(h.time), 'HH:mm'),
    temp: h.temp_c,
    rain: h.chance_of_rain,
  })).filter((_, i) => i % 2 === 0); // Show every 2 hours for better spacing

  return (
    <section className="flex-1 flex flex-col gap-3 min-h-0 mt-0">
      <div className="flex justify-between items-end px-1">
        <h3 className="text-sm font-bold uppercase tracking-wider opacity-80">Hourly Forecast</h3>
        <span className="text-xs font-medium opacity-60">Next 24 Hours</span>
      </div>
      <GlassCard className="flex-1 p-6" delay={0.4}>
        <div className="h-64 w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fff" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <XAxis 
                dataKey="time" 
                stroke="#ffffff60" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                dy={10}
              />
              <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
                itemStyle={{ color: '#fff', fontWeight: 600 }}
                labelStyle={{ color: '#ffffff80', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}
                cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 2, strokeDasharray: '4 4' }}
              />
              <Area 
                type="monotone" 
                dataKey="temp" 
                stroke="#fff" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#tempGradient)" 
                isAnimationActive={true}
                animationDuration={2000}
                animationEasing="ease-out"
                filter="url(#glow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-between mt-2 px-2 border-t border-white/10 pt-4">
          {hourlyData.slice(0, 8).map((hour, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-white/40 text-[10px] mb-1">{hour.rain}%</span>
              <div className="w-1 bg-white/20 rounded-full h-8 relative overflow-hidden">
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
