import React from 'react';
import { WeatherIcon } from './WeatherIcons';
import { cToF } from '../utils/weatherHelpers';

function ForecastCard({ forecast = [], onSelectDay, selectedDay = null, unit = 'C' }) {
  if (!forecast || forecast.length === 0) return null;

  const displayTemp = (celsius) => (unit === 'F' ? `${cToF(celsius)}°` : `${celsius}°`);

  // Global high & low across whole week for proportional temperature bar
  const allHighs = forecast.map((f) => f.high);
  const allLows = forecast.map((f) => f.low);
  const maxTemp = Math.max(...allHighs);
  const minTemp = Math.min(...allLows);
  const tempRange = maxTemp - minTemp || 1;

  return (
    <div className="forecast-panel glass-panel">
      <div className="card-header">
        <h3 className="card-title">📅 7-Day Forecast</h3>
        <span className="card-subtitle">Click a day for detailed breakdown</span>
      </div>

      <div className="forecast-list">
        {forecast.map((dayData, index) => {
          const isSelected = selectedDay && selectedDay.day === dayData.day;
          
          // Calculate horizontal temp range bar fill position
          const leftPercent = Math.max(0, Math.round(((dayData.low - minTemp) / tempRange) * 100));
          const rightPercent = Math.min(100, Math.round(((dayData.high - minTemp) / tempRange) * 100));
          const barWidth = Math.max(10, rightPercent - leftPercent);

          return (
            <div
              key={index}
              className={`forecast-row-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectDay(dayData)}
              role="button"
              tabIndex={0}
            >
              <div className="day-col">
                <span className="day-name">{dayData.day}</span>
                <span className="day-date">{dayData.date}</span>
              </div>

              <div className="condition-col">
                <WeatherIcon condition={dayData.condition} size={24} />
                <span className="condition-label">{dayData.condition}</span>
                {dayData.pop > 10 && <span className="pop-chip">💧 {dayData.pop}%</span>}
              </div>

              <div className="temp-range-col">
                <span className="temp-low">{displayTemp(dayData.low)}</span>
                <div className="temp-bar-track">
                  <div
                    className="temp-bar-fill"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${barWidth}%`,
                    }}
                  />
                </div>
                <span className="temp-high">{displayTemp(dayData.high)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ForecastCard;
