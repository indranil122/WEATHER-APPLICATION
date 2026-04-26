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
    <div className="relative flex flex-col items-center">
      <motion.button 
        layoutId="search-pill"
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-2.5 px-4 py-2 bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-full text-slate-700 hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] transition-all group"
      >
        <SearchIcon className="w-4 h-4 text-slate-500 group-hover:text-slate-800 transition-colors" />
        <span className="font-bold text-[13px] tracking-tight">Search</span>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-white/20 backdrop-blur-2xl flex flex-col items-center"
          >
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={() => setIsExpanded(false)} />
            
            <motion.div 
              layoutId="search-pill"
              className="relative w-full max-w-[90%] md:max-w-md mx-auto z-10 flex flex-col mt-32 bg-white/95 backdrop-blur-xl rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/50 overflow-hidden"
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              {/* Input Container */}
              <div className="relative flex items-center px-5 py-4 w-full h-16 border-b border-slate-100">
                <SearchIcon className="text-slate-400 w-5 h-5 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Where to?"
                  className="bg-transparent border-none outline-none ml-3 text-lg placeholder:text-slate-400 w-full text-slate-800 font-medium"
                />
                <div className="flex items-center gap-1">
                  {isSearching ? (
                    <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                  ) : (
                    <button 
                      onClick={() => setIsExpanded(false)} 
                      className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Suggestions Box */}
              <div className="flex flex-col max-h-[60vh] overflow-y-auto no-scrollbar">
                <button
                  onClick={handleGetCurrentLocation}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 text-left transition-colors border-b border-slate-50"
                >
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Near Me</p>
                    <p className="text-[11px] text-slate-500 font-medium">Use current location</p>
                  </div>
                </button>

                {suggestions.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleSelect(city)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 text-left transition-colors border-b border-slate-50 last:border-0"
                  >
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <SearchIcon className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-800 text-sm">{city.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{city.country}</p>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {city.region && `${city.region}`}
                      </p>
                    </div>
                  </button>
                ))}
                
                {query.trim().length >= 2 && suggestions.length === 0 && !isSearching && (
                  <div className="px-6 py-10 text-center">
                    <p className="text-sm font-medium text-slate-400 italic">No matches for "{query}"</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
