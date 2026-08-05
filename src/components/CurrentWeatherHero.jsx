import React from 'react';
import { WeatherIcon, StarIcon, MapPinIcon } from './WeatherIcons';
import { cToF, msToKmh, msToMph, formatFormattedTime, getTimezoneOffsetLabel } from '../utils/weatherHelpers';

function CurrentWeatherHero({
  weather,
  unit = 'C',
  tzMode = 'city',
  isFavorite = false,
  onToggleFavorite,
  selectedDay = null,
  onClearSelectedDay,
}) {
  if (!weather) return null;

  const displayTemp = (celsius) => (unit === 'F' ? `${cToF(celsius)}°F` : `${celsius}°C`);
  const displayWind = (ms) => (unit === 'F' ? `${msToMph(ms)} mph` : `${msToKmh(ms)} km/h`);

  const activeData = selectedDay || {
    day: 'Today',
    condition: weather.condition,
    high: weather.temperature,
    low: weather.feelsLike,
    isCurrent: true,
  };

  const isSelectedForecast = Boolean(selectedDay);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const nowSec = Math.floor(Date.now() / 1000);
  const currentTimeString = formatFormattedTime(nowSec, weather.timezoneOffsetSec, tzMode, true);
  const tzLabel = getTimezoneOffsetLabel(weather.timezoneOffsetSec, tzMode);

  return (
    <div className="hero-card glass-panel">
      <div className="hero-header">
        <div className="location-info">
          <div className="city-title-row">
            <MapPinIcon size={22} className="pin-icon" />
            <h1 className="city-name">
              {weather.city}{weather.country ? `, ${weather.country}` : ''}
            </h1>
            <button
              className={`favorite-star-btn ${isFavorite ? 'is-favorite' : ''}`}
              onClick={onToggleFavorite}
              title={isFavorite ? 'Remove from Favorites' : 'Save to Favorites'}
            >
              <StarIcon size={22} filled={isFavorite} />
            </button>
          </div>
          <p className="hero-date">
            {isSelectedForecast
              ? `Forecast for ${selectedDay.day}, ${selectedDay.date}`
              : `${formattedDate} • ${currentTimeString} • ${tzLabel}`}
          </p>
        </div>

        {isSelectedForecast && (
          <button className="back-hero-btn" onClick={onClearSelectedDay}>
            ← Back to Current Weather
          </button>
        )}
      </div>

      <div className="hero-main-row">
        <div className="temp-section">
          <div className="temp-value-display">
            {!isSelectedForecast ? (
              <span className="temp-num">{displayTemp(weather.temperature)}</span>
            ) : (
              <div className="forecast-range-display">
                <span className="temp-num high">{displayTemp(selectedDay.high)}</span>
                <span className="temp-divider">/</span>
                <span className="temp-num low">{displayTemp(selectedDay.low)}</span>
              </div>
            )}
          </div>

          <div className="condition-badge">
            <WeatherIcon condition={activeData.condition} isNight={weather.isNight} size={28} />
            <span className="condition-text">{activeData.condition}</span>
          </div>
        </div>

        <div className="hero-quick-pills">
          {!isSelectedForecast ? (
            <>
              <div className="pill-item">
                <span className="pill-label">Feels Like</span>
                <span className="pill-value">{displayTemp(weather.feelsLike)}</span>
              </div>
              <div className="pill-item">
                <span className="pill-label">Humidity</span>
                <span className="pill-value">{weather.humidity}%</span>
              </div>
              <div className="pill-item">
                <span className="pill-label">Wind</span>
                <span className="pill-value">{displayWind(weather.windSpeed)}</span>
              </div>
              <div className="pill-item">
                <span className="pill-label">UV Index</span>
                <span className="pill-value">{weather.uvIndex} / 10</span>
              </div>
            </>
          ) : (
            <>
              <div className="pill-item">
                <span className="pill-label">Precipitation</span>
                <span className="pill-value">{selectedDay.pop || 0}%</span>
              </div>
              <div className="pill-item">
                <span className="pill-label">Max UV</span>
                <span className="pill-value">{selectedDay.uvMax || 3} / 10</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CurrentWeatherHero;
