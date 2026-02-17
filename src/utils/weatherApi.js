// Mock weather data for demonstration
// In a real app, this would call a real weather API like OpenWeatherMap

const mockWeatherData = {
  'London': {
    city: 'London',
    country: 'UK',
    temperature: 8,
    condition: 'Cloudy',
    humidity: 72,
    windSpeed: 4.5,
    feelsLike: 5,
    forecast: [
      { day: 'Mon', condition: 'Cloudy', high: 10, low: 6 },
      { day: 'Tue', condition: 'Rainy', high: 8, low: 4 },
      { day: 'Wed', condition: 'Clear', high: 12, low: 7 },
      { day: 'Thu', condition: 'Sunny', high: 15, low: 9 },
      { day: 'Fri', condition: 'Partly Cloudy', high: 13, low: 8 },
    ]
  },
  'New York': {
    city: 'New York',
    country: 'USA',
    temperature: 5,
    condition: 'Snowy',
    humidity: 65,
    windSpeed: 8.2,
    feelsLike: 0,
    forecast: [
      { day: 'Mon', condition: 'Snowy', high: 4, low: -2 },
      { day: 'Tue', condition: 'Clear', high: 6, low: 0 },
      { day: 'Wed', condition: 'Sunny', high: 8, low: 2 },
      { day: 'Thu', condition: 'Cloudy', high: 7, low: 1 },
      { day: 'Fri', condition: 'Rainy', high: 5, low: -1 },
    ]
  },
  'Tokyo': {
    city: 'Tokyo',
    country: 'Japan',
    temperature: 12,
    condition: 'Clear',
    humidity: 55,
    windSpeed: 3.1,
    feelsLike: 11,
    forecast: [
      { day: 'Mon', condition: 'Clear', high: 14, low: 10 },
      { day: 'Tue', condition: 'Sunny', high: 16, low: 11 },
      { day: 'Wed', condition: 'Partly Cloudy', high: 15, low: 10 },
      { day: 'Thu', condition: 'Rainy', high: 12, low: 8 },
      { day: 'Fri', condition: 'Clear', high: 14, low: 9 },
    ]
  },
  'Sydney': {
    city: 'Sydney',
    country: 'Australia',
    temperature: 26,
    condition: 'Sunny',
    humidity: 48,
    windSpeed: 6.3,
    feelsLike: 28,
    forecast: [
      { day: 'Mon', condition: 'Sunny', high: 29, low: 22 },
      { day: 'Tue', condition: 'Sunny', high: 30, low: 23 },
      { day: 'Wed', condition: 'Partly Cloudy', high: 28, low: 21 },
      { day: 'Thu', condition: 'Cloudy', high: 25, low: 20 },
      { day: 'Fri', condition: 'Rainy', high: 22, low: 18 },
    ]
  },
}

export async function fetchWeather(cityName) {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const city = Object.keys(mockWeatherData).find(
        (key) => key.toLowerCase() === cityName.toLowerCase()
      )
      
      if (city) {
        resolve(mockWeatherData[city])
      } else {
        resolve(null)
      }
    }, 500)
  })
}

export function getAvailableCities() {
  return Object.keys(mockWeatherData)
}
