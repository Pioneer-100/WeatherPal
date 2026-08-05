import React from 'react';
import { StarIcon, MapPinIcon } from './WeatherIcons';

function FavoritesDrawer({ isOpen, onClose, favorites = [], onSelectFavorite, onRemoveFavorite }) {
  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-row">
            <StarIcon size={20} filled={true} className="star-gold" />
            <h2>Saved Locations</h2>
          </div>
          <button className="close-drawer-btn" onClick={onClose}>✕</button>
        </div>

        <div className="drawer-body">
          {favorites.length === 0 ? (
            <div className="empty-drawer">
              <span className="empty-icon">⭐</span>
              <p className="empty-title">No saved cities yet</p>
              <p className="empty-desc">
                Click the star icon next to any city name to pin it here for quick 1-tap access!
              </p>
            </div>
          ) : (
            <div className="favorites-list">
              {favorites.map((fav, i) => (
                <div key={i} className="favorite-card-item">
                  <div className="fav-info" onClick={() => { onSelectFavorite(fav.city); onClose(); }}>
                    <MapPinIcon size={18} className="fav-pin" />
                    <span className="fav-city">{fav.city}</span>
                    {fav.country && <span className="fav-country">{fav.country}</span>}
                  </div>
                  <button
                    className="remove-fav-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFavorite(fav.city);
                    }}
                    title="Remove location"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FavoritesDrawer;
