export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_kph: number;
    wind_gusts_kph: number;
    humidity: number;
    feelslike_c: number;
    feelslike_f: number;
    precip_mm: number;
    precip_chance: number;
    pressure_mb: number;
    cloud_cover: number;
    uv: number;
    air_quality: {
      "us-epa-index": number;
      pm2_5: number;
      pm10: number;
      no2: number;
      o3: number;
    };
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
      };
      astro: {
        sunrise: string;
        sunset: string;
      };
      hour: Array<{
        time: string;
        temp_c: number;
        condition: {
          text: string;
          icon: string;
        };
        chance_of_rain: number;
      }>;
    }>;
  };
}

export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  region: string;
}
