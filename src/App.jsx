import { useState } from 'react'
import SearchBar from './components/SearchBar'
import WeatherCard from './components/WeatherCard'
import ForecastCard from './components/ForecastCard'
import { fetchWeather, getAvailableCities } from './utils/weatherApi'
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
      setError('Failed to fetch weather data. Please try again.')
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
