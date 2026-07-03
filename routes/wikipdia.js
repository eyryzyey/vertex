const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

async function searchWikipedia(query, lang = "en") {
  const url = `https://api.orx.ma/tl/wikipedia?query=${encodeURIComponent(query)}&lang=${lang}`;

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
    throw new Error("No results found");
  }

  return {
    title: data.result.title,
    summary: data.result.summary,
    url: data.result.url,
    thumbnail: data.result.thumbnail,
    related: (data.result.related || []).map(item => ({
      title: item.title,
      snippet: item.snippet,
      url: item.url
    }))
  };
}

router.get("/search", async (req, res) => {
  try {
    const { q, query, lang = "en" } = req.query;

    const searchQuery = q || query;

    if (!searchQuery || typeof searchQuery !== "string" || searchQuery.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Missing or invalid parameter: 'q' or 'query' is required",
        example: `${global.t || "http://localhost:3000"}/api/wikipedia/search?q=artificial+intelligence&lang=en`
      });
    }

    const result = await searchWikipedia(searchQuery.trim(), lang);

    return res.status(200).json({
      status: true,
      query: searchQuery.trim(),
      lang: lang,
      title: result.title,
      summary: result.summary,
      url: result.url,
      thumbnail: result.thumbnail,
      related: result.related,
      totalRelated: result.related.length
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Failed to search Wikipedia"
    });
  }
});

module.exports = {
  path: "/api/wikipedia",
  name: "Wikipedia AI",
  type: "get",
  url: `${global.t || "http://localhost:3000"}/api/wikipedia/search?q=artificial+intelligence&lang=en`,
  logo: "https://cdn-icons-png.flaticon.com/512/174/174854.png",
  category: "ai",
  info: "Search for articles on Wikipedia",
  router
};

