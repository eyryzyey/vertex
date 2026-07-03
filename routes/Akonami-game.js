const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

async function getAkonamiGame(id) {
  const url = `https://api.orx.ma/dl/akonami?id=${encodeURIComponent(id)}`;

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
    throw new Error("Game not found");
  }

  return {
    id: data.result.id,
    title: data.result.title,
    image: data.result.image,
    android: data.result.android,
    category: data.result.category,
    rating: data.result.rating,
    votes: data.result.votes,
    popularity: data.result.popularity,
    downloads: (data.result.downloads || []).map(dl => ({
      name: dl.name,
      size: dl.size,
      url: dl.url
    }))
  };
}

router.get("/download", async (req, res) => {
  try {
    const { id } = req.query;

    if (!id || typeof id !== "string" || id.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Missing or invalid parameter: 'id' is required",
        example: `${global.t || "http://localhost:3000"}/api/akonami/download?id=gta-san-andreas-ppsspp`
      });
    }

    const result = await getAkonamiGame(id.trim());

    return res.status(200).json({
      status: true,
      id: result.id,
      title: result.title,
      image: result.image,
      android: result.android,
      category: result.category,
      rating: result.rating,
      votes: result.votes,
      popularity: result.popularity,
      totalDownloads: result.downloads.length,
      downloads: result.downloads
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Failed to fetch game from Akonami"
    });
  }
});

module.exports = {
  path: "/api/akonami",
  name: "Akonami Game Downloader",
  type: "get",
  url: `${global.t || "http://localhost:3000"}/api/akonami/download?id=gta-san-andreas-ppsspp`,
  logo: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png",
  category: "download",
  info: "Download PSP and Android games from Akonami",
  router
};

