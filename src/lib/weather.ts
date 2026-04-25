import type { WeatherData } from './types';

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '';

export function getCurrentLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { timeout: 10000 }
    );
  });
}

export async function getRealWeather(lat: number, lon: number): Promise<WeatherData> {
  if (!OPENWEATHER_API_KEY) {
    console.warn('OpenWeather API key not set. Using simulated data.');
    return getSimulatedWeather('Your City');
  }

  try {
    // Fetch weather data
    const weatherResp = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    if (!weatherResp.ok) {
      throw new Error('Weather API request failed');
    }

    const weatherData = await weatherResp.json();

    // Map OpenWeather conditions to icons
    const conditionIcons: Record<string, string> = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️',
      'Fog': '🌫️',
      'Haze': '🌫️',
    };

    const mainCondition = weatherData.weather[0].main;
    const icon = conditionIcons[mainCondition] || '🌤️';

    return {
      temp: Math.round(weatherData.main.temp),
      condition: weatherData.weather[0].description,
      city: weatherData.name,
      icon,
      humidity: weatherData.main.humidity,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return getSimulatedWeather('Your City');
  }
}

export async function getWeatherForCity(city: string): Promise<WeatherData> {
  if (!OPENWEATHER_API_KEY) {
    return getSimulatedWeather(city);
  }

  try {
    const weatherResp = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    if (!weatherResp.ok) {
      throw new Error('Weather API request failed');
    }

    const weatherData = await weatherResp.json();

    const conditionIcons: Record<string, string> = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️',
      'Fog': '🌫️',
      'Haze': '🌫️',
    };

    const mainCondition = weatherData.weather[0].main;
    const icon = conditionIcons[mainCondition] || '🌤️';

    return {
      temp: Math.round(weatherData.main.temp),
      condition: weatherData.weather[0].description,
      city: weatherData.name,
      icon,
      humidity: weatherData.main.humidity,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return getSimulatedWeather(city);
  }
}

export async function getWeatherByLocation(): Promise<WeatherData> {
  try {
    const { lat, lon } = await getCurrentLocation();
    return await getRealWeather(lat, lon);
  } catch (error) {
    console.error('Error getting location:', error);
    return getSimulatedWeather('Your City');
  }
}

// Simulated weather data based on common conditions
const weatherConditions = [
  { condition: 'Sunny', icon: '☀️', tempRange: [22, 32] },
  { condition: 'Partly Cloudy', icon: '⛅', tempRange: [18, 26] },
  { condition: 'Cloudy', icon: '☁️', tempRange: [14, 22] },
  { condition: 'Rainy', icon: '🌧️', tempRange: [10, 18] },
  { condition: 'Windy', icon: '💨', tempRange: [12, 20] },
  { condition: 'Clear', icon: '🌤️', tempRange: [20, 28] },
];

export async function getWeather(lat: number, lon: number): Promise<WeatherData> {
  // Try real API first, fallback to simulated
  return await getRealWeather(lat, lon);
}

export function getSimulatedWeather(city: string = 'New York'): WeatherData {
  const hour = new Date().getHours();
  const condIndex = hour % weatherConditions.length;
  const cond = weatherConditions[condIndex];
  const temp = Math.round((cond.tempRange[0] + cond.tempRange[1]) / 2);

  return {
    temp,
    condition: cond.condition,
    city,
    icon: cond.icon,
    humidity: Math.round(40 + Math.random() * 40),
  };
}
