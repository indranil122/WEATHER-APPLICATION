import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { GlassCard } from '../layout/GlassCard';
import { Play, Pause, Layers } from 'lucide-react';
import { WeatherData } from '../../types';
import { cn } from '../../lib/utils';

// Fix leaflet icon path issues
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface RadarMapProps {
  weather: WeatherData | null;
  isDarkMode: boolean;
}

function MapUpdater({ lat, lon }: { lat: number, lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon]);
  }, [lat, lon, map]);
  return null;
}

export function RadarMap({ weather, isDarkMode }: RadarMapProps) {
  const [radarData, setRadarData] = useState<{time: number, path: string}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch rainviewer radar metadata
  useEffect(() => {
    async function fetchRadarTimes() {
      try {
        const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const data = await response.json();
        setRadarData(data.radar.past);
        setCurrentIndex(data.radar.past.length - 1); // Start at the latest time
      } catch (error) {
        console.error('Failed to load radar times:', error);
      }
    }
    fetchRadarTimes();
  }, []);

  // Animation effect
  useEffect(() => {
    let interval: any;
    if (isPlaying && radarData.length > 0) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % radarData.length);
      }, 1000); // 1 second per frame
    }
    return () => clearInterval(interval);
  }, [isPlaying, radarData]);

  const lat = weather?.location?.lat || 51.5074;
  const lon = weather?.location?.lon || -0.1278;

  const baseLayerUrl = isDarkMode 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const formatTime = (ts: number) => {
    return new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <GlassCard className="p-0 overflow-hidden rounded-[32px] flex flex-col h-[60vh] min-h-[400px] w-full relative z-0">
      <div className="absolute top-4 left-4 right-4 z-[400] flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white/20 dark:border-slate-800/50">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">
            Precipitation
          </span>
        </div>
        {radarData.length > 0 && (
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            {formatTime(radarData[currentIndex]?.time)}
          </span>
        )}
      </div>

      <MapContainer 
        center={[lat, lon]} 
        zoom={6} 
        zoomControl={false}
        className="w-full h-full z-0 pointer-events-auto"
        scrollWheelZoom={true}
      >
        <MapUpdater lat={lat} lon={lon} />
        <TileLayer
          url={baseLayerUrl}
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        
        {radarData.length > 0 && (
          <TileLayer
            url={`https://tilecache.rainviewer.com${radarData[currentIndex]?.path}/256/{z}/{x}/{y}/2/1_1.png`}
            opacity={0.7}
            zIndex={10}
            attribution='&copy; <a href="https://www.rainviewer.com/">RainViewer</a>'
          />
        )}
      </MapContainer>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400]">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-white dark:bg-slate-900 shadow-lg text-slate-800 dark:text-white px-6 py-3 rounded-full flex items-center gap-3 font-semibold hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-wider"
        >
          {isPlaying ? (
            <>
              <Pause className="w-5 h-5" /> Pause Radar
            </>
          ) : (
            <>
              <Play className="w-5 h-5 ml-1" /> Play Radar
            </>
          )}
        </button>
      </div>
    </GlassCard>
  );
}
