// Unit conversions and weather logic helpers

export function cToF(celsius) {
  return Math.round((celsius * 9) / 5 + 32);
}

export function msToKmh(ms) {
  return Math.round(ms * 3.6);
}

export function msToMph(ms) {
  return Math.round(ms * 2.23694);
}

export function getWindDirection(deg) {
  if (deg === undefined || deg === null) return 'N/A';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

// Format time either in City Timezone (offset in seconds) or Device Local Time
export function formatFormattedTime(utcTimestampSec, timezoneOffsetSec = 0, tzMode = 'city', showMinutes = true) {
  if (!utcTimestampSec) return '--:--';
  
  if (tzMode === 'device') {
    const d = new Date(utcTimestampSec * 1000);
    return d.toLocaleTimeString([], {
      hour: 'numeric',
      minute: showMinutes ? '2-digit' : undefined,
    });
  }

  // City Timezone mode: Adjust UTC time by timezoneOffsetSec
  const cityMs = (utcTimestampSec + timezoneOffsetSec) * 1000;
  const d = new Date(cityMs);
  
  // Format using UTC methods to prevent browser local offset from double-applying
  const hours = d.getUTCHours();
  const minutes = d.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;

  if (showMinutes) {
    return `${displayHours}:${displayMinutes} ${ampm}`;
  }
  return `${displayHours} ${ampm}`;
}

export function getTimezoneOffsetLabel(timezoneOffsetSec = 0, tzMode = 'city') {
  if (tzMode === 'device') {
    const deviceOffsetMin = -new Date().getTimezoneOffset();
    const hrs = Math.floor(Math.abs(deviceOffsetMin) / 60);
    const sign = deviceOffsetMin >= 0 ? '+' : '-';
    return `Device Time (UTC${sign}${hrs})`;
  }

  const hrs = Math.floor(Math.abs(timezoneOffsetSec) / 3600);
  const sign = timezoneOffsetSec >= 0 ? '+' : '-';
  return `City Time (UTC${sign}${hrs})`;
}

export function getSeason(latitude = 51.5, date = new Date()) {
  const month = date.getMonth(); // 0-11
  const isNorthern = latitude >= 0;

  if (month === 11 || month === 0 || month === 1) {
    return isNorthern ? 'winter' : 'summer';
  } else if (month >= 2 && month <= 4) {
    return isNorthern ? 'spring' : 'autumn';
  } else if (month >= 5 && month <= 7) {
    return isNorthern ? 'summer' : 'winter';
  } else {
    return isNorthern ? 'autumn' : 'spring';
  }
}

export function getSeasonPalette(season) {
  switch (season) {
    case 'summer':
      return {
        fieldGround: ['rgba(34, 197, 94, 0.4)', 'rgba(21, 128, 61, 0.6)'],
        grass: ['#22c55e', '#16a34a', '#15803d', '#4ade80'],
        foliagePrimary: '#16a34a',
        foliageSecondary: '#15803d',
        foliageAccent: '#22c55e',
        trunk: '#513926',
      };
    case 'autumn':
      return {
        fieldGround: ['rgba(234, 88, 12, 0.4)', 'rgba(180, 83, 9, 0.6)'],
        grass: ['#f97316', '#d97706', '#b45309', '#eab308'],
        foliagePrimary: '#ea580c',
        foliageSecondary: '#b45309',
        foliageAccent: '#f97316',
        trunk: '#452b1b',
      };
    case 'winter':
      return {
        fieldGround: ['rgba(71, 85, 105, 0.4)', 'rgba(51, 65, 85, 0.6)'],
        grass: ['#64748b', '#475569', '#94a3b8', '#cbd5e1'],
        foliagePrimary: 'transparent',
        foliageSecondary: 'transparent',
        foliageAccent: 'transparent',
        trunk: '#334155',
        isBare: true,
      };
    case 'spring':
    default:
      return {
        fieldGround: ['rgba(74, 222, 128, 0.4)', 'rgba(34, 197, 94, 0.6)'],
        grass: ['#4ade80', '#22c55e', '#86efac', '#f472b6'],
        foliagePrimary: '#4ade80',
        foliageSecondary: '#22c55e',
        foliageAccent: '#f472b6',
        trunk: '#5c4028',
      };
  }
}

export function getAQIInfo(aqi) {
  const levels = {
    1: { label: 'Good', color: '#10B981', bg: 'rgba(16, 185, 129, 0.2)', desc: 'Air quality is satisfactory, and air pollution poses little or no risk.' },
    2: { label: 'Fair', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.2)', desc: 'Air quality is acceptable; moderate concern for sensitive individuals.' },
    3: { label: 'Moderate', color: '#F97316', bg: 'rgba(249, 115, 22, 0.2)', desc: 'Members of sensitive groups may experience health effects.' },
    4: { label: 'Poor', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.2)', desc: 'Everyone may begin to experience health effects.' },
    5: { label: 'Very Poor', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.2)', desc: 'Health alert: risk of serious health effects for all.' },
  };

  const rounded = Math.min(Math.max(Math.round(aqi || 1), 1), 5);
  return levels[rounded] || levels[1];
}

export function getUVInfo(uv) {
  const val = Math.round(uv || 0);
  if (val <= 2) return { level: 'Low', color: '#10B981', advice: 'No protection required. Enjoy the sun safely.' };
  if (val <= 5) return { level: 'Moderate', color: '#F59E0B', advice: 'Wear sunglasses & SPF 30+ if outdoors during midday.' };
  if (val <= 7) return { level: 'High', color: '#F97316', advice: 'Protection required. Seek shade during peak sun hours.' };
  if (val <= 10) return { level: 'Very High', color: '#EF4444', advice: 'Extra protection needed. Avoid direct sun 11am-4pm.' };
  return { level: 'Extreme', color: '#8B5CF6', advice: 'Take full precautions. Unprotected skin burns in minutes.' };
}

export function getClothingAdvice(tempC, condition, windMs, uvIndex) {
  const items = [];
  const conditionLower = (condition || '').toLowerCase();

  if (tempC < 5) {
    items.push({ icon: '🧥', title: 'Heavy Winter Coat', detail: 'Thermal base layers & warm parka' });
  } else if (tempC < 15) {
    items.push({ icon: '🧥', title: 'Jacket or Sweater', detail: 'Light coat or cozy fleece jacket' });
  } else if (tempC < 23) {
    items.push({ icon: '👕', title: 'Long Sleeves or Tee', detail: 'Comfortable casual layering' });
  } else {
    items.push({ icon: '🎽', title: 'Breathable Light Wear', detail: 'Cotton t-shirt or tank top' });
  }

  if (conditionLower.includes('rain') || conditionLower.includes('drizzle') || conditionLower.includes('thunderstorm')) {
    items.push({ icon: '☂️', title: 'Waterproof Gear', detail: 'Sturdy umbrella & raincoat' });
  } else if (conditionLower.includes('snow')) {
    items.push({ icon: '🧣', title: 'Winter Accessories', detail: 'Warm scarf, gloves & beanie' });
  }

  if (uvIndex >= 4) {
    items.push({ icon: '🕶️', title: 'Sun Protection', detail: 'UV-blocking sunglasses & cap' });
  }

  if (windMs > 8) {
    items.push({ icon: '🧥', title: 'Windbreaker', detail: 'Shield against strong wind gusts' });
  }

  return items;
}

export function getActivityRatings(tempC, condition, windMs, uvIndex, pop = 0) {
  const cond = (condition || '').toLowerCase();
  const isRain = cond.includes('rain') || cond.includes('thunder') || pop > 40;
  const isSnow = cond.includes('snow');

  let runningScore = 90;
  if (tempC < 0 || tempC > 30) runningScore -= 30;
  if (isRain) runningScore -= 40;
  if (windMs > 10) runningScore -= 20;

  let cyclingScore = 90;
  if (tempC < 5 || tempC > 32) cyclingScore -= 30;
  if (isRain) cyclingScore -= 50;
  if (windMs > 7) cyclingScore -= 35;

  let stargazingScore = 85;
  if (cond.includes('cloud')) stargazingScore -= 50;
  if (isRain || isSnow) stargazingScore -= 70;
  if (tempC < -5) stargazingScore -= 20;

  let diningScore = 95;
  if (tempC < 18 || tempC > 30) diningScore -= 40;
  if (isRain) diningScore -= 60;
  if (windMs > 6) diningScore -= 30;

  const clamp = (val) => Math.min(Math.max(val, 15), 100);

  return [
    { name: 'Running / Jogging', score: clamp(runningScore), icon: '🏃‍♂️' },
    { name: 'Cycling / Biking', score: clamp(cyclingScore), icon: '🚴‍♂️' },
    { name: 'Outdoor Dining', score: clamp(diningScore), icon: '🍷' },
    { name: 'Stargazing / Night Sky', score: clamp(stargazingScore), icon: '🌌' },
  ];
}

export function getWeatherTheme(condition, isNight = false) {
  const c = (condition || '').toLowerCase();
  if (c.includes('thunder') || c.includes('storm')) return 'thunderstorm';
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return 'rain';
  if (c.includes('snow') || c.includes('sleet') || c.includes('flurry')) return 'snow';
  if (c.includes('mist') || c.includes('fog') || c.includes('haze')) return 'fog';
  if (c.includes('cloud')) return isNight ? 'cloudy-night' : 'cloudy-day';
  return isNight ? 'clear-night' : 'clear-day';
}
