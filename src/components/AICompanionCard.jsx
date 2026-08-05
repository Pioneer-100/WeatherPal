import React from 'react';
import { getClothingAdvice, getActivityRatings } from '../utils/weatherHelpers';

function AICompanionCard({ weather }) {
  if (!weather) return null;

  const clothingItems = getClothingAdvice(weather.temperature, weather.condition, weather.windSpeed, weather.uvIndex);
  const activities = getActivityRatings(weather.temperature, weather.condition, weather.windSpeed, weather.uvIndex);

  return (
    <div className="ai-companion-card glass-panel">
      <div className="card-header">
        <div className="ai-title-row">
          <span className="ai-sparkle">✨</span>
          <h3 className="card-title">WeatherPal Assistant & Insights</h3>
        </div>
        <span className="ai-badge">AI Powered</span>
      </div>

      <div className="ai-content-grid">
        {/* What to Wear Section */}
        <div className="ai-section">
          <h4 className="section-title">👔 Recommended Attire</h4>
          <div className="clothing-grid">
            {clothingItems.map((item, i) => (
              <div key={i} className="clothing-chip">
                <span className="clothing-icon">{item.icon}</span>
                <div className="clothing-text">
                  <span className="clothing-title">{item.title}</span>
                  <span className="clothing-detail">{item.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Outdoor Activity Scores */}
        <div className="ai-section">
          <h4 className="section-title">🧭 Outdoor Activity Ratings</h4>
          <div className="activity-list">
            {activities.map((act, idx) => (
              <div key={idx} className="activity-item">
                <div className="activity-info">
                  <span className="act-icon">{act.icon}</span>
                  <span className="act-name">{act.name}</span>
                </div>
                <div className="activity-score-wrap">
                  <div className="score-bar-bg">
                    <div
                      className="score-bar-fill"
                      style={{
                        width: `${act.score}%`,
                        backgroundColor: act.score > 70 ? '#10B981' : act.score > 45 ? '#F59E0B' : '#EF4444',
                      }}
                    />
                  </div>
                  <span className="score-num">{act.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AICompanionCard;
