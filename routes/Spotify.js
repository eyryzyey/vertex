const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

const API = "https://engez.a7a.online/api/v1/download/spotify";
const TIMEOUT = 120000;

async function downloadSpotify(url) {
  const { data } = await axios.get(API, {
    params: { url },
    timeout: TIMEOUT,
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      "accept-encoding": "gzip, deflate, br",
      "referer": "https://engez.a7a.online/",
      "origin": "https://engez.a7a.online"
    }
  });

  if (!data?.success || !data?.response?.downloadUrl) {
    throw new Error(data?.error || data?.response?.error || "Failed to download song");
  }

  return data.response;
}

router.get("/download", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== "string" || url.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Missing or invalid parameter: 'url' is required",
        example: `${global.t || "http://localhost:3000"}/api/spotify/download?url=https://open.spotify.com/track/xxxx`
      });
    }

    if (!url.includes("open.spotify.com") && !url.includes("spotify.com")) {
      return res.status(400).json({
        status: false,
        error: "Invalid Spotify URL"
      });
    }

    const result = await downloadSpotify(url.trim());

    return res.status(200).json({
      status: true,
      title: result.title,
      author: result.author,
      album: result.album,
      duration: result.duration,
      downloadUrl: result.downloadUrl
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Failed to download from Spotify"
    });
  }
});

module.exports = {
  path: "/api/spotify",
  name: "Spotify Downloader",
  type: "get",
  url: `${global.t || "http://localhost:3000"}/api/spotify/download?url=https://open.spotify.com/track/11dFghVXANMlKmJXsNCbNl
`,
  logo: "https://cdn-icons-png.flaticon.com/512/174/174872.png",
  category: "download",
  info: "Download songs from Spotify",
  router
};
