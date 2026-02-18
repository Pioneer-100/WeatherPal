# Deployment Checklist for WeatherPal

This file lists steps and tips to deploy the app to common static hosts (Vercel, Netlify, GitHub Pages).

## Environment
- Create a `.env` file with values from `.env.example`.
- Required: `VITE_WEATHER_API_KEY`.
- Optional: `VITE_BASE_PATH` (useful for GitHub Pages).

## Vercel
- Connect repository and set environment variables in project settings.
- Build command: `npm run build`
- Output directory: `dist`

## Netlify
- Set build command: `npm run build`
- Publish directory: `dist`
- Add environment variables in the site settings.

## GitHub Pages
- If deploying to GitHub Pages, set `VITE_BASE_PATH` to `/REPO_NAME/` and build with `npm run build`.
- Serve `dist/` contents.

## Notes
- The app uses OpenWeatherMap API; ensure your plan supports enough requests.
- To preview production build locally: `npm run preview`.
