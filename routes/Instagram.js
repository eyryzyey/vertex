const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

async function downloadInstagram(url) {
  const apiUrl = `https://tanjirodev.online/api/download/snap?url=${encodeURIComponent(url)}`;

  const headers = {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "accept-encoding": "gzip, deflate, br",
    "referer": "https://tanjirodev.online/",
    "origin": "https://tanjirodev.online"
  };

  const { data } = await axios.get(apiUrl, { headers });

  if (data.status !== "success" || !data.results || data.results.length === 0) {
    throw new Error("Failed to download media");
  }

  return data.results.map(item => ({
    quality: item.quality,
    url: item.url
  }));
}

router.get("/download", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== "string" || url.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Missing or invalid parameter: 'url' is required",
        example: `${global.t || "http://localhost:3000"}/api/snap/download?url=https://www.instagram.com/reel/DaTQs4Vg6S9/?igsh=MTc0amduajN6cnQ3cg==`
      });
    }

    const instagramRegex = /^(https?:\/\/)?(www\.)?(instagram\.com)\/.+/;
    if (!instagramRegex.test(url)) {
      return res.status(400).json({
        status: false,
        error: "Invalid Instagram URL"
      });
    }

    const results = await downloadInstagram(url.trim());

    return res.status(200).json({
      status: true,
      total: results.length,
      results: results
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Failed to download from Instagram"
    });
  }
});

module.exports = {
  path: "/api/snap",
  name: "Instagram video Downloader",
  type: "get",
  url: `${global.t || "http://localhost:3000"}/api/snap/download?url=https://www.instagram.com/reel/xxxxx`,
  logo: "https://cdn-icons-png.flaticon.com/512/2111/2111463.png",
  category: "download",
  info: "Download Instagram reels and videos via SnapTube",
  router
};

