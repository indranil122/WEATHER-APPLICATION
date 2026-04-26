import { Sun, Cloud, CloudRain, CloudLightning, CloudSnow, CloudFog, CloudDrizzle, SunDim } from 'lucide-react';

export type WeatherTheme = {
  name: string;
  gradient: string;
  accent: string;
  text: string;
  icon: any;
};

export const WEATHER_THEMES: Record<string, WeatherTheme> = {
  sunny: {
    name: 'Sunny',
    gradient: 'from-[#1A2980] to-[#26D0CE]',
    accent: 'text-yellow-300',
    text: 'text-white',
    icon: Sun,
  },
  cloudy: {
    name: 'Cloudy',
    gradient: 'from-[#485563] to-[#29323C]',
    accent: 'text-slate-300',
    text: 'text-white',
    icon: Cloud,
  },
  rainy: {
    name: 'Rainy',
    gradient: 'from-[#2C3E50] to-[#000000]',
    accent: 'text-blue-400',
    text: 'text-white',
    icon: CloudRain,
  },
  stormy: {
    name: 'Stormy',
    gradient: 'from-[#141E30] to-[#243B55]',
    accent: 'text-yellow-500',
    text: 'text-white',
    icon: CloudLightning,
  },
  snowy: {
    name: 'Snowy',
    gradient: 'from-[#E0EAFC] to-[#CFDEF3]',
    accent: 'text-blue-900',
    text: 'text-blue-900',
    icon: CloudSnow,
  },
  foggy: {
    name: 'Foggy',
    gradient: 'from-[#606c88] to-[#3f4c6b]',
    accent: 'text-slate-200',
    text: 'text-white',
    icon: CloudFog,
  },
  night: {
    name: 'Clear Night',
    gradient: 'from-[#0F2027] via-[#203A43] to-[#2C5364]',
    accent: 'text-indigo-300',
    text: 'text-white',
    icon: SunDim,
  }
};

export function getThemeByCode(code: number): WeatherTheme {
  
  // Open-Meteo WMO Weather interpretation codes
  if (code === 0) return WEATHER_THEMES.sunny;
  if ([1, 2, 3].includes(code)) return WEATHER_THEMES.cloudy;
  if ([45, 48].includes(code)) return WEATHER_THEMES.foggy;
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return WEATHER_THEMES.rainy;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return WEATHER_THEMES.snowy;
  if ([95, 96, 99].includes(code)) return WEATHER_THEMES.stormy;
  
  return WEATHER_THEMES.sunny;
}
