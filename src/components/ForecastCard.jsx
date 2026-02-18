import '../styles/ForecastCard.css'

function ForecastCard({ forecast, onSelect, selectedDay }) {
  if (!forecast || forecast.length === 0) {
    return <div className="forecast empty">No forecast data available</div>
  }

  return (
    <div className="forecast">
      <h3 className="forecast-title">5-Day Forecast</h3>
      <div className="forecast-grid">
        {forecast.map((day, index) => (
          <div
            key={index}
            className={`forecast-item ${selectedDay && selectedDay.day === day.day ? 'selected' : ''}`}
            onClick={() => onSelect && onSelect(day)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSelect && onSelect(day)
            }}
          >
            <p className="day">{day.day}</p>
            <p className="condition">{day.condition}</p>
            <p className="temps">
              <span className="high">{day.high}°</span>
              <span className="low">{day.low}°</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ForecastCard
