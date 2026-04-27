import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Play, Pause, Layers, ArrowLeft, AlertTriangle, Maximize, Minimize, Activity, Droplets, Mountain, CloudLightning, Flame } from 'lucide-react';
import { WeatherData } from '../types';
import { useNavigate } from 'react-router-dom';
import { renderToString } from 'react-dom/server';

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

// Custom alert icon for disasters function
const getDisasterIcon = (categories: string[]) => {
  const catNames = categories.join(' ').toLowerCase();
  
  let IconComponent = AlertTriangle;
  let bgColor = '#ef4444'; // default red

  if (catNames.includes('earthquake')) {
    IconComponent = Activity;
    bgColor = '#f97316'; // orange
  } else if (catNames.includes('flood')) {
    IconComponent = Droplets;
    bgColor = '#3b82f6'; // blue
  } else if (catNames.includes('volcano')) {
    IconComponent = Mountain; 
    bgColor = '#7c2d12'; // dark brown/red
  } else if (catNames.includes('storm')) {
    IconComponent = CloudLightning;
    bgColor = '#64748b'; // slate
  } else if (catNames.includes('wildfire') || catNames.includes('fire')) {
    IconComponent = Flame;
    bgColor = '#ef4444'; // red
  }

  const iconSvg = renderToString(<IconComponent size={14} color="white" strokeWidth={2} />);
  
  const alertHtml = `<div style="background-color: ${bgColor}; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">${iconSvg}</div>`;
  
  return L.divIcon({
    html: alertHtml,
    className: 'custom-alert-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Precipitation states
  const [radarData, setRadarData] = useState<{time: number, path: string}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Disaster states
  const [disasters, setDisasters] = useState<any[]>([]);
  const [loadingDisasters, setLoadingDisasters] = useState(false);

  // Toggle FullScreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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

  // Fetch Disasters
  useEffect(() => {
    if (mode === 'disaster' && disasters.length === 0) {
      async function fetchDisasters() {
        setLoadingDisasters(true);
        try {
          // 1. Fetch EONET (filtered to impactful categories)
          const eonetRes = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&category=earthquakes,floods,severeStorms,volcanoes,wildfires');
          const eonetData = await eonetRes.json();
          let parsedDisasters: any[] = [];
          if (eonetData.events) {
            parsedDisasters = eonetData.events.map((e: any) => {
              const latestGeo = e.geometry?.[e.geometry.length - 1];
              return {
                id: e.id,
                title: e.title,
                categories: e.categories.map((c: any) => c.title),
                lat: latestGeo?.coordinates[1],
                lon: latestGeo?.coordinates[0],
                date: latestGeo?.date,
                source: 'NASA EONET'
              };
            });
          }

          // 2. Fetch USGS Earthquakes (last 7 days, > 4.5 mag)
          const usgsRes = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson');
          const usgsData = await usgsRes.json();
          if (usgsData.features) {
            const quakes = usgsData.features.map((f: any) => ({
              id: f.id,
              title: f.properties.title,
              categories: ['Earthquakes'],
              lat: f.geometry.coordinates[1],
              lon: f.geometry.coordinates[0],
              date: new Date(f.properties.time).toISOString(),
              source: 'USGS',
              mag: f.properties.mag
            }));
            parsedDisasters = [...parsedDisasters, ...quakes];
          }

          setDisasters(parsedDisasters);
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
    <div ref={containerRef} className="fixed inset-0 z-[999] w-screen h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
      {/* Header / Controls overlay */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pointer-events-none">
        
        <div className="flex flex-wrap items-center gap-3 pointer-events-auto">
          {!isFullscreen && (
            <button 
              onClick={() => navigate(-1)}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-lg text-slate-800 dark:text-white hover:scale-105 active:scale-95 transition-all border border-slate-200 dark:border-slate-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="flex bg-white dark:bg-slate-900 shadow-lg rounded-full p-1 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setMode('precipitation')}
              className={`px-4 sm:px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                mode === 'precipitation' 
                  ? 'bg-blue-500 text-white shadow-sm hover:bg-blue-600' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Precipitation</span>
                <span className="sm:hidden">Rain</span>
              </div>
            </button>
            <button
              onClick={() => setMode('disaster')}
              className={`px-4 sm:px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
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
          
          <button
            onClick={toggleFullScreen}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-lg text-slate-800 dark:text-white hover:scale-105 active:scale-95 transition-all border border-slate-200 dark:border-slate-800"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
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
          if (!event.lat || !event.lon) return null;

          return (
            <Marker key={`disaster-${event.id}-${idx}`} position={[event.lat, event.lon]} icon={getDisasterIcon(event.categories)}>
              <Popup>
                <div className="font-sans min-w-[200px]">
                  <strong className="text-red-600 block mb-1 text-sm leading-tight">{event.title}</strong>
                  <div className="text-xs text-slate-500 mb-2">
                    {event.categories.join(', ')}
                  </div>
                  {event.mag && (
                    <div className="text-xs font-bold text-orange-600 mb-1">
                      Magnitude: {event.mag}
                    </div>
                  )}
                  {event.date && (
                    <div className="text-[10px] text-slate-400 font-mono mb-2">
                      {new Date(event.date).toLocaleString()}
                    </div>
                  )}
                  <div className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded inline-block">
                    Source: {event.source}
                  </div>
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
