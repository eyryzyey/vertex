const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

async function searchApkpure(query, limit = 10) {
  const url = `https://api.orx.ma/se/apkpure?query=${encodeURIComponent(query)}&limit=${limit}`;

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
    title: app.title,
    developer: app.developer,
    rating: app.rating,
    icon: app.icon,
    package: app.package,
    slug: app.slug,
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
        example: `${global.t || "http://localhost:3000"}/api/apkpure/search?q=whatsapp&limit=10`
      });
    }

    const results = await searchApkpure(searchQuery.trim(), parseInt(limit) || 10);

    return res.status(200).json({
      status: true,
      query: searchQuery.trim(),
      total: results.length,
      results: results
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Failed to search APKPure"
    });
  }
});

module.exports = {
  path: "/api/apkpure",
  name: "APKPure Search",
  type: "get",
  url: `${global.t || "http://localhost:3000"}/api/apkpure/search?q=whatsapp&limit=10`,
  logo: "https://static.wikia.nocookie.net/logopedia/images/0/0c/APKPure_icon.png",
  category: "search",
  info: "Search for Android apps on APKPure",
  router
};
