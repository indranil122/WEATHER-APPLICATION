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
      if (query.length >= 3) {
        setIsSearching(true);
        const results = await searchCities(query);
        setSuggestions(results);
        setShowSuggestions(true);
        setIsSearching(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (city: City) => {
    onSelect(city.latitude, city.longitude, city.name);
    setQuery('');
    setShowSuggestions(false);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onSelect(position.coords.latitude, position.coords.longitude, 'Current Location');
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Unable to retrieve your location.");
        }
      );
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto z-50" ref={containerRef}>
      <div className="relative group bg-[#ffffff26] backdrop-blur-md md:backdrop-blur-xl border border-[#ffffff40] rounded-[24px] flex items-center px-4 py-2 w-72 h-12 shadow-sm transition-all duration-300">
        <SearchIcon className="text-white/60 w-4 h-4 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city..."
          className="bg-transparent border-none outline-none ml-3 text-sm placeholder:text-white/60 w-full text-white"
          onFocus={() => query.length >= 3 && setShowSuggestions(true)}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
          ) : query ? (
            <button onClick={() => setQuery('')} className="p-1 hover:bg-white/10 rounded-full text-white/70">
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={handleGetCurrentLocation}
              className="p-2 hover:bg-white/10 rounded-full text-white/70 transition-colors"
              title="Use current location"
            >
              <MapPin className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden border border-white/50"
          >
            {suggestions.map((city) => (
              <button
                key={city.id}
                onClick={() => handleSelect(city)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-black/5 text-left transition-colors border-b border-black/5 last:border-0"
              >
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{city.name}</p>
                  <p className="text-xs text-slate-500">{city.region}, {city.country}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
