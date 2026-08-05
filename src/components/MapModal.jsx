import React, { useState, useEffect, useRef, useCallback } from 'react';

function MapModal({ onClose, onSelectLocation, initialCoords = null }) {
  const mapRef = useRef(null);
  const [selectedCoords, setSelectedCoords] = useState(initialCoords);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeLayer, setActiveLayer] = useState('precipitation'); // precipitation, clouds, temp, wind
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const weatherLayerRef = useRef(null);

  const handleMapClick = useCallback(async (e) => {
    const { lat, lng } = e.latlng;
    setSelectedCoords({ lat, lng });
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();

      let city = 'Selected Location';
      if (data.address) {
        city = data.address.city || data.address.town || data.address.village || data.address.county || data.address.state || 'Selected Location';
      }

      setSelectedCity(city);

      const L = window.L;
      if (markerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
      }
      if (mapInstanceRef.current && L) {
        const marker = L.marker([lat, lng])
          .addTo(mapInstanceRef.current)
          .bindPopup(`<b>${city}</b><br/>Lat: ${lat.toFixed(2)}, Lon: ${lng.toFixed(2)}`)
          .openPopup();
        markerRef.current = marker;
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
      setSelectedCity('Selected Location');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadLeaflet = async () => {
      if (!window.L) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
        script.onload = initMap;
        document.body.appendChild(script);
      } else {
        initMap();
      }
    };

    const initMap = () => {
      if (mapRef.current && !mapInstanceRef.current) {
        const L = window.L;
        const center = initialCoords ? [initialCoords.lat, initialCoords.lon] : [20, 0];
        const map = L.map(mapRef.current, {
          dragging: true,
          touchZoom: true,
          doubleClickZoom: true,
          scrollWheelZoom: true,
        }).setView(center, initialCoords ? 7 : 3);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        map.on('click', handleMapClick);
        mapInstanceRef.current = map;
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off('click', handleMapClick);
      }
    };
  }, [handleMapClick, initialCoords]);

  const handleConfirm = () => {
    if (selectedCity && selectedCoords) {
      onSelectLocation(selectedCity, selectedCoords);
    }
  };

  return (
    <div className="map-modal-overlay" onClick={onClose}>
      <div className="map-modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="map-modal-header">
          <div className="map-title-wrap">
            <span className="map-icon">🌐</span>
            <h2>Interactive Weather Map</h2>
          </div>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="map-container">
          <div ref={mapRef} className="map" />
        </div>

        <div className="map-modal-footer">
          <div className="map-info">
            {isLoading ? (
              <p className="loading-text">Identifying location...</p>
            ) : selectedCity ? (
              <p className="selected-city">
                Location: <strong>{selectedCity}</strong>
              </p>
            ) : (
              <p className="hint-text">Click anywhere on the map to inspect weather</p>
            )}
          </div>

          {selectedCity && !isLoading && (
            <button className="confirm-button" onClick={handleConfirm}>
              Get Weather for {selectedCity}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MapModal;
