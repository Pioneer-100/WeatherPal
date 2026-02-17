import { useState, useEffect, useRef, useCallback } from 'react'
import '../styles/MapModal.css'

function MapModal({ onClose, onSelectLocation }) {
  const mapRef = useRef(null)
  const [selectedCoords, setSelectedCoords] = useState(null)
  const [selectedCity, setSelectedCity] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  const handleMapClick = useCallback(async (e) => {
    const { lat, lng } = e.latlng
    setSelectedCoords({ lat, lng })
    setIsLoading(true)

    try {
      // Use reverse geocoding to get city name
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      )
      const data = await response.json()
      
      // Try multiple address fields for better city extraction
      let city = 'Unknown Location'
      if (data.address) {
        city = data.address.city || 
               data.address.town || 
               data.address.village ||
               data.address.county || 
               data.address.municipality
      }
      
      if (!city || city === 'Unknown Location') {
        // Fallback to parsing display_name
        const parts = data.display_name?.split(',') || []
        city = parts[0]?.trim() || 'Unknown Location'
      }
      
      setSelectedCity(city)

      // Add or update marker
      const L = window.L
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current)
      }
      const marker = L.marker([lat, lng])
        .addTo(mapInstanceRef.current)
        .bindPopup(city)
        .openPopup()
      markerRef.current = marker
    } catch (error) {
      console.error('Error getting city name:', error)
      setSelectedCity('Unknown Location')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Dynamically load Leaflet
    const loadLeaflet = async () => {
      if (!window.L) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
        document.head.appendChild(link)

        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
        script.onload = initMap
        document.body.appendChild(script)
      } else {
        initMap()
      }
    }

    const initMap = () => {
      if (mapRef.current && !mapInstanceRef.current) {
        const L = window.L
        const map = L.map(mapRef.current, {
          dragging: true,
          touchZoom: true,
          doubleClickZoom: true,
          keyboard: true,
        }).setView([20, 0], 3)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map)

        // Ensure click events work properly at all zoom levels
        map.on('click', handleMapClick)
        mapInstanceRef.current = map
      }
    }

    loadLeaflet()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off('click', handleMapClick)
      }
    }
  }, [handleMapClick])

  const handleConfirm = () => {
    if (selectedCity) {
      onSelectLocation(selectedCity)
    }
  }

  return (
    <div className="map-modal-overlay" onClick={onClose}>
      <div className="map-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="map-modal-header">
          <h2>Select Location on Map</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="map-container">
          <div ref={mapRef} className="map"></div>
        </div>

        <div className="map-modal-footer">
          {isLoading && <p className="loading-text">Loading location...</p>}
          {selectedCity && !isLoading && (
            <>
              <p className="selected-city">Selected: <strong>{selectedCity}</strong></p>
              <button className="confirm-button" onClick={handleConfirm}>
                Get Weather for {selectedCity}
              </button>
            </>
          )}
          {!selectedCity && !isLoading && (
            <p className="hint-text">Click on the map to select a location</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default MapModal
