import { GoogleGenAI } from "@google/genai";
import { WeatherData } from "../types";

const getApiKey = () => {
  const key = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;
  if (!key) throw new Error("Missing VITE_OPENWEATHERMAP_API_KEY environment variable. Please add it via settings.");
  return key;
};

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const apiKey = getApiKey();
  
  const [oneCallRes, airPolRes, geoRes] = await Promise.all([
    fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${apiKey}`
    ),
    fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
    ),
    fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`
    )
  ]);

  if (!oneCallRes.ok) {
    if (oneCallRes.status === 401) {
      throw new Error("Invalid API key or One Call API 3.0 is not enabled. OpenWeatherMap requires a subscription for One Call 3.0.");
    }
    throw new Error(`Weather API error: ${oneCallRes.statusText}`);
  }

  const data = await oneCallRes.json();
  const aqData = airPolRes.ok ? await airPolRes.json() : null;
  const geoData = geoRes.ok ? await geoRes.json() : null;
  
  let locationName = geoData && geoData.length > 0 ? geoData[0].name : 'Unknown';
  let countryCode = geoData && geoData.length > 0 ? geoData[0].country : '';
  let regionName = geoData && geoData.length > 0 ? geoData[0].state || '' : '';

  const aqi = aqData?.list[0]?.main?.aqi || 1; // 1-5 scale in OWM
  // OWM AQI is 1(Good) - 5(Very Poor). EPA is 1-6. We'll map loosely:
  const epaIndex = Math.min(6, Math.ceil((aqi / 5) * 6));

  return {
    location: {
      name: locationName, 
      region: regionName,                
      country: countryCode,
      localtime: new Date(data.current.dt * 1000).toISOString(),
    },
    current: {
      temp_c: data.current.temp,
      temp_f: (data.current.temp * 9/5) + 32,
      condition: {
        text: data.current.weather[0]?.description || 'Unknown', 
        icon: data.current.weather[0]?.icon || '',
        code: data.current.weather[0]?.id || 0,
      },
      wind_kph: data.current.wind_speed * 3.6, // m/s to km/h
      humidity: data.current.humidity,
      feelslike_c: data.current.feels_like,
      feelslike_f: (data.current.feels_like * 9/5) + 32,
      uv: data.current.uvi, 
      air_quality: {
        "us-epa-index": epaIndex,
        pm2_5: aqData?.list[0]?.components?.pm2_5 || 0,
        pm10: aqData?.list[0]?.components?.pm10 || 0,
        no2: aqData?.list[0]?.components?.no2 || 0,
        o3: aqData?.list[0]?.components?.o3 || 0,
      },
    },
    forecast: {
        forecastday: data.daily.slice(0, 7).map((day: any) => ({
            date: new Date(day.dt * 1000).toISOString().split('T')[0],
            day: {
                maxtemp_c: day.temp.max,
                mintemp_c: day.temp.min,
                pop: Math.round((day.pop || 0) * 100),
                condition: { 
                  text: day.weather[0]?.description || 'Unknown', 
                  icon: day.weather[0]?.icon || '', 
                  code: day.weather[0]?.id || 0 
                }
            },
            astro: {
                sunrise: new Date(day.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                sunset: new Date(day.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            },
            // Get hourly data for this specific day from the hourly array
            hour: data.hourly
                .filter((h: any) => new Date(h.dt * 1000).getDate() === new Date(day.dt * 1000).getDate())
                .map((h: any) => ({
                    time: new Date(h.dt * 1000).toISOString(),
                    temp_c: h.temp,
                    condition: { 
                      text: h.weather[0]?.description, 
                      icon: h.weather[0]?.icon,
                      code: h.weather[0]?.id || 0
                    },
                    chance_of_rain: Math.round((h.pop || 0) * 100)
                }))
        }))
    }
  };
}

export async function searchCities(query: string) {
  if (query.trim().length < 2) return [];
  const apiKey = getApiKey();
  const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=10&appid=${apiKey}`);
  
  if (!response.ok) return [];
  const results = await response.json();
  
  return results.map((city: any, index: number) => ({
    id: index, // OWM direct geo doesn't return an ID, so we use index
    name: city.name,
    latitude: city.lat,
    longitude: city.lon,
    country: city.country,
    region: city.state || '',
  }));
}

export async function getWeatherSummary(weather: WeatherData): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const current = weather.current;
  
  const prompt = `
    Provide a very short, poetic 1-sentence summary based on this weather:
    Condition: ${current.condition.text}, Temp: ${current.temp_c}°C
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
