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

const BASE = "https://intelligencehq.io";

// 🔑 API Key (configurable via global.hqApiKey or HQ_API_KEY env)
const getApiKey = () => global.hqApiKey || process.env.HQ_API_KEY || "";

// 🎯 Endpoint 1: GET /api/hq/catalog — free public catalog
router.get("/catalog", async (req, res) => {
  try {
    const { data } = await axios.get(`${BASE}/api/public/v1/catalog`, {
      headers: PROFESSIONAL_HEADERS,
      timeout: 30000,
    });

    if (!data || data.ok !== true) {
      return res.status(502).json({
        status: false,
        error: "Réponse invalide du catalogue Intelligence HQ",
      });
    }

    // ✅ Success Response
    return res.json({
      status: true,
      supportedSports: data.supported_sports || [],
      supportedFeatures: data.supported_features || [],
      docsUrl: data.docs_url || "",
      openapiUrl: data.openapi_url || "",
      pricingUrl: data.pricing_url || "",
      freePreviewUrl: data.free_preview_url || "",
      note: data.note || "",
    });
  } catch (err) {
    console.error("❌ Error fetching HQ catalog:", err.message);
    return res.status(500).json({
      status: false,
      error: err.response?.status
        ? `Erreur Intelligence HQ HTTP ${err.response.status}`
        : err.message || "Erreur inattendue",
    });
  }
});

// 🎯 Endpoint 2: GET /api/hq/data?sport=football&feature=predictions&league=nfl&limit=10
router.get("/data", async (req, res) => {
  try {
    // ✅ Validation
    const { sport, feature, league, limit } = req.query;
    if (!sport || !feature) {
      return res.status(400).json({
        status: false,
        error: "❌ Paramètres manquants : sport et feature sont obligatoires",
        example: `${global.t || "http://localhost:3000"}/api/hq/data?sport=football&feature=predictions&league=nfl&limit=10`,
      });
    }

    // 🔑 Auth check
    const apiKey = getApiKey();
    if (!apiKey) {
      return res.status(401).json({
        status: false,
        error: "🔑 Clé HQ API requise. Configurez global.hqApiKey ou HQ_API_KEY",
        pricing: "https://intelligencehq.io/white-label",
      });
    }

    // ⚙️ Build URL
    let url = `${BASE}/api/v1/${encodeURIComponent(sport)}/${encodeURIComponent(feature)}`;
    const qs = [];
    if (league) qs.push(`league=${encodeURIComponent(league)}`);
    if (limit) qs.push(`limit=${encodeURIComponent(limit)}`);
    if (qs.length) url += `?${qs.join("&")}`;

    // 📡 Fetch live data
    const { data } = await axios.get(url, {
      headers: {
        ...PROFESSIONAL_HEADERS,
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: 30000,
    });

    // ✅ Success Response
    return res.json({
      status: true,
      sport: data.sport || sport,
      feature: data.feature || feature,
      asOf: data.as_of || "",
      data: data.data ?? data,
    });
  } catch (err) {
    const status = err.response?.status;
    console.error("❌ Error fetching HQ data:", err.message);

    if (status === 401) {
      return res.status(401).json({
        status: false,
        error: "❌ Clé invalide, inactive ou expirée",
      });
    }
    if (status === 403) {
      return res.status(403).json({
        status: false,
        error: "❌ Sport ou fonctionnalité hors de votre abonnement",
      });
    }
    if (status === 429) {
      return res.status(429).json({
        status: false,
        error: "⛔ Limite mensuelle de requêtes atteinte",
      });
    }
    return res.status(status || 500).json({
      status: false,
      error: status
        ? `Erreur Intelligence HQ HTTP ${status}`
        : err.message || "Erreur inattendue",
    });
  }
});

// 📤 Export
module.exports = {
  path: "/api/hq",
  name: "Intelligence HQ Sports API",
  type: "get",
  url: `${global.t || "http://localhost:3000"}/api/hq/catalog`,
  logo: "https://intelligencehq.io/favicon.ico",
  category: "sports",
  info: "Catalogue gratuit et données sportives en direct (prédictions, scores, classements) via Intelligence HQ",
  router,
};
