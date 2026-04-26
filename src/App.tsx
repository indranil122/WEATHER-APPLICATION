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
      "min-h-screen w-full transition-all duration-1000 ease-in-out font-sans",
      "bg-gradient-to-br",
      theme.gradient
    )}>
      <Preloader loading={loading} />
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-1/4 -left-1/4 w-[80%] h-[80%] bg-white/20 blur-[80px] md:blur-[120px] rounded-full mix-blend-overlay" 
        />
        <div 
          className="absolute -bottom-1/4 -right-1/4 w-[70%] h-[70%] bg-blue-400/20 blur-[100px] md:blur-[150px] rounded-full mix-blend-overlay" 
        />
      </div>

      <div className="flex flex-col gap-6 min-h-screen p-4 md:p-8 max-w-[1024px] mx-auto relative z-10 text-white">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 min-h-[48px]">
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="bg-[#ffffff33] w-10 h-10 rounded-full flex items-center justify-center shrink-0">
              <theme.icon className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold leading-tight">{currentCityName || 'SkyCast AI'}</h1>
              <p className="text-xs opacity-75 uppercase tracking-widest font-medium">
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
                    className="px-2 py-0.5 bg-[#ffffff26] hover:bg-[#ffffff40] backdrop-blur-md rounded-full text-white text-[10px] font-bold uppercase tracking-wider border border-[#ffffff40] transition-all"
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
                className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-3xl p-12 text-center mt-20 max-w-lg mx-auto"
              >
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-white text-xl font-bold mb-2">Something went wrong</h3>
                <p className="text-white/60 mb-6">{error}</p>
                <button 
                  onClick={() => loadWeather(51.5074, -0.1278, 'London')}
                  className="px-6 py-2 bg-[#ffffff26] hover:bg-[#ffffff40] rounded-[24px] text-white transition-all border border-[#ffffff40]"
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
                  <button 
                      onClick={() => weather && lastCoords && toggleSaveCity({ name: weather.location.name, lat: lastCoords.lat, lon: lastCoords.lon })}
                      className={cn(
                        "flex items-center justify-center gap-2 px-6 py-4 rounded-[24px] transition-all border text-sm font-bold uppercase tracking-wider",
                        savedCities.some(c => c.name === weather.location.name) 
                          ? "bg-white text-blue-600 border-white" 
                          : "bg-[#ffffff26] text-white border-[#ffffff40] hover:bg-[#ffffff40]"
                      )}
                    >
                      <Bookmark className={cn("w-4 h-4", savedCities.some(c => c.name === weather.location.name) && "fill-current")} />
                      {savedCities.some(c => c.name === weather.location.name) ? 'Saved' : 'Save City'}
                    </button>
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

        <footer className="pt-4 text-center text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] relative z-10 border-t border-white/10">
          <p>© 2026 SkyCast AI • Powered by WeatherAPI & Gemini</p>
        </footer>
      </div>
    </div>
  );
}
