const API_KEY = import.meta.env.VITE_WEATHER_API_KEY
const BASE_URL = import.meta.env.VITE_WEATHER_API_BASE_URL

const weatherDescriptions = {
  'clear sky': 'Clear',
  'few clouds': 'Partly Cloudy',
  'scattered clouds': 'Cloudy',
  'broken clouds': 'Cloudy',
  'shower rain': 'Rainy',
  'rain': 'Rainy',
  'thunderstorm': 'Thunderstorm',
  'snow': 'Snowy',
  'mist': 'Misty',
}

function formatWeatherDescription(description) {
  const key = description.toLowerCase()
  return weatherDescriptions[key] || description.charAt(0).toUpperCase() + description.slice(1)
}

function getDayName(date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days[new Date(date * 1000).getDay()]
}

export async function fetchWeather(cityName) {
  try {
    if (!API_KEY) {
      throw new Error('Weather API key is not configured. Please set VITE_WEATHER_API_KEY in .env file.')
    }

    // Fetch current weather
    const currentResponse = await fetch(
      `${BASE_URL}/weather?q=${cityName}&appid=${API_KEY}&units=metric`
    )

    if (!currentResponse.ok) {
      if (currentResponse.status === 404) {
        return null
      }
      throw new Error(`Weather API error: ${currentResponse.status}`)
    }

    const currentData = await currentResponse.json()

    // Fetch forecast
    const forecastResponse = await fetch(
      `${BASE_URL}/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
    )

    const forecastData = await forecastResponse.json()

    // Process forecast data - group by day and get min/max temps
    const dailyForecasts = {}
    
    forecastData.list.forEach((item) => {
      const day = getDayName(item.dt)
      if (!dailyForecasts[day]) {
        dailyForecasts[day] = {
          temps: [],
          conditions: [],
        }
      }
      dailyForecasts[day].temps.push(item.main.temp)
      dailyForecasts[day].conditions.push(item.weather[0].main)
    })

    const forecast = Object.entries(dailyForecasts)
      .slice(0, 5)
      .map(([day, data]) => ({
        day,
        condition: formatWeatherDescription(data.conditions[0]),
        high: Math.round(Math.max(...data.temps)),
        low: Math.round(Math.min(...data.temps)),
      }))

    return {
      city: currentData.name,
      country: currentData.sys.country,
      temperature: Math.round(currentData.main.temp),
      condition: formatWeatherDescription(currentData.weather[0].description),
      humidity: currentData.main.humidity,
      windSpeed: currentData.wind.speed,
      feelsLike: Math.round(currentData.main.feels_like),
      forecast,
    }
  } catch (error) {
    console.error('Weather API Error:', error)
    throw error
  }
}

export function getAvailableCities() {
  return ['London', 'New York', 'Tokyo', 'Sydney', 'Paris', 'Dubai', 'Singapore', 'Toronto']
}
