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
  // OpenWeatherMap condition codes
  if (code >= 200 && code < 300) return WEATHER_THEMES.stormy;
  if (code >= 300 && code < 400) return WEATHER_THEMES.rainy; // Drizzle
  if (code >= 500 && code < 600) return WEATHER_THEMES.rainy;
  if (code >= 600 && code < 700) return WEATHER_THEMES.snowy;
  if (code >= 700 && code < 800) return WEATHER_THEMES.foggy;
  if (code === 800) return WEATHER_THEMES.sunny;
  if (code > 800 && code < 900) return WEATHER_THEMES.cloudy;
  
  return WEATHER_THEMES.sunny;
}
