const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

const BASE_URL = "https://a7a.online/foot/index.php";

const headers = {
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "accept": "application/json, text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "accept-language": "en-US,en;q=0.9",
  "accept-encoding": "gzip, deflate, br",
  "referer": "https://a7a.online/foot/"
};

async function getLeagues() {
  const url = `${BASE_URL}?cat=sports&sport=Football&format=json`;
  const { data } = await axios.get(url, { headers, timeout: 30000 });
  return data;
}

async function getMatches(league) {
  const url = `${BASE_URL}?cat=sports&sport=Football&league=${encodeURIComponent(league)}&format=json`;
  const { data } = await axios.get(url, { headers, timeout: 30000 });
  return data;
}

router.get("/leagues", async (req, res) => {
  try {
    const result = await getLeagues();

    return res.status(200).json({
      status: true,
      ...result
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Failed to fetch leagues"
    });
  }
});

router.get("/matches", async (req, res) => {
  try {
    const { league } = req.query;

    if (!league || typeof league !== "string" || league.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Missing or invalid parameter: 'league' is required",
        example: `${global.t || "http://localhost:3000"}/api/football/matches?league=Premier%20League`
      });
    }

    const result = await getMatches(league.trim());

    return res.status(200).json({
      status: true,
      ...result
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Failed to fetch matches"
    });
  }
});

module.exports = {
  path: "/api/football",
  name: "Football Live Streams",
  type: "get",
  url: `${global.t || "http://localhost:3000"}/api/football/matches?league=Premier%20League`,
  logo: "https://cdn-icons-png.flaticon.com/512/1099/1099672.png",
  category: "tools",
  info: "Get live football matches and streaming servers",
  router
};
