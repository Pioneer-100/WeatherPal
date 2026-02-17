import { useState } from 'react'
import '../styles/SearchBar.css'
import MapModal from './MapModal'
import { fetchWeatherByCoords } from '../utils/weatherApi'

function SearchBar({ onSearch }) {
  const [input, setInput] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [isLocatingUser, setIsLocatingUser] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      onSearch(input.trim())
      setInput('')
    }
  }

  const handleCurrentLocation = () => {
    setIsLocatingUser(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            // Fetch weather directly using coordinates (more reliable than reverse geocoding)
            const weatherData = await fetchWeatherByCoords(latitude, longitude)
            
            if (weatherData) {
              // Pass the city name fetched from the weather API
              onSearch(weatherData.city)
            } else {
              alert('Could not find weather data for your location. Please try searching manually.')
            }
          } catch (error) {
            console.error('Error fetching location weather:', error)
            alert('Error: Could not fetch weather for your location. Please try searching manually.')
          }
          setIsLocatingUser(false)
        },
        (error) => {
          console.error('Geolocation error:', error)
          alert('Unable to access your location. Please enable location services.')
          setIsLocatingUser(false)
        }
      )
    } else {
      alert('Geolocation is not supported by your browser.')
      setIsLocatingUser(false)
    }
  }

  const handleMapSelect = (cityName) => {
    onSearch(cityName)
    setShowMap(false)
  }

  return (
    <>
      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search for a city..."
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>
        <button
          type="button"
          className="icon-button location-btn"
          onClick={handleCurrentLocation}
          disabled={isLocatingUser}
          title="Use my current location"
        >
          {isLocatingUser ? '⌛' : '📍'}
        </button>
        <button
          type="button"
          className="icon-button map-btn"
          onClick={() => setShowMap(true)}
          title="Select location on map"
        >
          🌐
        </button>
      </form>
      {showMap && <MapModal onClose={() => setShowMap(false)} onSelectLocation={handleMapSelect} />}
    </>
  )
}

export default SearchBar
