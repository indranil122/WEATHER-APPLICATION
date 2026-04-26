import { GoogleGenAI } from "@google/genai";
import { WeatherData } from "../types";

const BASE_URL = 'https://api.open-meteo.com/v1';

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const response = await fetch(
    `${BASE_URL}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`
  );

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  return {
    location: {
      name: 'Unknown', 
      region: '',                
      country: '',
      localtime: data.current.time,
    },
    current: {
      temp_c: data.current.temperature_2m,
      temp_f: (data.current.temperature_2m * 9/5) + 32,
      condition: {
        text: 'Weather', 
        icon: '',
        code: data.current.weather_code,
      },
      wind_kph: data.current.wind_speed_10m,
      humidity: data.current.relative_humidity_2m,
      feelslike_c: data.current.apparent_temperature,
      feelslike_f: (data.current.apparent_temperature * 9/5) + 32,
      uv: 0, 
      air_quality: {
        "us-epa-index": 1, 
        pm2_5: 0,
        pm10: 0,
        no2: 0,
        o3: 0,
      },
    },
    forecast: {
        forecastday: data.daily.time.map((time: string, i: number) => ({
            date: time,
            day: {
                maxtemp_c: data.daily.temperature_2m_max[i],
                mintemp_c: data.daily.temperature_2m_min[i],
                condition: { text: 'Weather', icon: '', code: data.daily.weather_code[i] }
            },
            astro: {
                sunrise: data.daily.sunrise[i],
                sunset: data.daily.sunset[i]
            },
            hour: data.hourly.time.slice(i*24, (i+1)*24).map((hTime: string, hIndex: number) => ({
                time: hTime,
                temp_c: data.hourly.temperature_2m[i*24 + hIndex],
                condition: { text: 'Weather', icon: '' },
                chance_of_rain: data.hourly.precipitation_probability[i*24 + hIndex]
            }))
        }))
    }
  };
}

export async function searchCities(query: string) {
  if (query.trim().length < 2) return [];
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=10`);
  if (!response.ok) return [];
  const data = await response.json();
  const results = data.results || [];
  
  return results.map((city: any) => ({
    id: city.id,
    name: city.name,
    latitude: city.latitude,
    longitude: city.longitude,
    country: city.country,
    region: city.admin1 || city.admin2 || city.timezone || '',
  }));
}

export async function getWeatherSummary(weather: WeatherData): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const current = weather.current;
  
  const prompt = `
    Provide a very short, poetic 1-sentence summary based on this weather:
    Condition Code: ${current.condition.code}, Temp: ${current.temp_c}°C
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
    });
    return response.text || "Just another day.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Weather summary unavailable.";
  }
}
