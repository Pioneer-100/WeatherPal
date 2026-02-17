import '../styles/WeatherCard.css'

function WeatherCard({ weather }) {
  if (!weather) {
    return <div className="weather-card empty">No weather data available</div>
  }

  const { city, country, temperature, condition, humidity, windSpeed, feelsLike } = weather

  return (
    <div className="weather-card">
      <div className="weather-header">
        <h2 className="city-name">
          {city}, {country}
        </h2>
      </div>

      <div className="weather-main">
        <div className="temperature">
          <span className="temp-value">{temperature}°C</span>
          <span className="condition">{condition}</span>
        </div>
      </div>

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
    </div>
  )
}

export default WeatherCard
