import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, MapPin, X, Loader2 } from 'lucide-react';
import { searchCities } from '../../services/weatherService';
import { City } from '../../types';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SearchProps {
  onSelect: (lat: number, lon: number, name: string) => void;
  isLoading?: boolean;
}

export function Search({ onSelect, isLoading }: SearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsSearching(true);
        const results = await searchCities(query);
        setSuggestions(results);
        setShowSuggestions(true);
        setIsSearching(false);
      } else {
        setSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (city: City) => {
    onSelect(city.latitude, city.longitude, city.name);
    setQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsSearching(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onSelect(position.coords.latitude, position.coords.longitude, 'Current Location');
          setQuery('');
          setShowSuggestions(false);
          setIsSearching(false);
          inputRef.current?.focus();
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsSearching(false);
          alert("Unable to retrieve your location.");
        }
      );
    }
  };

  return (
    <div className="relative w-full z-50 text-slate-800" ref={containerRef}>
      <div className="relative group clay-inset rounded-[24px] flex items-center px-4 py-2 w-full h-12 transition-all duration-300">
        <SearchIcon className="text-slate-400 w-4 h-4 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city..."
          className="bg-transparent border-none outline-none ml-3 text-sm placeholder:text-slate-400 w-full text-slate-800"
          onFocus={() => setShowSuggestions(true)}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          ) : query ? (
            <button 
              onClick={() => { setQuery(''); inputRef.current?.focus(); }} 
              className="p-1 hover:bg-slate-200 rounded-full text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={handleGetCurrentLocation}
              className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
              title="Use current location"
            >
              <MapPin className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-3 clay-card border-none overflow-hidden max-h-[300px] overflow-y-auto"
          >
            {/* Current Location Option */}
            <button
              onClick={handleGetCurrentLocation}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition-colors border-b border-black/5"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Use Current Location</p>
                <p className="text-xs text-slate-500">Enable GPS for precision</p>
              </div>
            </button>

            {/* City Suggestions */}
            {suggestions.map((city) => (
              <button
                key={city.id}
                onClick={() => handleSelect(city)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-black/5 text-left transition-colors border-b border-black/5 last:border-0"
              >
                <div className="p-2 bg-slate-100 rounded-lg">
                  <SearchIcon className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{city.name}</p>
                  <p className="text-xs text-slate-500">
                    {city.region ? `${city.region}, ` : ''}{city.country}
                  </p>
                </div>
              </button>
            ))}

            {query.trim().length >= 2 && suggestions.length === 0 && !isSearching && (
              <div className="px-4 py-8 text-center text-slate-400">
                <SearchIcon className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No cities found matching "{query}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
