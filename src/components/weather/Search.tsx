import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, MapPin, X, Loader2 } from 'lucide-react';
import { searchCities } from '../../services/weatherService';
import { City } from '../../types';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export interface SearchProps {
  onSelect: (lat: number, lon: number, name?: string) => void;
  isLoading?: boolean;
}

export function Search({ onSelect, isLoading }: SearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsSearching(true);
        const results = await searchCities(query);
        setSuggestions(results);
        setIsSearching(false);
      } else {
        setSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isExpanded]);

  const handleSelect = (city: City) => {
    onSelect(city.latitude, city.longitude, city.name);
    setQuery('');
    setSuggestions([]);
    setIsExpanded(false);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsSearching(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onSelect(position.coords.latitude, position.coords.longitude);
          setQuery('');
          setSuggestions([]);
          setIsSearching(false);
          setIsExpanded(false);
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
    <>
      <button 
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-white/60 backdrop-blur-[40px] backdrop-saturate-[180%] border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.8)] rounded-full text-slate-700 hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all font-medium group"
      >
        <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-700 transition-colors mx-auto">
          <SearchIcon className="w-5 h-5" />
          <span className="font-bold">Search city...</span>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black/20 backdrop-blur-xl p-4 md:p-8 flex flex-col items-center"
          >
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={() => setIsExpanded(false)} />
            
            <div className="relative w-full max-w-md mx-auto z-10 flex flex-col gap-4 mt-8 md:mt-16">
              {/* Input Container */}
              <div className="relative group bg-white/90 backdrop-blur-md rounded-[24px] flex items-center px-4 py-2 w-full h-14 shadow-2xl ring-1 ring-black/5">
                <SearchIcon className="text-slate-400 w-5 h-5 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search city..."
                  className="bg-transparent border-none outline-none ml-3 text-base placeholder:text-slate-400 w-full text-slate-800"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {isSearching ? (
                    <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                  ) : query ? (
                    <button 
                      onClick={() => { setQuery(''); inputRef.current?.focus(); }} 
                      className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsExpanded(false)} 
                      className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Suggestions Box */}
              <div className="bg-white/90 backdrop-blur-md rounded-[24px] overflow-hidden shadow-2xl ring-1 ring-black/5 flex flex-col max-h-[60vh] overflow-y-auto">
                <button
                  onClick={handleGetCurrentLocation}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-blue-50/50 text-left transition-colors border-b border-black/5"
                >
                  <div className="p-2.5 bg-blue-100 rounded-xl">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Use Current Location</p>
                    <p className="text-xs text-slate-500">Enable GPS for precision</p>
                  </div>
                </button>

                {suggestions.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleSelect(city)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-black/5 text-left transition-colors border-b border-black/5 last:border-0"
                  >
                    <div className="p-2.5 bg-slate-100 rounded-xl">
                      <SearchIcon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{city.name}</p>
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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
