// 📦 Import Libraries
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

// 🔧 Create Router
const router = express.Router();

// 🌐 Professional Headers
const PROFESSIONAL_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json, text/plain, */*",
  "User-Agent":
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

const FEED_URL = "https://www.apple.com/newsroom/newsroom.everydayfeed.json";

// 🔽 FUNCTION: Fetch & normalize Apple Newsroom feed
const fetchAppleNews = async () => {
  const { data } = await axios.get(FEED_URL, {
    headers: PROFESSIONAL_HEADERS,
    timeout: 30000,
  });

  const tiles = data?.results?.tiles || [];

  return tiles.map((t) => ({
    category: t.category || t.eyebrow || "NEWS",
    headline: t.headline || "",
    date: t.time || "",
    timestamp: t.ts || "",
    url: t.metadata?.url ? `https://www.apple.com${t.metadata.url}` : "",
    image: t.image?.metadata?.srcs?.large
      ? `https://www.apple.com${t.image.metadata.srcs.large}`
      : "",
  }));
};

// 🎯 Endpoint 1: GET /api/applenews/news?q=<keyword>&limit=15
router.get("/news", async (req, res) => {
  try {
    const { q, limit } = req.query;
    const max = Math.min(Math.max(parseInt(limit) || 15, 1), 50);

    // ⚙️ Fetch feed
    let news = await fetchAppleNews();
    if (!news.length) {
      return res.status(404).json({
        status: false,
        error: "🔍 Aucune actualité disponible pour le moment. Réessayez plus tard.",
      });
    }

    // 🔍 Optional keyword filter
    if (q && q.trim()) {
      const keyword = q.trim().toLowerCase();
      news = news.filter((n) => n.headline.toLowerCase().includes(keyword));
      if (!news.length) {
        return res.status(404).json({
          status: false,
          error: `🔍 Aucune actualité trouvée pour "${q}"`,
        });
      }
    }

    // ✅ Success Response (Array)
    return res.json({
      status: true,
      query: q || null,
      count: news.length,
      returned: Math.min(news.length, max),
      results: news.slice(0, max),
    });
  } catch (err) {
    console.error("❌ Error fetching Apple News:", err.message);
    return res.status(500).json({
      status: false,
      error: err.response?.status
        ? `Erreur Apple HTTP ${err.response.status}`
        : err.message || "Erreur inattendue",
    });
  }
});

// 🎯 Endpoint 2: GET /api/applenews/item?index=<n>&q=<keyword>
router.get("/item", async (req, res) => {
  try {
    // ✅ Validation
    const { index, q } = req.query;
    if (index === undefined || index === "") {
      return res.status(400).json({
        status: false,
        error: "❌ Paramètre manquant : index (numéro de l'article, à partir de 0)",
        example: `${global.t || "http://localhost:3000"}/api/applenews/item?index=0`,
      });
    }

    const idx = parseInt(index);
    if (isNaN(idx) || idx < 0) {
      return res.status(400).json({
        status: false,
        error: "❌ Index invalide (doit être un entier ≥ 0)",
      });
    }

    // ⚙️ Fetch feed (with optional keyword filter)
    let news = await fetchAppleNews();
    if (q && q.trim()) {
      const keyword = q.trim().toLowerCase();
      news = news.filter((n) => n.headline.toLowerCase().includes(keyword));
    }

    const item = news[idx];
    if (!item) {
      return res.status(404).json({
        status: false,
        error: `⚠️ Aucun article à l'index ${idx}${q ? ` pour "${q}"` : ""}. Total: ${news.length} articles.`,
      });
    }

    // ✅ Success Response
    return res.json({
      status: true,
      index: idx,
      ...item,
    });
  } catch (err) {
    console.error("❌ Error fetching Apple News item:", err.message);
    return res.status(500).json({
      status: false,
      error: err.response?.status
        ? `Erreur Apple HTTP ${err.response.status}`
        : err.message || "Erreur inattendue",
    });
  }
});

// 📤 Export
module.exports = {
  path: "/api/applenews",
  name: "Apple Newsroom Feed",
  type: "get",
  url: `${global.t || "http://localhost:3000"}/api/applenews/news?limit=15`,
  logo: "https://www.apple.com/newsroom/images/apple-logo.png",
  category: "news",
  info: "Dernières actualités officielles d'Apple (Newsroom) avec recherche par mot-clé et images",
  router,
};
