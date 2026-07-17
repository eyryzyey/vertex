const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

const API_BASE = "https://engez.a7a.online/api/v1/download/all";
const CACHE_TTL_MS = 3 * 60 * 1000;

const mediaCache = new Map();

function isYouTubeUrl(url) {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|m\.youtube\.com)\//i.test(url);
}

function describeMedia(media, index) {
  const isVideo = media.type === "video";
  const icon = isVideo ? "🎬" : "🎵";
  const typeLabel = isVideo ? "فيديو" : "صوت";
  const quality = media.quality || "غير معروف";
  
  return {
    index: index,
    type: media.type,
    icon: icon,
    typeLabel: typeLabel,
    quality: quality,
    header: `${typeLabel} #${index + 1}`,
    title: `${icon} ${quality}`,
    description: `تحميل ${typeLabel} بجودة ${quality}`
  };
}

async function fetchMediaData(url) {
  // Vérifier le cache
  const cached = mediaCache.get(url);
  if (cached) {
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      console.log("[Cache] Returning cached result for:", url);
      return cached;
    }
    mediaCache.delete(url);
  }

  const apiUrl = `${API_BASE}?url=${encodeURIComponent(url)}`;
  
  const { data } = await axios.get(apiUrl, {
    timeout: 30000,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      "Connection": "keep-alive",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache"
    }
  });

  if (!data || data.success !== true) {
    throw new Error(data?.error || data?.message || "لم يتم العثور على نتائج لهذا الرابط");
  }

  const medias = data?.response?.medias;
  if (!Array.isArray(medias) || medias.length === 0) {
    throw new Error("لا توجد ميديا متاحة لهذا الرابط");
  }

  const result = {
    title: data.response.title || "بدون عنوان",
    source: data.response.source || "غير معروف",
    thumbnail: data.response.thumbnail || null,
    duration: data.response.duration || null,
    medias: medias.map((media, index) => ({
      index: index,
      type: media.type || "unknown",
      quality: media.quality || "غير معروف",
      url: media.url || "",
      size: media.size || null,
      format: media.format || null,
      description: describeMedia(media, index)
    })),
    totalMedias: medias.length,
    timestamp: Date.now()
  };

  // Sauvegarder dans le cache
  mediaCache.set(url, result);
  return result;
}

async function downloadMediaBuffer(mediaUrl) {
  const { data } = await axios.get(mediaUrl, {
    responseType: "arraybuffer",
    timeout: 120000,
    maxRedirects: 5,
    headers: {
      "User-Agent": "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Connection": "keep-alive",
      "Referer": "https://engez.a7a.online/"
    }
  });

  return Buffer.from(data);
}

class UniversalDownloader {
  constructor() {
    this.cache = mediaCache;
  }

  async getInfo(url) {
    if (isYouTubeUrl(url)) {
      throw new Error("روابط يوتيوب غير مدعومة");
    }

    const data = await fetchMediaData(url);
    
    return {
      status: true,
      title: data.title,
      source: data.source,
      thumbnail: data.thumbnail,
      duration: data.duration,
      totalMedias: data.totalMedias,
      medias: data.medias
    };
  }

  async download(url, index = 0) {
    if (isYouTubeUrl(url)) {
      throw new Error("روابط يوتيوب غير مدعومة");
    }

    const data = await fetchMediaData(url);

    if (index < 0 || index >= data.medias.length) {
      throw new Error(`الاختيار غير موجود. المتاح: 0 إلى ${data.medias.length - 1}`);
    }

    const media = data.medias[index];
    const buffer = await downloadMediaBuffer(media.url);

    return {
      status: true,
      title: data.title,
      source: data.source,
      media: {
        index: media.index,
        type: media.type,
        quality: media.quality,
        url: media.url,
        size: media.size,
        format: media.format,
        bufferSize: buffer.length
      },
      buffer: buffer.toString("base64")
    };
  }

  async downloadDirect(url, index = 0) {
    if (isYouTubeUrl(url)) {
      throw new Error("روابط يوتيوب غير مدعومة");
    }

    const data = await fetchMediaData(url);

    if (index < 0 || index >= data.medias.length) {
      throw new Error(`الاختيار غير موجود. المتاح: 0 إلى ${data.medias.length - 1}`);
    }

    const media = data.medias[index];

    return {
      status: true,
      title: data.title,
      source: data.source,
      media: {
        index: media.index,
        type: media.type,
        quality: media.quality,
        url: media.url,
        size: media.size,
        format: media.format
      },
      downloadUrl: media.url
    };
  }
}

// Nettoyage périodique du cache
setInterval(() => {
  const now = Date.now();
  for (const [url, data] of mediaCache.entries()) {
    if (now - data.timestamp > CACHE_TTL_MS) {
      mediaCache.delete(url);
    }
  }
}, CACHE_TTL_MS);

// Endpoint GET /info - Obtenir les informations sans télécharger
router.get("/info", async (req, res) => {
  try {
    const { url } = req.query;

    // Validation du paramètre URL
    if (!url || url.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Parameter 'url' is required",
        example: `${global.t || "http://localhost:3000"}/api/downloader/info?url=https://www.instagram.com/reel/DQSMSB3gulY/?igsh=bTZxdXFyam1iZ3hm`,
        usage: "Provide a media URL to get download information",
        supportedSources: ["Facebook", "Instagram", "TikTok", "Twitter/X", "Spotify", "SoundCloud", "etc."],
        note: "YouTube URLs are NOT supported"
      });
    }

    const trimmedUrl = url.trim();

    // Validation du format URL
    try {
      new URL(trimmedUrl);
    } catch {
      return res.status(400).json({
        status: false,
        error: "Invalid URL format",
        example: "https://www.facebook.com/watch?v=xxxxx"
      });
    }

    const downloader = new UniversalDownloader();
    const result = await downloader.getInfo(trimmedUrl);

    return res.status(200).json(result);

  } catch (error) {
    console.error("Downloader Info API Error:", error.message);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
      message: "Failed to fetch media information"
    });
  }
});

// Endpoint GET /download - Télécharger un média (retourne base64)
router.get("/download", async (req, res) => {
  try {
    const { url, index = 0 } = req.query;

    // Validation du paramètre URL
    if (!url || url.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Parameter 'url' is required",
        example: `${global.t || "http://localhost:3000"}/api/downloader/download?url=https://example.com/video&index=0`,
        usage: "Provide a media URL and optional quality index to download",
        note: "Returns base64 encoded file. Use /direct for download URL only."
      });
    }

    const trimmedUrl = url.trim();
    const mediaIndex = parseInt(index);

    if (isNaN(mediaIndex) || mediaIndex < 0) {
      return res.status(400).json({
        status: false,
        error: "Invalid index parameter (must be a positive number)"
      });
    }

    // Validation du format URL
    try {
      new URL(trimmedUrl);
    } catch {
      return res.status(400).json({
        status: false,
        error: "Invalid URL format"
      });
    }

    const downloader = new UniversalDownloader();
    const result = await downloader.download(trimmedUrl, mediaIndex);

    return res.status(200).json(result);

  } catch (error) {
    console.error("Downloader Download API Error:", error.message);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
      message: "Failed to download media"
    });
  }
});

// Endpoint GET /direct - Obtenir l'URL de téléchargement directe
router.get("/direct", async (req, res) => {
  try {
    const { url, index = 0 } = req.query;

    // Validation du paramètre URL
    if (!url || url.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Parameter 'url' is required",
        example: `${global.t || "http://localhost:3000"}/api/downloader/direct?url=https://www.instagram.com/reel/DQSMSB3gulY/?igsh=bTZxdXFyam1iZ3hm`,
        usage: "Get direct download URL without downloading the file"
      });
    }

    const trimmedUrl = url.trim();
    const mediaIndex = parseInt(index);

    if (isNaN(mediaIndex) || mediaIndex < 0) {
      return res.status(400).json({
        status: false,
        error: "Invalid index parameter (must be a positive number)"
      });
    }

    // Validation du format URL
    try {
      new URL(trimmedUrl);
    } catch {
      return res.status(400).json({
        status: false,
        error: "Invalid URL format"
      });
    }

    const downloader = new UniversalDownloader();
    const result = await downloader.downloadDirect(trimmedUrl, mediaIndex);

    return res.status(200).json(result);

  } catch (error) {
    console.error("Downloader Direct API Error:", error.message);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
      message: "Failed to get direct download URL"
    });
  }
});

// Endpoint POST /download (pour les URLs longues)
router.post("/download", async (req, res) => {
  try {
    const { url, index = 0 } = req.body;

    // Validation du paramètre URL
    if (!url || url.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Parameter 'url' is required in request body",
        example: {
          url: "https://example.com/video",
          index: 0
        }
      });
    }

    const trimmedUrl = url.trim();
    const mediaIndex = parseInt(index);

    if (isNaN(mediaIndex) || mediaIndex < 0) {
      return res.status(400).json({
        status: false,
        error: "Invalid index parameter"
      });
    }

    const downloader = new UniversalDownloader();
    const result = await downloader.download(trimmedUrl, mediaIndex);

    return res.status(200).json(result);

  } catch (error) {
    console.error("Downloader POST API Error:", error.message);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error"
    });
  }
});

// Endpoint GET /cache - Voir le statut du cache
router.get("/cache", async (req, res) => {
  const cacheInfo = [];
  const now = Date.now();
  
  for (const [url, data] of mediaCache.entries()) {
    cacheInfo.push({
      url: url,
      title: data.title,
      source: data.source,
      totalMedias: data.totalMedias,
      age: Math.floor((now - data.timestamp) / 1000) + "s",
      expiresIn: Math.floor((CACHE_TTL_MS - (now - data.timestamp)) / 1000) + "s"
    });
  }

  return res.status(200).json({
    status: true,
    cacheSize: mediaCache.size,
    cacheTtl: CACHE_TTL_MS / 1000 + "s",
    items: cacheInfo
  });
});

// Endpoint DELETE /cache - Vider le cache
router.delete("/cache", async (req, res) => {
  const size = mediaCache.size;
  mediaCache.clear();
  
  return res.status(200).json({
    status: true,
    message: "Cache cleared successfully",
    clearedItems: size
  });
});

module.exports = {
  path: "/api/downloader",
  name: "Universal Media Downloader",
  type: "get",
  url: `${global.t || "http://localhost:3000"}/api/downloader/info?url=https://www.instagram.com/reel/DQSMSB3gulY/?igsh=bTZxdXFyam1iZ3hm`,
  logo: "https://engez.a7a.online/favicon.ico",
  category: "download",
  info: "Universal media downloader supporting Facebook, Instagram, TikTok, Twitter, Spotify and more with quality selection and caching",
  router
};

