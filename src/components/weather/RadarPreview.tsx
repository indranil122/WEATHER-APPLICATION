import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { GlassCard } from '../layout/GlassCard';
import { Layers, Maximize2 } from 'lucide-react';
import { WeatherData } from '../../types';
import { useNavigate } from 'react-router-dom';

interface RadarPreviewProps {
  weather: WeatherData | null;
  isDarkMode: boolean;
}

export function RadarPreview({ weather, isDarkMode }: RadarPreviewProps) {
  const navigate = useNavigate();
  const lat = weather?.location?.lat || 51.5074;
  const lon = weather?.location?.lon || -0.1278;

  const baseLayerUrl = isDarkMode 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  return (
    <GlassCard 
      className="p-0 overflow-hidden rounded-[32px] flex flex-col h-[200px] w-full relative z-0 cursor-pointer group"
      onClick={() => navigate('/map')}
    >
      <div className="absolute top-4 left-4 right-4 z-[400] flex justify-between items-center text-slate-800 dark:text-slate-200">
        <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white/20 dark:border-slate-800/50">
          <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span className="text-sm font-bold uppercase tracking-widest">
            Radar & Alerts
          </span>
        </div>
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-2 rounded-full shadow-sm border border-white/20 dark:border-slate-800/50 group-hover:scale-110 transition-transform">
          <Maximize2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </div>
      </div>

      <MapContainer 
        center={[lat, lon]} 
        zoom={5} 
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        className="w-full h-full z-0 pointer-events-none"
      >
        <TileLayer url={baseLayerUrl} />
      </MapContainer>

      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent z-[100]" />
    </GlassCard>
  );
}
