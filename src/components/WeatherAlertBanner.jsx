import React, { useState } from 'react';

function WeatherAlertBanner({ weather }) {
  const [dismissed, setDismissed] = useState(false);

  if (!weather || dismissed) return null;

  const alerts = [];
  const cond = (weather.condition || '').toLowerCase();

  if (cond.includes('thunder') || cond.includes('storm')) {
    alerts.push({ type: 'danger', icon: '⚡', title: 'Thunderstorm Warning', text: 'Lightning & heavy rain active in area. Seek indoor shelter.' });
  } else if (cond.includes('heavy rain') || cond.includes('shower')) {
    alerts.push({ type: 'warning', icon: '🌧️', title: 'Heavy Rainfall Alert', text: 'Expect slippery roads & reduced visibility.' });
  } else if (weather.windSpeed > 10) {
    alerts.push({ type: 'warning', icon: '💨', title: 'High Wind Advisory', text: `Strong winds up to ${Math.round(weather.windSpeed * 3.6)} km/h. Secure loose objects outdoors.` });
  } else if (weather.uvIndex >= 8) {
    alerts.push({ type: 'warning', icon: '☀️', title: 'Extreme UV Index Warning', text: `UV index is ${weather.uvIndex}. Wear SPF 50+ & limit sun exposure.` });
  } else if (weather.aqi >= 4) {
    alerts.push({ type: 'danger', icon: '😷', title: 'Unhealthy Air Quality Alert', text: 'AQI is poor. Sensitive individuals & outdoor runners should wear masks or stay indoors.' });
  }

  if (alerts.length === 0) return null;

  const alert = alerts[0];

  return (
    <div className={`weather-alert-banner ${alert.type}`}>
      <div className="alert-content">
        <span className="alert-icon">{alert.icon}</span>
        <div className="alert-text">
          <strong className="alert-title">{alert.title}: </strong>
          <span className="alert-desc">{alert.text}</span>
        </div>
      </div>
      <button className="alert-close" onClick={() => setDismissed(true)}>✕</button>
    </div>
  );
}

export default WeatherAlertBanner;
