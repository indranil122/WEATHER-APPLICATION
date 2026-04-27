import { useState, useEffect, useCallback } from 'react';
import { fetchWeather } from './services/weatherService';
import { WeatherData } from './types';
import { getThemeByCode, WEATHER_THEMES } from './constants';
import { UnitContext, TemperatureUnit } from './context';
import { Preloader } from './components/layout/Preloader';
import { GlassCard } from './components/layout/GlassCard';
import { Search } from './components/weather/Search';
import { WeatherHero } from './components/weather/WeatherHero';
import { WeatherDetails } from './components/weather/WeatherDetails';
import { ForecastChart } from './components/weather/ForecastChart';
import { DailyForecast } from './components/weather/DailyForecast';
import { RadarPreview } from './components/weather/RadarPreview';
import { motion, AnimatePresence } from 'motion/react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Loader2, AlertCircle, Bookmark, History, Moon, Sun } from 'lucide-react';
import { DayDetail } from './pages/DayDetail';
import { MapPage } from './pages/MapPage';
import { cn } from './lib/utils';

export default function App() {
  const [query, setQuery] = useState('London');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [lastCoords, setLastCoords] = useState<{lat: number, lon: number, name: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedCities, setSavedCities] = useState<{name: string, lat: number, lon: number}[]>(() => {
    const saved = localStorage.getItem('savedCitiesV2');
    return saved ? JSON.parse(saved) : [];
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [unit, setUnit] = useState<TemperatureUnit>(() => {
    return (localStorage.getItem('tempUnit') as TemperatureUnit) || 'C';
  });
  const [reveal, setReveal] = useState<{ x: number, y: number, active: boolean }>({ x: 0, y: 0, active: false });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('tempUnit', unit);
  }, [unit]);

  const toggleUnit = () => {
    setUnit(prev => prev === 'C' ? 'F' : 'C');
  };

  const toggleDarkMode = (e: React.MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;
    
    setReveal({ x, y, active: true });
    
    // Toggle theme after a small delay to match animation start
    setTimeout(() => {
      setIsDarkMode(!isDarkMode);
    }, 150);

    // Reset reveal state after animation
    setTimeout(() => {
      setReveal(prev => ({ ...prev, active: false }));
    }, 1000);
  };

  const loadWeather = useCallback(async (lat: number, lon: number, name?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWeather(lat, lon);
      if (name) {
        data.location.name = name; // Update name only if specifically provided for search
      }
      setWeather(data);
      setLastCoords({lat, lon, name: data.location.name});
    } catch (err: any) {
      setError(err.message || 'Failed to load weather data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          loadWeather(position.coords.latitude, position.coords.longitude);
        },
        () => loadWeather(51.5074, -0.1278, 'London')
      );
    } else {
      loadWeather(51.5074, -0.1278, 'London');
    }
  }, [loadWeather]);

  const toggleSaveCity = (city: {name: string, lat: number, lon: number}) => {
    const isSaved = savedCities.some(c => c.name === city.name);
    const newSaved = isSaved
      ? savedCities.filter(c => c.name !== city.name)
      : [city, ...savedCities].slice(0, 5);
    
    setSavedCities(newSaved);
    localStorage.setItem('savedCitiesV2', JSON.stringify(newSaved));
  };

  const theme = weather 
    ? getThemeByCode(weather.current.condition.code) 
    : WEATHER_THEMES.sunny;

  const currentCityName = weather?.location.name;
  const isCitySaved = weather && savedCities.some(c => c.name === weather.location.name);
  const location = useLocation();
  const isDayDetail = location.pathname.startsWith('/day');
  const isMapPage = location.pathname === '/map';

  return (
    <UnitContext.Provider value={{ unit, toggleUnit }}>
    <div className={cn(
      "min-h-[100dvh] w-full transition-all duration-1000 ease-in-out font-sans text-slate-800 dark:text-slate-100 pb-24", // pb-24 to add space for the bottom tab bar
      theme.gradient
    )}>
      {/* Reveal Overlay */}
      {reveal.active && (
        <div 
          className="reveal-circle reveal-active"
          style={{ 
            left: reveal.x, 
            top: reveal.y,
            backgroundColor: isDarkMode ? '#f8fafc' : '#020617' 
          }} 
        />
      )}
      
      <Preloader loading={loading} />

      <div className="flex flex-col gap-6 min-h-full p-4 md:p-8 max-w-[600px] mx-auto relative z-10 w-full">
        {!isDayDetail && !isMapPage && (
          <header className="flex flex-col gap-4 min-h-[48px] items-center text-center relative w-full pt-2">
            {/* Theme & Unit Toggle Widget */}
            <div className="absolute top-0 right-0 flex gap-2 z-[100]">
              <button
                onClick={toggleUnit}
                className="w-12 h-12 flex items-center justify-center rounded-full clay-button hover:scale-110 active:scale-95 transition-all text-slate-600 dark:text-slate-300 font-bold"
              >
                °{unit}
              </button>
              <button
                 onClick={toggleDarkMode}
                 className="w-12 h-12 flex items-center justify-center rounded-full clay-button hover:scale-110 active:scale-95 transition-all text-slate-600 dark:text-slate-300"
              >
                 {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="flex flex-col items-center justify-center w-full">
              <div className="flex flex-col items-center gap-3">
                <div className="clay-button w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                  <theme.icon className={cn("w-5 h-5", theme.accent)} />
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-semibold leading-tight text-slate-800 dark:text-slate-100">{currentCityName || 'SkyCast AI'}</h1>
                    {weather && lastCoords && (
                      <button 
                        onClick={() => toggleSaveCity({ name: weather.location.name, lat: lastCoords.lat, lon: lastCoords.lon })}
                        className="p-1.5 focus:outline-none transition-transform active:scale-90"
                      >
                        <Bookmark className={cn("w-4 h-4 transition-colors", isCitySaved ? "fill-blue-600 text-blue-600" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300")} />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-medium">
                    {weather ? new Date(weather.location.localtime).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'Loading...'}
                  </p>
                </div>
              </div>
              {savedCities.length > 0 && (
                <div className="hidden sm:flex gap-2 flex-wrap justify-center mt-4 pb-1 max-w-full no-scrollbar">
                  {savedCities.map(city => (
                    <button
                      key={city.name}
                      onClick={() => loadWeather(city.lat, city.lon, city.name)}
                      className="px-3 py-1 clay-button rounded-full text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider transition-all"
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Mobile saved cities chips */}
            {savedCities.length > 0 && (
              <div className="flex sm:hidden gap-2 overflow-x-auto pb-2 -mx-4 px-4 w-[calc(100%+2rem)] no-scrollbar relative snap-x justify-center">
                {savedCities.map((city, idx) => (
                  <button
                    key={`${city.name}-${idx}`}
                    onClick={() => loadWeather(city.lat, city.lon, city.name)}
                    className="px-4 py-2 shrink-0 clay-button rounded-full text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase tracking-widest transition-all snap-start shadow-sm whitespace-nowrap"
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            )}
          </header>
        )}

        <main className="flex-1 overflow-visible relative z-10 flex flex-col w-full h-full relative">
          <AnimatePresence mode="wait">
            {!loading && error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="clay-card rounded-3xl p-8 sm:p-12 text-center mt-10 max-w-lg mx-auto w-full"
              >
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-slate-800 text-xl font-bold mb-2">Something went wrong</h3>
                <p className="text-slate-500 mb-6 text-sm">{error}</p>
                <button 
                  onClick={() => loadWeather(51.5074, -0.1278, 'London')}
                  className="px-6 py-2.5 clay-button rounded-[24px] text-slate-700 transition-all font-semibold uppercase tracking-wider text-xs"
                >
                  Try London
                </button>
              </motion.div>
            ) : !loading && weather && (
              <Routes>
                <Route path="/" element={
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="w-full flex-1 flex flex-col gap-6"
                  >
                    {/* Hero Section */}
                    <GlassCard className="p-0 rounded-[32px] overflow-hidden flex items-center justify-between" delay={0.1}>
                      <WeatherHero weather={weather} theme={theme} />
                    </GlassCard>
                    
                    <GlassCard className="p-6 rounded-[32px]" delay={0.2}>
                      <DailyForecast weather={weather} />
                    </GlassCard>

                    <div>
                        <ForecastChart weather={weather} />
                    </div>

                    <div className="flex flex-col gap-6 w-full">
                      <WeatherDetails weather={weather} />
                    </div>

                    <div className="flex flex-col gap-6 w-full pb-8">
                       <RadarPreview weather={weather} isDarkMode={isDarkMode} />
                    </div>
                  </motion.div>
                } />
                <Route path="/day/:date" element={<DayDetail weather={weather} />} />
                <Route path="/map" element={<MapPage weather={weather} isDarkMode={isDarkMode} />} />
              </Routes>
            )}
          </AnimatePresence>
        </main>

      </div>
      
      {/* Fixed Search Pill at the bottom */}
      {!loading && !error && !isDayDetail && !isMapPage && (
        <div className="fixed bottom-6 left-0 right-0 z-[100] px-4 md:px-0 mx-auto w-full max-w-[320px]">
          <Search onSelect={loadWeather} isLoading={loading} />
        </div>
      )}
    </div>
    </UnitContext.Provider>
  );
}
