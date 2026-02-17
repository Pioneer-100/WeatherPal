const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY

export async function generateWeatherVisualization(weatherData) {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in .env file.')
    }

    // Create a detailed prompt based on weather data
    const prompt = createWeatherPrompt(weatherData)

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`OpenAI API Error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()
    return data.data[0].url
  } catch (error) {
    console.error('Weather Visualization Error:', error)
    throw error
  }
}

function createWeatherPrompt(weather) {
  const { city, country, temperature, condition, humidity, windSpeed, feelsLike } = weather

  const prompts = {
    Clear: `Beautiful clear sunny day in ${city}, ${country}. Bright blue sky with warm sunlight, ${temperature}°C, perfect visibility. Artistic landscape painting.`,
    'Partly Cloudy': `Partly cloudy day in ${city}, ${country}. Mix of white fluffy clouds and blue sky, ${temperature}°C. Serene landscape with gentle clouds.`,
    Cloudy: `Overcast cloudy day in ${city}, ${country}. Gray clouds covering the sky, ${temperature}°C, soft diffused light. Moody landscape painting.`,
    Rainy: `Rainy weather in ${city}, ${country}. Rain falling from dark clouds, ${temperature}°C, wet streets reflecting light. Atmospheric cityscape.`,
    Snowy: `Snowy winter scene in ${city}, ${country}. Fresh snow covering landscape, ${temperature}°C, white and cold atmosphere. Serene winter landscape.`,
    Thunderstorm: `Dramatic thunderstorm in ${city}, ${country}. Dark storm clouds, lightning in the sky, ${temperature}°C. Intense atmospheric scene.`,
    Misty: `Misty morning in ${city}, ${country}. Fog and mist obscuring the landscape, ${temperature}°C. Mysterious atmospheric scene.`,
    Sunny: `Sunny day in ${city}, ${country}. Bright sunshine, clear skies, ${temperature}°C. Vibrant landscape painting.`,
    Drizzle: `Light drizzle in ${city}, ${country}. Gentle rain, ${temperature}°C. Wet and gloomy atmosphere.`,
    Smoke: `Smoky hazy day in ${city}, ${country}. Light haze in the air, ${temperature}°C. Atmospheric landscape.`,
  }

  const basePrompt = prompts[condition] || `Weather condition: ${condition}, Temperature: ${temperature}°C in ${city}, ${country}`
  
  return `${basePrompt}. High quality digital art, detailed, professional weather illustration. Humidity ${humidity}%, Wind ${windSpeed}m/s, Feels like ${feelsLike}°C.`
}
