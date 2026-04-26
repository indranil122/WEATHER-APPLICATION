# SkyCast AI

SkyCast AI is a modern, beautifully designed weather application built with React, Vite, and Tailwind CSS v4. It embraces the claymorphism aesthetic and features AI-powered weather summaries via Gemini.

## Features

- **Real-Time Weather Data:** Get up-to-date current, 24-hour, and 7-day forecast data.
- **AI Weather Analyst:** Delivers bite-sized insights and summaries (e.g., packing advice, activity recommendations) powered by Google's Gemini AI.
- **Immersive Design:** Uses fluid animations (`motion/react`) alongside a handcrafted Claymorphism/Glassmorphism hybrid styling interface that adapts its theme and background dynamically to matches the weather condition (Sunny, Rainy, Snowy, etc.).
- **Smart Search:** Quickly search and save your favorite locations with quick-access pills and interactive widgets.
- **Dark & Light Mode:** Fully responsive to user preference with a custom animated reveal transition.

## Technologies Used

- **Frontend:** React 19, TypeScript, Vite 6
- **Styling:** Tailwind CSS v4, Lucide React (Icons)
- **Animations:** Motion (Framer Motion)
- **APIs:** WeatherAPI.com (Weather Data), Google Gen AI / Gemini (Smart Summaries)

## Getting Started

To run this application locally, you will need to add your API keys to an `.env` file based on `.env.example`.

### Pre-requisites
- [Node.js](https://nodejs.org/) installed
- Valid API keys:
  - `VITE_WEATHER_API_KEY`: Grab one from [WeatherAPI.com](https://www.weatherapi.com/)
  - `GEMINI_API_KEY`: Grab one from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create your `.env` file:
   ```bash
   cp .env.example .env
   # Ensure you populate VITE_WEATHER_API_KEY and GEMINI_API_KEY here
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Design Notes

This project primarily utilizes standard utility classes combined with CSS custom properties to manage theme changes transparently cleanly. It uses the `dark:` utility modifier explicitly configured with Tailwind v4's `@custom-variant dark (&:where(.dark, .dark *))` to maintain complete control over the styling across light/dark palettes without being overridden by the OS choice unless intentionally synced. 
