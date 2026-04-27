import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Play, Pause, Layers, ArrowLeft, AlertTriangle } from 'lucide-react';
import { WeatherData } from '../types';
import { useNavigate } from 'react-router-dom';

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

// Custom alert icon for disasters
const alertHtml = `<div style="background-color: #ef4444; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg></div>`;
const AlertIcon = L.divIcon({
  html: alertHtml,
  className: 'custom-alert-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface MapPageProps {
  weather: WeatherData | null;
  isDarkMode: boolean;
}

function MapUpdater({ lat, lon }: { lat: number, lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], map.getZoom());
  }, [lat, lon, map]);
  return null;
}

type LayerMode = 'precipitation' | 'disaster';

export function MapPage({ weather, isDarkMode }: MapPageProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<LayerMode>('precipitation');
  
  // Precipitation states
  const [radarData, setRadarData] = useState<{time: number, path: string}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Disaster states
  const [disasters, setDisasters] = useState<any[]>([]);
  const [loadingDisasters, setLoadingDisasters] = useState(false);

  // Fetch rainviewer radar metadata
  useEffect(() => {
    async function fetchRadarTimes() {
      try {
        const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const data = await response.json();
        if (data.radar && data.radar.past) {
          setRadarData(data.radar.past);
          setCurrentIndex(data.radar.past.length - 1); // Start at the latest time
        }
      } catch (error) {
        console.error('Failed to load radar times:', error);
      }
    }
    fetchRadarTimes();
  }, []);

  // Fetch EONET Disasters
  useEffect(() => {
    if (mode === 'disaster' && disasters.length === 0) {
      async function fetchDisasters() {
        setLoadingDisasters(true);
        try {
          const response = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open');
          const data = await response.json();
          if (data.events) {
            setDisasters(data.events);
          }
        } catch (err) {
          console.error("Failed to load disasters", err);
        } finally {
          setLoadingDisasters(false);
        }
      }
      fetchDisasters();
    }
  }, [mode, disasters.length]);

  // Animation effect for precipitation
  useEffect(() => {
    let interval: any;
    if (isPlaying && radarData.length > 0 && mode === 'precipitation') {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % radarData.length);
      }, 1000); // 1 second per frame
    }
    return () => clearInterval(interval);
  }, [isPlaying, radarData, mode]);

  const lat = weather?.location?.lat || 51.5074;
  const lon = weather?.location?.lon || -0.1278;

  const baseLayerUrl = isDarkMode 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const formatTime = (ts: number) => {
    return new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-[999] w-screen h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
      {/* Header / Controls overlay */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pointer-events-none">
        
        <div className="flex items-center gap-3 pointer-events-auto">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-lg text-slate-800 dark:text-white hover:scale-105 active:scale-95 transition-all border border-slate-200 dark:border-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex bg-white dark:bg-slate-900 shadow-lg rounded-full p-1 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setMode('precipitation')}
              className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                mode === 'precipitation' 
                  ? 'bg-blue-500 text-white shadow-sm hover:bg-blue-600' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Precipitation
              </div>
            </button>
            <button
              onClick={() => setMode('disaster')}
              className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                mode === 'disaster' 
                  ? 'bg-red-500 text-white shadow-sm hover:bg-red-600' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Disasters
              </div>
            </button>
          </div>
        </div>

        {mode === 'precipitation' && radarData.length > 0 && (
          <div className="pointer-events-auto flex items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 font-mono tracking-tight">
            {formatTime(radarData[currentIndex]?.time)}
          </div>
        )}
      </div>

      <MapContainer 
        center={[lat, lon]} 
        zoom={5} 
        zoomControl={true}
        className="w-full h-full z-0"
        scrollWheelZoom={true}
      >
        <MapUpdater lat={lat} lon={lon} />
        <TileLayer
          url={baseLayerUrl}
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        
        {/* Precipitation Layer */}
        {mode === 'precipitation' && radarData.length > 0 && (
          <TileLayer
            url={`https://tilecache.rainviewer.com${radarData[currentIndex]?.path}/256/{z}/{x}/{y}/2/1_1.png`}
            opacity={0.7}
            zIndex={10}
            attribution='&copy; <a href="https://www.rainviewer.com/">RainViewer</a>'
          />
        )}

        {/* Home/Search Location Marker */}
        <Marker position={[lat, lon]}>
          <Popup>
            <div className="font-sans">
              <strong>{weather?.location.name}</strong><br/>
              Selected Location
            </div>
          </Popup>
        </Marker>

        {/* Disaster Layer */}
        {mode === 'disaster' && disasters.map((event, idx) => {
          // EONET usually stores geometry coordinates chronologically. Get the latest one.
          const latestGeo = event.geometry?.[event.geometry.length - 1];
          const coords = latestGeo?.coordinates;
          if (!coords || !Array.isArray(coords) || coords.length < 2) return null;
          // React-Leaflet expects [latitude, longitude]
          const eventLat = coords[1];
          const eventLon = coords[0];

          return (
            <Marker key={`disaster-${idx}`} position={[eventLat, eventLon]} icon={AlertIcon}>
              <Popup>
                <div className="font-sans min-w-[200px]">
                  <strong className="text-red-600 block mb-1 text-sm leading-tight">{event.title}</strong>
                  <div className="text-xs text-slate-500 mb-2">
                    {event.categories.map((c: any) => c.title).join(', ')}
                  </div>
                  {latestGeo?.date && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      {new Date(latestGeo.date).toLocaleString()}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Bottom Controls for Precipitation */}
      {mode === 'precipitation' && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000]">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white px-8 py-3.5 rounded-full flex items-center gap-3 font-bold hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-wider"
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5 text-blue-500" /> Pause Radar
              </>
            ) : (
              <>
                <Play className="w-5 h-5 ml-1 text-blue-500" /> Play Radar
              </>
            )}
          </button>
        </div>
      )}

      {/* Loading Disasters indicator */}
      {mode === 'disaster' && loadingDisasters && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000]">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur shadow-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white px-6 py-3 rounded-full flex items-center gap-3 font-semibold text-sm">
            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            Loading Active Events...
          </div>
        </div>
      )}
    </div>
  );
}
