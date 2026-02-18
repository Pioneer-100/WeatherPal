import '../styles/WeatherCard.css'

function WeatherCard({ weather, selectedForecast, onClearSelection }) {
  if (!weather && !selectedForecast) {
    return <div className="weather-card empty">No weather data available</div>
  }

  const { city, country, temperature, condition, humidity, windSpeed, feelsLike } = weather || {}

  // If a forecast day is selected, show that instead of current conditions
  const isForecastView = Boolean(selectedForecast)

  return (
    <div className="weather-card">
      <div className="weather-header">
        <h2 className="city-name">
          {city ? `${city}, ${country}` : 'Forecast'}
        </h2>
        {isForecastView && (
          <button className="clear-selection" onClick={onClearSelection} title="Back to current weather">
            ← Back
          </button>
        )}
      </div>

      <div className="weather-main">
        <div className="temperature">
          {!isForecastView && (
            <>
              <span className="temp-value">{temperature}°C</span>
              <span className="condition">{condition}</span>
            </>
          )}

          {isForecastView && (
            <>
              <span className="temp-value">{selectedForecast.high}° / {selectedForecast.low}°</span>
              <span className="condition">{selectedForecast.condition}</span>
              <div style={{marginTop: 8, fontSize: 14, color: '#666'}}>Forecast for {selectedForecast.day}</div>
            </>
          )}
        </div>
      </div>

      {!isForecastView && (
        <div className="weather-details">
          <div className="detail">
            <span className="label">Feels Like</span>
            <span className="value">{feelsLike}°C</span>
          </div>
          <div className="detail">
            <span className="label">Humidity</span>
            <span className="value">{humidity}%</span>
          </div>
          <div className="detail">
            <span className="label">Wind Speed</span>
            <span className="value">{windSpeed} m/s</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default WeatherCard
