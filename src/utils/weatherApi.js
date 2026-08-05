const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = import.meta.env.VITE_WEATHER_API_BASE_URL || 'https://api.openweathermap.org/data/2.5';

const weatherDescriptions = {
  'clear sky': 'Clear Sky',
  'few clouds': 'Partly Cloudy',
  'scattered clouds': 'Scattered Clouds',
  'broken clouds': 'Overcast Clouds',
  'overcast clouds': 'Overcast',
  'shower rain': 'Shower Rain',
  'light rain': 'Light Rain',
  'moderate rain': 'Moderate Rain',
  'heavy intensity rain': 'Heavy Rain',
  'rain': 'Rainy',
  'thunderstorm': 'Thunderstorm',
  'snow': 'Snowy',
  'light snow': 'Light Snow',
  'mist': 'Misty',
  'fog': 'Foggy',
  'haze': 'Hazy',
};

function formatWeatherDescription(description) {
  if (!description) return 'Clear';
  const key = description.toLowerCase();
  return weatherDescriptions[key] || description.charAt(0).toUpperCase() + description.slice(1);
}

function getDayName(timestamp) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date(timestamp * 1000).getDay()];
}

// Fetch live search autocomplete city suggestions using Open-Meteo geocoding
export async function searchCities(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=5&language=en&format=json`
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results) return [];
    return data.results.map((item) => ({
      name: item.name,
      country: item.country || item.country_code || '',
      countryCode: item.country_code ? item.country_code.toUpperCase() : '',
      admin1: item.admin1 || '',
      lat: item.latitude,
      lon: item.longitude,
      display: `${item.name}${item.admin1 ? ', ' + item.admin1 : ''}${item.country ? ', ' + item.country : ''}`,
    }));
  } catch (err) {
    console.warn('Geocoding search failed:', err);
    return [];
  }
}

// Fetch complete extended weather data
export async function fetchWeather(cityName) {
  try {
    let lat, lon, city, country, temp, condition, humidity, windSpeed, windDeg, feelsLike, pressure, visibility;
    let sunriseSec = null;
    let sunsetSec = null;
    let timezoneOffsetSec = 0;

    // Try OpenWeatherMap first if key exists
    if (API_KEY && API_KEY !== 'undefined') {
      const currentResponse = await fetch(
        `${BASE_URL}/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`
      );

      if (currentResponse.ok) {
        const currentData = await currentResponse.json();
        lat = currentData.coord.lat;
        lon = currentData.coord.lon;
        city = currentData.name;
        country = currentData.sys.country;
        temp = Math.round(currentData.main.temp);
        condition = formatWeatherDescription(currentData.weather[0].description);
        humidity = currentData.main.humidity;
        windSpeed = currentData.wind.speed;
        windDeg = currentData.wind.deg || 0;
        feelsLike = Math.round(currentData.main.feels_like);
        pressure = currentData.main.pressure;
        visibility = currentData.visibility ? Math.round(currentData.visibility / 1000) : 10;
        timezoneOffsetSec = currentData.timezone || 0;
        sunriseSec = currentData.sys.sunrise;
        sunsetSec = currentData.sys.sunset;
      }
    }

    // Fallback/direct search via Open-Meteo geocoding if OpenWeather didn't succeed
    if (lat === undefined || lon === undefined) {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
      );
      if (!geoRes.ok) throw new Error(`City "${cityName}" not found.`);
      const geoData = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0) {
        return null;
      }
      const loc = geoData.results[0];
      lat = loc.latitude;
      lon = loc.longitude;
      city = loc.name;
      country = loc.country_code ? loc.country_code.toUpperCase() : loc.country || '';
    }

    return await fetchExtendedWeatherData(lat, lon, city, country, {
      temp, condition, humidity, windSpeed, windDeg, feelsLike, pressure, visibility, sunriseSec, sunsetSec, timezoneOffsetSec
    });
  } catch (error) {
    console.error('Weather API Error:', error);
    throw error;
  }
}

export async function fetchWeatherByCoords(latitude, longitude) {
  try {
    let city = 'Current Location';
    let country = '';

    try {
      const revRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      if (revRes.ok) {
        const revData = await revRes.json();
        if (revData.address) {
          city = revData.address.city || revData.address.town || revData.address.village || revData.address.county || 'Your Location';
          country = revData.address.country_code ? revData.address.country_code.toUpperCase() : '';
        }
      }
    } catch (e) {
      console.warn('Reverse geocoding failed:', e);
    }

    return await fetchExtendedWeatherData(latitude, longitude, city, country);
  } catch (error) {
    console.error('Weather By Coords Error:', error);
    throw error;
  }
}

// Fetch supplementary Open-Meteo forecast, UV index, hourly & AQI data for rich dashboard
async function fetchExtendedWeatherData(lat, lon, city, country, overrides = {}) {
  const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto`;

  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone`;

  const [meteoRes, aqiRes] = await Promise.allSettled([
    fetch(meteoUrl),
    fetch(aqiUrl),
  ]);

  let meteoData = null;
  let aqiData = null;

  if (meteoRes.status === 'fulfilled' && meteoRes.value.ok) {
    meteoData = await meteoRes.value.json();
  }

  if (aqiRes.status === 'fulfilled' && aqiRes.value.ok) {
    aqiData = await aqiRes.value.json();
  }

  const currentMeteo = meteoData?.current || {};
  const currentDaily = meteoData?.daily || {};
  const isNight = currentMeteo.is_day === 0;

  const timezoneOffsetSec = overrides.timezoneOffsetSec !== undefined ? overrides.timezoneOffsetSec : (meteoData?.utc_offset_seconds || 0);

  const temperature = overrides.temp !== undefined ? overrides.temp : Math.round(currentMeteo.temperature_2m || 20);
  const condition = overrides.condition || parseWmoCode(currentMeteo.weather_code);
  const humidity = overrides.humidity !== undefined ? overrides.humidity : (currentMeteo.relative_humidity_2m || 50);
  const windSpeed = overrides.windSpeed !== undefined ? overrides.windSpeed : Math.round(currentMeteo.wind_speed_10m || 3);
  const windDeg = overrides.windDeg !== undefined ? overrides.windDeg : (currentMeteo.wind_direction_10m || 0);
  const feelsLike = overrides.feelsLike !== undefined ? overrides.feelsLike : Math.round(currentMeteo.apparent_temperature || temperature);
  const pressure = overrides.pressure || Math.round(currentMeteo.surface_pressure || 1013);
  const visibility = overrides.visibility || 10;
  const uvIndex = currentDaily.uv_index_max ? Math.round(currentDaily.uv_index_max[0]) : 3;

  // Timestamps in UTC seconds
  const currentUtcSec = Math.floor(Date.now() / 1000);
  const sunriseSec = overrides.sunriseSec || (currentDaily.sunrise ? Math.floor(new Date(currentDaily.sunrise[0]).getTime() / 1000) : currentUtcSec - 21600);
  const sunsetSec = overrides.sunsetSec || (currentDaily.sunset ? Math.floor(new Date(currentDaily.sunset[0]).getTime() / 1000) : currentUtcSec + 21600);

  // Process 24-hour hourly forecast
  const hourly = [];
  if (meteoData?.hourly) {
    const times = meteoData.hourly.time || [];
    const temps = meteoData.hourly.temperature_2m || [];
    const pops = meteoData.hourly.precipitation_probability || [];
    const codes = meteoData.hourly.weather_code || [];

    const nowHour = new Date().getHours();
    const startIndex = Math.max(0, times.findIndex(t => new Date(t).getHours() === nowHour));

    for (let i = startIndex; i < Math.min(startIndex + 24, times.length); i++) {
      const d = new Date(times[i]);
      const utcSec = Math.floor(d.getTime() / 1000);
      hourly.push({
        utcSec,
        temp: Math.round(temps[i]),
        pop: pops[i] || 0,
        condition: parseWmoCode(codes[i]),
        isNight: d.getHours() < 6 || d.getHours() > 20,
      });
    }
  }

  // Process 7-day forecast
  const forecast = [];
  if (currentDaily.time) {
    for (let i = 0; i < Math.min(currentDaily.time.length, 7); i++) {
      const d = new Date(currentDaily.time[i]);
      const dayName = i === 0 ? 'Today' : getDayName(d.getTime() / 1000);
      forecast.push({
        day: dayName,
        date: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        condition: parseWmoCode(currentDaily.weather_code[i]),
        high: Math.round(currentDaily.temperature_2m_max[i]),
        low: Math.round(currentDaily.temperature_2m_min[i]),
        pop: currentDaily.precipitation_probability_max ? currentDaily.precipitation_probability_max[i] : 0,
        uvMax: currentDaily.uv_index_max ? Math.round(currentDaily.uv_index_max[i]) : 3,
      });
    }
  }

  const aqiVal = aqiData?.current?.us_aqi ? Math.round(aqiData.current.us_aqi / 20) : 1;
  const pm25 = aqiData?.current?.pm2_5 ? Math.round(aqiData.current.pm2_5) : 12;
  const pm10 = aqiData?.current?.pm10 ? Math.round(aqiData.current.pm10) : 24;
  const o3 = aqiData?.current?.ozone ? Math.round(aqiData.current.ozone) : 45;
  const no2 = aqiData?.current?.nitrogen_dioxide ? Math.round(aqiData.current.nitrogen_dioxide) : 15;

  return {
    city,
    country,
    lat,
    lon,
    temperature,
    condition,
    humidity,
    windSpeed,
    windDeg,
    feelsLike,
    pressure,
    visibility,
    uvIndex,
    isNight,
    sunriseSec,
    sunsetSec,
    timezoneOffsetSec,
    currentUtcSec,
    aqi: Math.min(Math.max(aqiVal, 1), 5),
    aqiDetails: { pm25, pm10, o3, no2 },
    hourly,
    forecast,
  };
}

function parseWmoCode(code) {
  if (code === undefined || code === null) return 'Clear';
  if (code === 0) return 'Clear Sky';
  if (code === 1 || code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 61 && code <= 65) return 'Rainy';
  if (code >= 71 && code <= 77) return 'Snowy';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Cloudy';
}

export function getAvailableCities() {
  return ['London', 'New York', 'Tokyo', 'Sydney', 'Paris', 'Dubai', 'Singapore', 'Toronto', 'Berlin', 'Rome', 'San Francisco', 'Seoul'];
}
