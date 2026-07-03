const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

async function getWeather(city) {
  const url = `https://api.orx.ma/tl/weather?city=${encodeURIComponent(city)}`;

  const headers = {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "accept-encoding": "gzip, deflate, br",
    "referer": "https://api.orx.ma/",
    "origin": "https://api.orx.ma"
  };

  const { data } = await axios.get(url, { headers });

  if (!data.status || !data.result) {
    throw new Error("Weather data not found");
  }

  return {
    location: {
      city: data.result.location.city,
      country: data.result.location.country,
      region: data.result.location.region,
      latitude: data.result.location.latitude,
      longitude: data.result.location.longitude
    },
    current: {
      tempC: data.result.current.temp_c,
      tempF: data.result.current.temp_f,
      feelsLikeC: data.result.current.feels_like_c,
      feelsLikeF: data.result.current.feels_like_f,
      humidity: data.result.current.humidity,
      windSpeedKmph: data.result.current.wind_speed_kmph,
      windDirection: data.result.current.wind_direction,
      visibilityKm: data.result.current.visibility_km,
      uvIndex: data.result.current.uv_index,
      description: data.result.current.description,
      cloudCover: data.result.current.cloud_cover,
      pressureMb: data.result.current.pressure_mb
    },
    forecast: (data.result.forecast || []).map(day => ({
      date: day.date,
      maxTempC: day.max_temp_c,
      minTempC: day.min_temp_c,
      maxTempF: day.max_temp_f,
      minTempF: day.min_temp_f,
      sunrise: day.sunrise,
      sunset: day.sunset,
      description: day.description
    }))
  };
}

router.get("/weather", async (req, res) => {
  try {
    const { q, query, city } = req.query;

    const searchCity = q || query || city;

    if (!searchCity || typeof searchCity !== "string" || searchCity.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Missing or invalid parameter: 'q', 'query', or 'city' is required",
        example: `${global.t || "http://localhost:3000"}/api/weather/weather?city=casablanca`
      });
    }

    const result = await getWeather(searchCity.trim());

    return res.status(200).json({
      status: true,
      location: result.location,
      current: result.current,
      forecast: result.forecast,
      totalForecastDays: result.forecast.length
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Failed to fetch weather data"
    });
  }
});

module.exports = {
  path: "/api/weather",
  name: "Weather Forecast",
  type: "get",
  url: `${global.t || "http://localhost:3000"}/api/weather/weather?city=casablanca`,
  logo: "https://cdn-icons-png.flaticon.com/512/1163/1163661.png",
  category: "tools",
  info: "Get current weather and forecast for any city",
  router
};

