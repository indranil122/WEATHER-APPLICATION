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
    gradient: 'bg-transparent', // Soft global bg
    accent: 'text-amber-500',
    text: 'text-slate-800 dark:text-slate-200',
    icon: Sun,
  },
  cloudy: {
    name: 'Cloudy',
    gradient: 'bg-transparent',
    accent: 'text-slate-500',
    text: 'text-slate-800 dark:text-slate-200',
    icon: Cloud,
  },
  rainy: {
    name: 'Rainy',
    gradient: 'bg-transparent',
    accent: 'text-sky-500',
    text: 'text-slate-800 dark:text-slate-200',
    icon: CloudRain,
  },
  stormy: {
    name: 'Stormy',
    gradient: 'bg-transparent',
    accent: 'text-indigo-600 dark:text-indigo-400',
    text: 'text-slate-800 dark:text-slate-200',
    icon: CloudLightning,
  },
  snowy: {
    name: 'Snowy',
    gradient: 'bg-transparent',
    accent: 'text-cyan-600 dark:text-cyan-400',
    text: 'text-slate-800 dark:text-slate-200',
    icon: CloudSnow,
  },
  foggy: {
    name: 'Foggy',
    gradient: 'bg-transparent',
    accent: 'text-gray-400',
    text: 'text-slate-800 dark:text-slate-200',
    icon: CloudFog,
  },
  night: {
    name: 'Clear Night',
    gradient: 'bg-transparent',
    accent: 'text-indigo-900 dark:text-indigo-300',
    text: 'text-slate-800 dark:text-slate-200',
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
