const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

async function searchTopCinema(query, type = "anime", limit = 5) {
  const url = `https://api.orx.ma/se/topcinema?query=${encodeURIComponent(query)}&limit=${limit}&type=${type}`;

  const headers = {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9,ar;q=0.8",
    "accept-encoding": "gzip, deflate, br",
    "referer": "https://api.orx.ma/",
    "origin": "https://api.orx.ma"
  };

  const { data } = await axios.get(url, { headers });

  if (!data.status || !data.result || data.result.length === 0) {
    throw new Error("No results found");
  }

  return data.result.map(item => ({
    title: item.title,
    type: item.type,
    category: item.category || "",
    genres: item.genres || "",
    quality: Array.isArray(item.quality) ? item.quality : [item.quality],
    year: item.year || "",
    country: item.country || "",
    story: item.story || "",
    poster: item.poster || "",
    imdb: item.imdb || "",
    pageUrl: item.page_url || "",
    seasonsCount: item.seasons_count || 0,
    totalEpisodes: item.total_episodes || 0,
    actors: item.actors || [],
    seasons: (item.seasons || []).map(s => ({
      label: s.label,
      url: s.url,
      episodesCount: s.episodes_count
    })),
    episodes: (item.episodes || []).map(ep => ({
      title: ep.title,
      episode: ep.episode,
      season: ep.season,
      seasonUrl: ep.season_url,
      url: ep.url
    }))
  }));
}

router.get("/search", async (req, res) => {
  try {
    const { q, query, type = "anime", limit = 5 } = req.query;

    const searchQuery = q || query;

    if (!searchQuery || typeof searchQuery !== "string" || searchQuery.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Missing or invalid parameter: 'q' or 'query' is required",
        example: `${global.t || "http://localhost:3000"}/api/topcinema/search?q=one+piece&type=anime&limit=5`
      });
    }

    const results = await searchTopCinema(searchQuery.trim(), type, parseInt(limit) || 5);

    return res.status(200).json({
      status: true,
      query: searchQuery.trim(),
      type: type,
      total: results.length,
      results: results
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Failed to search Top Cinema"
    });
  }
});

module.exports = {
  path: "/api/topcinema",
  name: "Top Cinema",
  type: "get",
  url: `${global.t || "http://localhost:3000"}/api/topcinema/search?q=one+piece&type=anime&limit=5`,
  logo: "https://cdn-icons-png.flaticon.com/512/3658/3659898.png",
  category: "search",
  info: "Search for anime and movies from Top Cinema",
  router
};
