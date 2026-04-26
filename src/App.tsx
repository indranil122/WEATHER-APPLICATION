import { useState, useEffect, useCallback } from 'react';
import { fetchWeather, getWeatherSummary } from './services/weatherService';
import { WeatherData } from './types';
import { getThemeByCode, WEATHER_THEMES } from './constants';
import { Preloader } from './components/layout/Preloader';
import { GlassCard } from './components/layout/GlassCard';
import { Search } from './components/weather/Search';
import { WeatherHero } from './components/weather/WeatherHero';
import { WeatherDetails } from './components/weather/WeatherDetails';
import { ForecastChart } from './components/weather/ForecastChart';
import { DailyForecast } from './components/weather/DailyForecast';
import { AISummary } from './components/weather/AISummary';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, AlertCircle, Bookmark, History } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [query, setQuery] = useState('London');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [lastCoords, setLastCoords] = useState<{lat: number, lon: number, name: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [savedCities, setSavedCities] = useState<{name: string, lat: number, lon: number}[]>(() => {
    const saved = localStorage.getItem('savedCitiesV2');
    return saved ? JSON.parse(saved) : [];
  });

  const generateAISummary = async () => {
    if (!weather) return;
    try {
      setSummaryLoading(true);
      const aiSummary = await getWeatherSummary(weather);
      setSummary(aiSummary);
    } catch (err) {
      console.error("AI Summary error:", err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const loadWeather = useCallback(async (lat: number, lon: number, name: string) => {
    try {
      setLoading(true);
      setError(null);
      setSummary(''); // Clear previous summary
      const data = await fetchWeather(lat, lon);
      data.location.name = name; // Update name
      setWeather(data);
      setLastCoords({lat, lon, name});
    } catch (err: any) {
      setError(err.message || 'Failed to load weather data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load: Try geolocation, fallback to London (51.5, -0.1)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          loadWeather(position.coords.latitude, position.coords.longitude, 'Current Location');
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

  return (
    <div className={cn(
      "min-h-screen w-full transition-all duration-1000 ease-in-out font-sans text-slate-800",
      theme.gradient
    )}>
      <Preloader loading={loading} />

      <div className="flex flex-col gap-6 min-h-screen p-4 md:p-8 max-w-[1024px] mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 min-h-[48px]">
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="clay-button w-10 h-10 rounded-full flex items-center justify-center shrink-0">
              <theme.icon className={cn("w-5 h-5", theme.accent)} />
            </div>
            <div>
              <h1 className="text-xl font-semibold leading-tight text-slate-800">{currentCityName || 'SkyCast AI'}</h1>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">
                {weather ? new Date(weather.location.localtime).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'Loading...'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2 z-50">
            <Search onSelect={loadWeather} isLoading={loading} />
            {savedCities.length > 0 && (
              <div className="flex gap-2 flex-wrap justify-end overflow-x-auto pb-1 max-w-full no-scrollbar">
                {savedCities.map(city => (
                  <button
                    key={city.name}
                    onClick={() => loadWeather(city.lat, city.lon, city.name)}
                    className="px-3 py-1 clay-button rounded-full text-slate-600 text-[10px] font-bold uppercase tracking-wider transition-all"
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative z-10 flex flex-col">
          <AnimatePresence mode="wait">
            {!loading && error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="clay-card rounded-3xl p-12 text-center mt-20 max-w-lg mx-auto"
              >
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-slate-800 text-xl font-bold mb-2">Something went wrong</h3>
                <p className="text-slate-500 mb-6">{error}</p>
                <button 
                  onClick={() => loadWeather(51.5074, -0.1278, 'London')}
                  className="px-6 py-2 clay-button rounded-[24px] text-slate-700 transition-all font-semibold"
                >
                  Try London
                </button>
              </motion.div>
            ) : !loading && weather && (
              <motion.div
                key={weather.location.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 auto-rows-min"
              >
                {/* Hero Section */}
                <GlassCard className="md:col-span-2 p-0 rounded-[32px] overflow-hidden flex items-center justify-between" delay={0.2}>
                  <WeatherHero weather={weather} theme={theme} />
                </GlassCard>

                {/* Details Column */}
                <div className="md:col-span-1 flex flex-col gap-6">
                  <WeatherDetails weather={weather} />
                  <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => weather && lastCoords && toggleSaveCity({ name: weather.location.name, lat: lastCoords.lat, lon: lastCoords.lon })}
                      className={cn(
                        "relative overflow-hidden group flex items-center justify-center gap-2 px-6 py-4 rounded-[24px] transition-all text-sm font-bold uppercase tracking-wider",
                        savedCities.some(c => c.name === weather.location.name) 
                          ? "clay-button text-blue-600 shadow-inner" 
                          : "clay-button text-slate-600 hover:text-slate-800"
                      )}
                    >
                      <Bookmark className={cn("w-4 h-4", savedCities.some(c => c.name === weather.location.name) && "fill-current")} />
                      {savedCities.some(c => c.name === weather.location.name) ? 'Saved' : 'Save City'}
                    </motion.button>
                </div>

                {/* Bottom Section */}
                <div className="md:col-span-2">
                    <AISummary 
                        summary={summary} 
                        isLoading={summaryLoading} 
                        onGenerate={generateAISummary} 
                    />
                    <div className="mt-6">
                        <ForecastChart weather={weather} />
                    </div>
                </div>

                <div className="md:col-span-1">
                  <DailyForecast weather={weather} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="pt-4 text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] relative z-10 border-t border-slate-300/50">
          <p>© 2026 SkyCast AI • Powered by WeatherAPI & Gemini</p>
        </footer>
      </div>
    </div>
  );
}
