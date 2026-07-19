const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

const API = "http://engez.a7a.online/api/v1";

class SpotifySearch {
  constructor() {
    this.headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      "Connection": "keep-alive",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache"
    };
  }

  async search(query) {
    try {
      const { data } = await axios.get(`${API}/search/spotify`, {
        params: { q: query },
        timeout: 30000,
        headers: this.headers
      });

      if (!data.success) {
        throw new Error(data.error || data.message || "Search failed");
      }

      const results = data?.response?.results;
      if (!results || !Array.isArray(results) || results.length === 0) {
        throw new Error("No results found for your query");
      }

      return {
        status: true,
        query: query,
        totalResults: results.length,
        results: results.slice(0, 10).map((item, index) => ({
          index: index + 1,
          name: item.name || "Unknown",
          artist: item.artist || "Unknown",
          album: item.album || null,
          duration: item.duration || "0:00",
          url: item.url || "",
          cover: item.cover || null,
          id: item.id || null
        }))
      };

    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.error || error.response.data?.message || error.message;
        throw new Error(`Search API error (${status}): ${message}`);
      } else if (error.request) {
        throw new Error("Search API did not respond");
      } else {
        throw new Error(error.message || "Unknown search error");
      }
    }
  }

  async download(url) {
    try {
      const { data } = await axios.get(`${API}/download/spotify`, {
        params: { url: url },
        timeout: 60000,
        headers: this.headers
      });

      if (!data.success) {
        throw new Error(data.error || data.message || "Download failed");
      }

      const info = data?.response;
      if (!info || !info.downloadUrl) {
        throw new Error("No download URL found in response");
      }

      return {
        status: true,
        title: info.title || "Unknown",
        author: info.author || "Unknown",
        album: info.album || null,
        duration: info.duration || "0:00",
        cover: info.cover || null,
        downloadUrl: info.downloadUrl,
        fileSize: info.fileSize || null,
        format: info.format || "mp3"
      };

    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.error || error.response.data?.message || error.message;
        throw new Error(`Download API error (${status}): ${message}`);
      } else if (error.request) {
        throw new Error("Download API did not respond");
      } else {
        throw new Error(error.message || "Unknown download error");
      }
    }
  }

  validateSpotifyUrl(url) {
    const spotifyRegex = /^https?:\/\/(open\.spotify\.com|spotify\.com)\/(track|album|playlist|episode)\/[a-zA-Z0-9]+/i;
    return spotifyRegex.test(url);
  }
}

// Endpoint GET /search
router.get("/search", async (req, res) => {
  try {
    const { q, query } = req.query;
    const searchQuery = q || query;

    // Validation du paramètre de recherche
    if (!searchQuery || searchQuery.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Parameter 'q' or 'query' is required",
        example: `${global.t || "http://localhost:3000"}/api/spotify/search?q=7liwa`,
        usage: "Search for songs on Spotify",
        optionalParams: {
          q: "Search query (song name, artist, album)"
        }
      });
    }

    // Validation de la longueur
    if (searchQuery.length > 200) {
      return res.status(400).json({
        status: false,
        error: "Search query too long (max 200 characters)"
      });
    }

    const spotify = new SpotifySearch();
    const result = await spotify.search(searchQuery.trim());

    return res.status(200).json(result);

  } catch (error) {
    console.error("Spotify Search API Error:", error.message);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
      message: "Failed to search Spotify"
    });
  }
});

// Endpoint POST /search (pour les requêtes complexes)
router.post("/search", async (req, res) => {
  try {
    const { q, query } = req.body;
    const searchQuery = q || query;

    if (!searchQuery || searchQuery.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Parameter 'q' or 'query' is required in request body",
        example: {
          q: "7liwa"
        }
      });
    }

    if (searchQuery.length > 200) {
      return res.status(400).json({
        status: false,
        error: "Search query too long (max 200 characters)"
      });
    }

    const spotify = new SpotifySearch();
    const result = await spotify.search(searchQuery.trim());

    return res.status(200).json(result);

  } catch (error) {
    console.error("Spotify Search API Error:", error.message);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error"
    });
  }
});

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
        usage: "Download a Spotify track by URL",
        supportedFormats: [
          "https://open.spotify.com/track/...",
          "https://spotify.com/track/..."
        ]
      });
    }

    const trimmedUrl = url.trim();

    // Validation du format URL Spotify
    const spotify = new SpotifySearch();
    if (!spotify.validateSpotifyUrl(trimmedUrl)) {
      return res.status(400).json({
        status: false,
        error: "Invalid Spotify URL format",
        example: "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC",
        supportedTypes: ["track", "album", "playlist", "episode"]
      });
    }

    const result = await spotify.download(trimmedUrl);

    return res.status(200).json(result);

  } catch (error) {
    console.error("Spotify Download API Error:", error.message);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
      message: "Failed to download Spotify track"
    });
  }
});

// Endpoint POST /download (pour les URLs longues)
router.post("/download", async (req, res) => {
  try {
    const { url } = req.body;

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

    const spotify = new SpotifySearch();
    if (!spotify.validateSpotifyUrl(trimmedUrl)) {
      return res.status(400).json({
        status: false,
        error: "Invalid Spotify URL format",
        example: "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC"
      });
    }

    const result = await spotify.download(trimmedUrl);

    return res.status(200).json(result);

  } catch (error) {
    console.error("Spotify Download API Error:", error.message);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error"
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
        example: `${global.t || "http://localhost:3000"}/api/spotify/info?url=https://open.spotify.com/track/xxxxxx`
      });
    }

    const trimmedUrl = url.trim();

    const spotify = new SpotifySearch();
    if (!spotify.validateSpotifyUrl(trimmedUrl)) {
      return res.status(400).json({
        status: false,
        error: "Invalid Spotify URL format"
      });
    }

    const result = await spotify.download(trimmedUrl);

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
  name: "Spotify Search ",
  type: "get",
  url: `${global.t || "http://localhost:3000"}/api/spotify/search?q=7liwa`,
  logo: "https://open.spotify.com/favicon.ico",
  category: "search",
  info: "Search Spotify tracks with metadata including title, artist, album, cover and duration",
  router
};
