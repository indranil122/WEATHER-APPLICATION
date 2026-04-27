import { GoogleGenAI } from "@google/genai";
import { WeatherData } from "../types";

const BASE_URL = 'https://api.open-meteo.com/v1';
const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

function getConditionText(code: number): string {
  const codes: Record<number, string> = {
    0: 'Clear Sky',
    1: 'Mainly Clear',
    2: 'Partly Cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing Rime Fog',
    51: 'Light Drizzle',
    53: 'Moderate Drizzle',
    55: 'Dense Drizzle',
    56: 'Light Freezing Drizzle',
    57: 'Dense Freezing Drizzle',
    61: 'Slight Rain',
    63: 'Moderate Rain',
    65: 'Heavy Rain',
    66: 'Light Freezing Rain',
    67: 'Heavy Freezing Rain',
    71: 'Slight Snow Fall',
    73: 'Moderate Snow Fall',
    75: 'Heavy Snow Fall',
    77: 'Snow Grains',
    80: 'Slight Rain Showers',
    81: 'Moderate Rain Showers',
    82: 'Violent Rain Showers',
    85: 'Slight Snow Showers',
    86: 'Heavy Snow Showers',
    95: 'Rain / Possible Thunder',
    96: 'Thunderstorm with Slight Hail',
    99: 'Thunderstorm with Heavy Hail',
  };
  return codes[code] || 'Unknown';
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const [weatherRes, airQualityRes] = await Promise.all([
    fetch(
      `${BASE_URL}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m,precipitation,surface_pressure,cloud_cover&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`
    ),
    fetch(
      `${AIR_QUALITY_URL}?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,nitrogen_dioxide,ozone,us_aqi`
    )
  ]);

  if (!weatherRes.ok) {
    throw new Error(`Weather API error: ${weatherRes.statusText}`);
  }

  const data = await weatherRes.json();
  const aqData = airQualityRes.ok ? await airQualityRes.json() : null;
  
  // Try to get location name if possible, otherwise default to Unknown
  let locationName = 'Unknown';
  try {
    const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    if (geoRes.ok) {
      const geoData = await geoRes.json();
      locationName = geoData.city || geoData.locality || geoData.principalSubdivision || 'Unknown';
    }
  } catch (e) {
    console.error("Reverse geocoding failed", e);
  }

  return {
    location: {
      name: locationName, 
      region: '',                
      country: '',
      localtime: data.current.time,
    },
    current: {
      temp_c: data.current.temperature_2m,
      temp_f: (data.current.temperature_2m * 9/5) + 32,
      condition: {
        text: getConditionText(data.current.weather_code), 
        icon: '',
        code: data.current.weather_code,
      },
      wind_kph: data.current.wind_speed_10m || 0,
      wind_gusts_kph: data.current.wind_gusts_10m || 0,
      humidity: data.current.relative_humidity_2m || 0,
      feelslike_c: data.current.apparent_temperature || 0,
      feelslike_f: ((data.current.apparent_temperature || 0) * 9/5) + 32,
      precip_mm: data.current.precipitation || 0,
      precip_chance: data.hourly?.precipitation_probability?.[0] || 0,
      pressure_mb: data.current.surface_pressure || 0,
      cloud_cover: data.current.cloud_cover || 0,
      uv: 0, 
      air_quality: {
        "us-epa-index": aqData?.current?.us_aqi ? Math.ceil(aqData.current.us_aqi / 50) : 1, // Simplified mapping to 1-6 if needed, or use as is
        pm2_5: aqData?.current?.pm2_5 || 0,
        pm10: aqData?.current?.pm10 || 0,
        no2: aqData?.current?.nitrogen_dioxide || 0,
        o3: aqData?.current?.ozone || 0,
      },
    },
    forecast: {
        forecastday: data.daily.time.map((time: string, i: number) => ({
            date: time,
            day: {
                maxtemp_c: data.daily.temperature_2m_max[i],
                mintemp_c: data.daily.temperature_2m_min[i],
                condition: { 
                  text: getConditionText(data.daily.weather_code[i]), 
                  icon: '', 
                  code: data.daily.weather_code[i] 
                }
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
