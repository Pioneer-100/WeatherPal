import React from 'react';
import { WeatherIcon } from './WeatherIcons';
import { cToF, formatFormattedTime, getTimezoneOffsetLabel } from '../utils/weatherHelpers';

function HourlyForecastChart({ hourly = [], unit = 'C', tzMode = 'city', timezoneOffsetSec = 0 }) {
  if (!hourly || hourly.length === 0) return null;

  const displayTemp = (celsius) => (unit === 'F' ? `${cToF(celsius)}°` : `${celsius}°`);

  const temps = hourly.map((h) => h.temp);
  const minTemp = Math.min(...temps) - 2;
  const maxTemp = Math.max(...temps) + 2;
  const range = maxTemp - minTemp || 1;

  const tzLabel = getTimezoneOffsetLabel(timezoneOffsetSec, tzMode);

  return (
    <div className="hourly-card glass-panel">
      <div className="card-header">
        <h3 className="card-title">⏱️ 24-Hour Forecast</h3>
        <span className="card-subtitle">
          Timeline in {tzLabel}
        </span>
      </div>

      <div className="hourly-scroll-container">
        <div className="hourly-timeline">
          {hourly.map((item, index) => {
            const heightPercent = Math.round(((item.temp - minTemp) / range) * 60 + 20);

            const displayTime = index === 0 && tzMode === 'city'
              ? 'Now'
              : formatFormattedTime(item.utcSec, timezoneOffsetSec, tzMode, false);

            return (
              <div key={index} className={`hourly-item ${index === 0 ? 'current-hour' : ''}`}>
                <span className="hourly-time">{displayTime}</span>

                <div className="hourly-icon-wrap">
                  <WeatherIcon condition={item.condition} isNight={item.isNight} size={22} />
                </div>

                <div className="hourly-bar-wrap">
                  <div
                    className="hourly-temp-pill"
                    style={{ height: `${heightPercent}%` }}
                  >
                    <span className="hourly-temp-val">{displayTemp(item.temp)}</span>
                  </div>
                </div>

                {item.pop > 0 ? (
                  <span className="hourly-pop">💧 {item.pop}%</span>
                ) : (
                  <span className="hourly-pop empty">-</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default HourlyForecastChart;
