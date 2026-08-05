import React from 'react';
import { CompassIcon, DropIcon } from './WeatherIcons';
import { getAQIInfo, getUVInfo, getWindDirection, msToKmh, msToMph, formatFormattedTime } from '../utils/weatherHelpers';

function DetailedMetricsGrid({ weather, unit = 'C', tzMode = 'city' }) {
  if (!weather) return null;

  const aqiInfo = getAQIInfo(weather.aqi);
  const uvInfo = getUVInfo(weather.uvIndex);
  const windDir = getWindDirection(weather.windDeg);
  const windSpeedText = unit === 'F' ? `${msToMph(weather.windSpeed)} mph` : `${msToKmh(weather.windSpeed)} km/h`;

  const sunriseFormatted = formatFormattedTime(weather.sunriseSec, weather.timezoneOffsetSec, tzMode, true);
  const sunsetFormatted = formatFormattedTime(weather.sunsetSec, weather.timezoneOffsetSec, tzMode, true);

  return (
    <div className="metrics-grid">
      {/* Air Quality Index Card */}
      <div className="metric-card glass-panel">
        <div className="metric-header">
          <span className="metric-icon">🍃</span>
          <h4 className="metric-title">Air Quality</h4>
        </div>
        <div className="metric-body">
          <div className="aqi-badge-wrap">
            <span className="aqi-number" style={{ color: aqiInfo.color }}>
              AQI {weather.aqi}
            </span>
            <span className="aqi-status" style={{ backgroundColor: aqiInfo.bg, color: aqiInfo.color }}>
              {aqiInfo.label}
            </span>
          </div>
          <p className="metric-desc">{aqiInfo.desc}</p>

          <div className="aqi-pollutants">
            <div className="pollutant-item">
              <span className="pollutant-label">PM2.5</span>
              <span className="pollutant-val">{weather.aqiDetails?.pm25 || 12} µg/m³</span>
            </div>
            <div className="pollutant-item">
              <span className="pollutant-label">PM10</span>
              <span className="pollutant-val">{weather.aqiDetails?.pm10 || 24} µg/m³</span>
            </div>
          </div>
        </div>
      </div>

      {/* UV Index Card */}
      <div className="metric-card glass-panel">
        <div className="metric-header">
          <span className="metric-icon">☀️</span>
          <h4 className="metric-title">UV Index</h4>
        </div>
        <div className="metric-body">
          <div className="uv-meter-row">
            <div className="uv-value-large" style={{ color: uvInfo.color }}>
              {weather.uvIndex}
            </div>
            <div className="uv-status-box">
              <span className="uv-level" style={{ color: uvInfo.color }}>{uvInfo.level}</span>
              <div className="uv-progress-bar">
                <div
                  className="uv-fill"
                  style={{
                    width: `${Math.min((weather.uvIndex / 11) * 100, 100)}%`,
                    backgroundColor: uvInfo.color,
                  }}
                />
              </div>
            </div>
          </div>
          <p className="metric-desc">{uvInfo.advice}</p>
        </div>
      </div>

      {/* Wind Direction Card */}
      <div className="metric-card glass-panel">
        <div className="metric-header">
          <span className="metric-icon">💨</span>
          <h4 className="metric-title">Wind & Gusts</h4>
        </div>
        <div className="metric-body wind-body">
          <div className="compass-widget">
            <div
              className="compass-arrow"
              style={{ transform: `rotate(${weather.windDeg || 0}deg)` }}
            >
              <CompassIcon size={42} />
            </div>
            <span className="wind-direction-text">{windDir} ({weather.windDeg}°)</span >
          </div>
          <div className="wind-details">
            <span className="wind-speed-val">{windSpeedText}</span>
            <span className="wind-sub">Wind Speed</span>
          </div>
        </div>
      </div>

      {/* Sunrise & Sunset Card */}
      <div className="metric-card glass-panel">
        <div className="metric-header">
          <span className="metric-icon">🌅</span>
          <h4 className="metric-title">Sun Schedule</h4>
        </div>
        <div className="metric-body sun-body">
          <div className="sun-item">
            <span className="sun-icon">🌄</span>
            <div className="sun-text">
              <span className="sun-label">Sunrise</span>
              <span className="sun-time">{sunriseFormatted}</span>
            </div>
          </div>
          <div className="sun-divider" />
          <div className="sun-item">
            <span className="sun-icon">🌇</span>
            <div className="sun-text">
              <span className="sun-label">Sunset</span>
              <span className="sun-time">{sunsetFormatted}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Humidity & Dew Point Card */}
      <div className="metric-card glass-panel">
        <div className="metric-header">
          <span className="metric-icon">💧</span>
          <h4 className="metric-title">Humidity</h4>
        </div>
        <div className="metric-body">
          <div className="humidity-row">
            <span className="humidity-val">{weather.humidity}%</span>
            <DropIcon size={24} className="humidity-icon" />
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${weather.humidity}%` }} />
          </div>
          <p className="metric-desc">
            {weather.humidity > 70 ? 'High moisture in air, feels humid.' : weather.humidity < 30 ? 'Dry air conditions.' : 'Comfortable humidity level.'}
          </p>
        </div>
      </div>

      {/* Pressure & Visibility Card */}
      <div className="metric-card glass-panel">
        <div className="metric-header">
          <span className="metric-icon">👁️</span>
          <h4 className="metric-title">Pressure & Visibility</h4>
        </div>
        <div className="metric-body split-body">
          <div className="stat-box">
            <span className="stat-val">{weather.visibility} km</span>
            <span className="stat-label">Visibility</span>
          </div>
          <div className="stat-box">
            <span className="stat-val">{weather.pressure} hPa</span>
            <span className="stat-label">Pressure</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailedMetricsGrid;
