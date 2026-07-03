const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

async function downloadYouTubeVideo(videoUrl, quality = "360") {
  const url = `https://api.orx.ma/dl/ytv?url=${encodeURIComponent(videoUrl)}&quality=${quality}`;

  const headers = {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "accept-encoding": "gzip, deflate, br",
    "referer": "https://api.orx.ma/",
    "origin": "https://api.orx.ma"
  };

  const { data } = await axios.get(url, { headers });

  if (!data.status || !data.url) {
    throw new Error("Failed to download video");
  }

  return {
    quality: data.quality,
    filename: data.filename,
    downloadUrl: data.url,
    title: data.metadata.title,
    videoId: data.metadata.videoId,
    thumbnail: data.metadata.thumbnail
  };
}

router.get("/download", async (req, res) => {
  try {
    const { url, quality = "360" } = req.query;

    if (!url || typeof url !== "string" || url.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Missing or invalid parameter: 'url' is required",
        example: `${global.t || "http://localhost:3000"}/api/ytv/download?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&quality=360`
      });
    }

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(url)) {
      return res.status(400).json({
        status: false,
        error: "Invalid YouTube URL"
      });
    }

    const result = await downloadYouTubeVideo(url.trim(), quality);

    return res.status(200).json({
      status: true,
      quality: result.quality,
      filename: result.filename,
      downloadUrl: result.downloadUrl,
      title: result.title,
      videoId: result.videoId,
      thumbnail: result.thumbnail
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Failed to download YouTube video"
    });
  }
});

module.exports = {
  path: "/api/ytv",
  name: "YouTube Video Downloader",
  type: "get",
  url: `${global.t || "http://localhost:3000"}/api/ytv/download?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&quality=360`,
  logo: "https://cdn-icons-png.flaticon.com/512/1384/1384060.png",
  category: "download",
  info: "Download YouTube videos in various qualities",
  router
};

