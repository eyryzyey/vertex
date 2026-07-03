const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

async function shortenUrl(url) {
  const apiUrl = `https://api.orx.ma/tl/shorturl?url=${encodeURIComponent(url)}`;

  const headers = {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "accept-encoding": "gzip, deflate, br",
    "referer": "https://api.orx.ma/",
    "origin": "https://api.orx.ma"
  };

  const { data } = await axios.get(apiUrl, { headers });

  if (!data.status || !data.result) {
    throw new Error("Failed to shorten URL");
  }

  return {
    original: data.original,
    isGd: data.result["is.gd"],
    tinyurl: data.result.tinyurl
  };
}

router.get("/shorten", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== "string" || url.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Missing or invalid parameter: 'url' is required",
        example: `${global.t || "http://localhost:3000"}/api/shorturl/shorten?url=https://github.com/nodejs/node`
      });
    }

    const urlRegex = /^(https?:\/\/)/;
    if (!urlRegex.test(url)) {
      return res.status(400).json({
        status: false,
        error: "Invalid URL format. URL must start with http:// or https://"
      });
    }

    const result = await shortenUrl(url.trim());

    return res.status(200).json({
      status: true,
      original: result.original,
      shortUrls: {
        isGd: result.isGd,
        tinyurl: result.tinyurl
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Failed to shorten URL"
    });
  }
});

module.exports = {
  path: "/api/shorturl",
  name: "URL Shortener",
  type: "get",
  url: `${global.t || "http://localhost:3000"}/api/shorturl/shorten?url=https://github.com/nodejs/node`,
  logo: "https://cdn-icons-png.flaticon.com/512/9294/9294929.png",
  category: "tools",
  info: "Shorten URLs using is.gd and tinyurl services",
  router
};

