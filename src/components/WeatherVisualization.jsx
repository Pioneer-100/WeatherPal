import { useState } from 'react'
import '../styles/WeatherVisualization.css'

function WeatherVisualization({ weather, onGenerate, isLoading }) {
  const [visualUrl, setVisualUrl] = useState(null)
  const [error, setError] = useState(null)
  const [imageLoading, setImageLoading] = useState(false)

  const handleGenerateVisualization = async () => {
    try {
      setImageLoading(true)
      setError(null)
      const url = await onGenerate(weather)
      setVisualUrl(url)
    } catch (err) {
      console.error('Error:', err)
      setError(err.message || 'Failed to generate visualization')
    } finally {
      setImageLoading(false)
    }
  }

  return (
    <div className="weather-visualization">
      <div className="visualization-header">
        <h3>AI-Generated Weather Art</h3>
        <button
          onClick={handleGenerateVisualization}
          disabled={isLoading || imageLoading}
          className="generate-button"
        >
          {imageLoading ? 'Generating...' : 'Generate Visualization'}
        </button>
      </div>

      {error && <div className="visualization-error">{error}</div>}

      {visualUrl && (
        <div className="visualization-container">
          <img src={visualUrl} alt="Weather visualization" className="visualization-image" />
          <p className="visualization-credit">AI Art © DALL-E 3</p>
        </div>
      )}

      {!visualUrl && !error && (
        <div className="visualization-placeholder">
          <p>💡 Click "Generate Visualization" to create AI art based on current weather</p>
        </div>
      )}
    </div>
  )
}

export default WeatherVisualization
