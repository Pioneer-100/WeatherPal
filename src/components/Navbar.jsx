import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, MapPinIcon, GlobeIcon, StarIcon, VolumeIcon } from './WeatherIcons';
import { searchCities } from '../utils/weatherApi';

function Navbar({
  onSearch,
  onCurrentLocation,
  onOpenMap,
  onToggleFavorites,
  favoritesCount = 0,
  unit = 'C',
  onToggleUnit,
  tzMode = 'city',
  onToggleTzMode,
  isPlayingAudio = false,
  onToggleAudio,
  isLocating = false,
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchCities(query);
      setSuggestions(results);
      setShowDropdown(true);
      setIsSearching(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowDropdown(false);
    }
  };

  const handleSelectSuggestion = (cityDisplay) => {
    setQuery(cityDisplay.split(',')[0]);
    onSearch(cityDisplay.split(',')[0]);
    setShowDropdown(false);
  };

  return (
    <header className="navbar">
      <div className="nav-brand">
        <span className="brand-logo">🌤️</span>
        <div className="brand-text">
          <span className="brand-name">WeatherPal</span>
          <span className="brand-tag">PRO</span>
        </div>
      </div>

      <div className="search-container" ref={searchRef}>
        <form onSubmit={handleSubmit} className="search-form">
          <SearchIcon className="search-icon" size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city, country..."
            className="search-input"
          />
          {isSearching && <div className="search-spinner" />}
          {query && (
            <button type="button" className="clear-btn" onClick={() => setQuery('')}>
              ✕
            </button>
          )}
        </form>

        {showDropdown && suggestions.length > 0 && (
          <ul className="suggestions-dropdown">
            {suggestions.map((item, index) => (
              <li key={index} onClick={() => handleSelectSuggestion(item.display)} className="suggestion-item">
                <MapPinIcon size={14} className="suggestion-icon" />
                <span className="suggestion-name">{item.name}</span>
                <span className="suggestion-sub">
                  {item.admin1 ? `${item.admin1}, ` : ''}{item.country}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="nav-actions">
        <button
          className="nav-btn"
          onClick={onCurrentLocation}
          disabled={isLocating}
          title="Use My Location"
        >
          <MapPinIcon size={18} />
          <span className="nav-btn-label">{isLocating ? 'Locating...' : 'Near Me'}</span>
        </button>

        <button className="nav-btn" onClick={onOpenMap} title="Select on Interactive Radar Map">
          <GlobeIcon size={18} />
          <span className="nav-btn-label">Radar Map</span>
        </button>

        <button className="nav-btn favorites-btn" onClick={onToggleFavorites} title="Saved Locations">
          <StarIcon size={18} filled={favoritesCount > 0} />
          <span className="nav-btn-label">Saved</span>
          {favoritesCount > 0 && <span className="favorites-badge">{favoritesCount}</span>}
        </button>

        <button className={`nav-btn sound-btn ${isPlayingAudio ? 'active' : ''}`} onClick={onToggleAudio} title="Toggle Ambient Weather Soundscapes">
          <VolumeIcon size={18} muted={!isPlayingAudio} />
          <span className="nav-btn-label">{isPlayingAudio ? 'Sound On' : 'Sound Off'}</span>
        </button>

        {/* Timezone Switcher Toggle */}
        <div className="unit-toggle tz-toggle" onClick={onToggleTzMode} title="Switch between City Time and Device Time">
          <button className={`unit-btn ${tzMode === 'city' ? 'active' : ''}`}>📍 City Time</button>
          <button className={`unit-btn ${tzMode === 'device' ? 'active' : ''}`}>⌚ My Time</button>
        </div>

        {/* Unit (°C / °F) Toggle */}
        <div className="unit-toggle" onClick={onToggleUnit} title="Toggle °C / °F">
          <button className={`unit-btn ${unit === 'C' ? 'active' : ''}`}>°C</button>
          <button className={`unit-btn ${unit === 'F' ? 'active' : ''}`}>°F</button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
