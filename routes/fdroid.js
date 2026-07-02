const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

async function searchFdroid(query, limit = 10) {
  const url = `https://api.orx.ma/se/fdroid?query=${encodeURIComponent(query)}&limit=${limit}`;

  const headers = {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "accept-encoding": "gzip, deflate, br",
    "referer": "https://api.orx.ma/",
    "origin": "https://api.orx.ma"
  };

  const { data } = await axios.get(url, { headers });

  if (!data.status || !data.result || data.result.length === 0) {
    throw new Error("No apps found");
  }

  return data.result.map(app => ({
    name: app.name,
    package: app.package,
    icon: app.icon,
    url: app.url,
    detailApi: app.detail_api
  }));
}

router.get("/search", async (req, res) => {
  try {
    const { q, query, limit = 10 } = req.query;

    const searchQuery = q || query;

    if (!searchQuery || typeof searchQuery !== "string" || searchQuery.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Missing or invalid parameter: 'q' or 'query' is required",
        example: `${global.t || "http://localhost:3000"}/api/fdroid/search?q=telegram&limit=10`
      });
    }

    const results = await searchFdroid(searchQuery.trim(), parseInt(limit) || 10);

    return res.status(200).json({
      status: true,
      query: searchQuery.trim(),
      total: results.length,
      results: results
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Failed to search F-Droid"
    });
  }
});

module.exports = {
  path: "/api/fdroid",
  name: "F-Droid Search",
  type: "get",
  url: `${global.t || "http://localhost:3000"}/api/fdroid/search?q=telegram&limit=10`,
  logo: "https://cdn-icons-png.flaticon.com/512/888/888857.png",
  category: "search",
  info: "Search for open-source Android apps on F-Droid",
  router
};

