import { useState } from 'react'
import SearchBar from './components/SearchBar'
import WeatherCard from './components/WeatherCard'
import ForecastCard from './components/ForecastCard'
import WeatherVisualization from './components/WeatherVisualization'
import { fetchWeather, getAvailableCities } from './utils/weatherApi'
import { generateWeatherVisualization } from './utils/aiVisualization'
import './App.css'

function App() {
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (cityName) => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await fetchWeather(cityName)
      
      if (data) {
        setWeather({
          city: data.city,
          country: data.country,
          temperature: data.temperature,
          condition: data.condition,
          humidity: data.humidity,
          windSpeed: data.windSpeed,
          feelsLike: data.feelsLike,
        })
        setForecast(data.forecast)
      } else {
        setError(`City "${cityName}" not found. Try: ${getAvailableCities().join(', ')}`)
        setWeather(null)
        setForecast(null)
      }
    } catch (err) {
      console.error('Error:', err)
      if (err.message.includes('API key')) {
        setError('Weather API is not configured. Please check your .env file.')
      } else if (err.message.includes('404')) {
        setError(`City "${cityName}" not found. Please try another city.`)
      } else {
        setError('Failed to fetch weather data. Please try again.')
      }
      setWeather(null)
      setForecast(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">🌤️ WeatherPal</h1>
        <p className="app-subtitle">Your personal weather companion</p>
      </header>

      <main className="app-main">
        <SearchBar onSearch={handleSearch} />
        
        {loading && <div className="loading">Loading weather data...</div>}
        
        {error && <div className="error-message">{error}</div>}
        
        {weather && (
          <>
            <WeatherCard weather={weather} />
            <WeatherVisualization 
              weather={weather} 
              onGenerate={generateWeatherVisualization}
              isLoading={loading}
            />
            <ForecastCard forecast={forecast} />
          </>
        )}

        {!weather && !loading && !error && (
          <div className="welcome-message">
            <p>Search for a city to get started!</p>
            <p className="hint">Try: London, New York, Tokyo, or Sydney</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
