import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import WeatherCanvas from './components/WeatherCanvas';
import CurrentWeatherHero from './components/CurrentWeatherHero';
import HourlyForecastChart from './components/HourlyForecastChart';
import DetailedMetricsGrid from './components/DetailedMetricsGrid';
import AICompanionCard from './components/AICompanionCard';
import ForecastCard from './components/ForecastCard';
import FavoritesDrawer from './components/FavoritesDrawer';
import MapModal from './components/MapModal';
import WeatherAlertBanner from './components/WeatherAlertBanner';
import { fetchWeather, fetchWeatherByCoords } from './utils/weatherApi';
import { soundEngine } from './utils/soundEngine';
import { getWeatherTheme } from './utils/weatherHelpers';
import './App.css';

function App() {
  const [weather, setWeather] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [unit, setUnit] = useState('C');
  const [tzMode, setTzMode] = useState('city'); // 'city' or 'device'
  const [loading, setLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('weatherpal_favorites');
      return saved ? JSON.parse(saved) : [{ city: 'London', country: 'GB' }, { city: 'Tokyo', country: 'JP' }];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('weatherpal_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.warn('LocalStorage failed:', e);
    }
  }, [favorites]);

  useEffect(() => {
    handleSearch('Harare');
  }, []);

  useEffect(() => {
    if (weather) {
      const themeClass = `theme-${getWeatherTheme(weather.condition, weather.isNight)}`;
      document.body.className = themeClass;
    }
  }, [weather]);

  const handleSearch = async (cityName) => {
    setLoading(true);
    setError(null);
    setSelectedDay(null);

    try {
      const data = await fetchWeather(cityName);
      if (data) {
        setWeather(data);
        if (isPlayingAudio) {
          soundEngine.play(data.condition);
        }
      } else {
        setError(`City "${cityName}" could not be found. Please try another location.`);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Could not fetch weather data. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
          if (data) {
            setWeather(data);
            setSelectedDay(null);
            if (isPlayingAudio) {
              soundEngine.play(data.condition);
            }
          }
        } catch (err) {
          setError('Failed to fetch weather for your exact location.');
        } finally {
          setIsLocating(false);
          setLoading(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        alert('Could not access your location. Please check browser permissions.');
        setIsLocating(false);
      }
    );
  };

  const handleMapSelectLocation = (cityName, coords) => {
    setShowMap(false);
    if (coords) {
      setLoading(true);
      fetchWeatherByCoords(coords.lat, coords.lng)
        .then((data) => {
          if (data) {
            setWeather(data);
            setSelectedDay(null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      handleSearch(cityName);
    }
  };

  const handleToggleFavorite = () => {
    if (!weather) return;
    const exists = favorites.some((f) => f.city.toLowerCase() === weather.city.toLowerCase());
    if (exists) {
      setFavorites(favorites.filter((f) => f.city.toLowerCase() !== weather.city.toLowerCase()));
    } else {
      setFavorites([...favorites, { city: weather.city, country: weather.country }]);
    }
  };

  const isCurrentFavorite = weather
    ? favorites.some((f) => f.city.toLowerCase() === weather.city.toLowerCase())
    : false;

  const handleToggleAudio = () => {
    const newState = soundEngine.toggleSound(weather ? weather.condition : 'clear-day');
    setIsPlayingAudio(newState);
  };

  return (
    <div className="app-container">
      {/* Background Animated Particle & Field Canvas */}
      <WeatherCanvas
        condition={weather?.condition}
        isNight={weather?.isNight}
        windSpeed={weather?.windSpeed}
        latitude={weather?.lat}
      />

      {/* Header Navigation */}
      <Navbar
        onSearch={handleSearch}
        onCurrentLocation={handleCurrentLocation}
        onOpenMap={() => setShowMap(true)}
        onToggleFavorites={() => setIsFavoritesOpen(true)}
        favoritesCount={favorites.length}
        unit={unit}
        onToggleUnit={() => setUnit(unit === 'C' ? 'F' : 'C')}
        tzMode={tzMode}
        onToggleTzMode={() => setTzMode(tzMode === 'city' ? 'device' : 'city')}
        isPlayingAudio={isPlayingAudio}
        onToggleAudio={handleToggleAudio}
        isLocating={isLocating}
      />

      {/* Severe Weather Warning Banner */}
      {weather && <WeatherAlertBanner weather={weather} />}

      {/* Loading Skeleton & Error State */}
      {loading && (
        <div className="loading-state glass-panel" style={{ padding: 40, textAlign: 'center' }}>
          <div className="search-spinner" style={{ margin: '0 auto 16px', width: 25, height: 32 }} />
          <h3>Fetching latest atmospheric data...</h3>
        </div>
      )}

      {error && !loading && (
        <div className="error-state glass-panel" style={{ padding: 30, textAlign: 'center', borderColor: '#ef4444' }}>
          <h3>⚠️ {error}</h3>
          <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>Try searching for a global city like London, Tokyo, or New York.</p>
        </div>
      )}

      {/* Main Weather Dashboard */}
      {!loading && weather && (
        <main className="dashboard-grid">
          <div className="main-column">
            <CurrentWeatherHero
              weather={weather}
              unit={unit}
              tzMode={tzMode}
              isFavorite={isCurrentFavorite}
              onToggleFavorite={handleToggleFavorite}
              selectedDay={selectedDay}
              onClearSelectedDay={() => setSelectedDay(null)}
            />

            <HourlyForecastChart
              hourly={weather.hourly}
              unit={unit}
              tzMode={tzMode}
              timezoneOffsetSec={weather.timezoneOffsetSec}
            />

            <DetailedMetricsGrid weather={weather} unit={unit} tzMode={tzMode} />

            <AICompanionCard weather={weather} />
          </div>

          <div className="side-column">
            <ForecastCard
              forecast={weather.forecast}
              onSelectDay={(day) => setSelectedDay(day)}
              selectedDay={selectedDay}
              unit={unit}
            />
          </div>
        </main>
      )}

      {/* Pinned Locations Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onSelectFavorite={(cityName) => handleSearch(cityName)}
        onRemoveFavorite={(cityName) =>
          setFavorites(favorites.filter((f) => f.city.toLowerCase() !== cityName.toLowerCase()))
        }
      />

      {/* Radar Map Selector Modal */}
      {showMap && (
        <MapModal
          onClose={() => setShowMap(false)}
          onSelectLocation={handleMapSelectLocation}
          initialCoords={weather ? { lat: weather.lat, lon: weather.lon } : null}
        />
      )}
    </div>
  );
}

export default App;
