const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

const API = "https://engez.a7a.online/api/v1/download/spotify";
const TIMEOUT = 120000;

class SpotifyDownloader {
  constructor() {
    this.headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      "Connection": "keep-alive",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      "Referer": "https://engez.a7a.online/",
      "Origin": "https://engez.a7a.online"
    };
  }

  async download(url) {
    try {
      const { data } = await axios.get(API, {
        params: { url },
        timeout: TIMEOUT,
        headers: this.headers,
        responseType: "json"
      });

      if (!data?.success || !data?.response?.downloadUrl) {
        throw new Error(data?.error || data?.response?.error || "Failed to download song");
      }

      return {
        status: true,
        title: data.response.title,
        author: data.response.author,
        album: data.response.album,
        duration: data.response.duration,
        downloadUrl: data.response.downloadUrl,
        cover: data.response.cover || null,
        metadata: data.response
      };

    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.error || error.response.data?.message || error.message;
        
        if (status === 404) {
          throw new Error("Song not found on Spotify");
        } else if (status === 429) {
          throw new Error("Rate limit exceeded, please try again later");
        } else if (status >= 500) {
          throw new Error(`External API server error (${status}): ${message}`);
        } else {
          throw new Error(`External API error (${status}): ${message}`);
        }
      } else if (error.request) {
        throw new Error("No response received from download server");
      } else {
        throw new Error(error.message || "Unknown error occurred");
      }
    }
  }

  validateUrl(url) {
    const spotifyRegex = /^https?:\/\/(open\.spotify\.com|spotify\.com)\/(track|album|playlist|episode)\/[a-zA-Z0-9]+/i;
    return spotifyRegex.test(url);
  }

  formatDuration(ms) {
    if (!ms) return "Unknown";
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, "0")}`;
  }
}

// Endpoint GET /download
router.get("/download", async (req, res) => {
  try {
    const { url } = req.query;

    // Validation du paramètre URL
    if (!url || url.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Parameter 'url' is required",
        example: `${global.t || "http://localhost:3000"}/api/spotify/download?url=https://open.spotify.com/track/xxxxxx`,
        usage: "Provide a Spotify track URL to download",
        supportedFormats: [
          "https://open.spotify.com/track/...",
          "https://spotify.com/track/..."
        ]
      });
    }

    const trimmedUrl = url.trim();

    // Validation du format URL Spotify
    const downloader = new SpotifyDownloader();
    if (!downloader.validateUrl(trimmedUrl)) {
      return res.status(400).json({
        status: false,
        error: "Invalid Spotify URL format",
        example: "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC",
        supportedTypes: ["track", "album", "playlist", "episode"]
      });
    }

    const result = await downloader.download(trimmedUrl);

    return res.status(200).json({
      status: true,
      data: result
    });

  } catch (error) {
    console.error("Spotify API Error:", error.message);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
      message: "Failed to download Spotify track"
    });
  }
});

// Endpoint POST /download (pour les URLs très longues)
router.post("/download", async (req, res) => {
  try {
    const { url } = req.body;

    // Validation du paramètre URL
    if (!url || url.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Parameter 'url' is required in request body",
        example: {
          url: "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC"
        }
      });
    }

    const trimmedUrl = url.trim();

    // Validation du format URL Spotify
    const downloader = new SpotifyDownloader();
    if (!downloader.validateUrl(trimmedUrl)) {
      return res.status(400).json({
        status: false,
        error: "Invalid Spotify URL format",
        example: "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC"
      });
    }

    const result = await downloader.download(trimmedUrl);

    return res.status(200).json({
      status: true,
      data: result
    });

  } catch (error) {
    console.error("Spotify API Error:", error.message);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
      message: "Failed to download Spotify track"
    });
  }
});

// Endpoint GET /info (obtenir les infos sans télécharger)
router.get("/info", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || url.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Parameter 'url' is required",
        example: `${global.t || "http://localhost:3000"}/api/spotify/info?url=https://open.spotify.com/track/11dFghVXANMlKmJXsNCbNl`
      });
    }

    const trimmedUrl = url.trim();
    const downloader = new SpotifyDownloader();

    if (!downloader.validateUrl(trimmedUrl)) {
      return res.status(400).json({
        status: false,
        error: "Invalid Spotify URL format"
      });
    }

    const result = await downloader.download(trimmedUrl);

    return res.status(200).json({
      status: true,
      data: {
        title: result.title,
        author: result.author,
        album: result.album,
        duration: result.duration,
        cover: result.cover,
        downloadUrl: result.downloadUrl
      }
    });

  } catch (error) {
    console.error("Spotify Info API Error:", error.message);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error"
    });
  }
});

module.exports = {
  path: "/api/spotify",
  name: "Spotify Downloader",
  type: "get",
  url: `${global.t || "http://localhost:3000"}/api/spotify/download?url=https://open.spotify.com/track/11dFghVXANMlKmJXsNCbNl

`,
  logo: "https://open.spotify.com/favicon.ico",
  category: "download",
  info: "Download Spotify tracks as MP3 with metadata (title, artist, album, cover)",
  router
};
