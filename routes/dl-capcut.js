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
  Origin: "https://3bic.com",
  Referer: "https://3bic.com/id",
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

// 🔽 FUNCTION: CapCut Scraper from 3bic.com
const Ponta3Bic = async (url) => {
  const response = await axios.post(
    "https://3bic.com/api/download",
    { url },
    { headers: PROFESSIONAL_HEADERS, timeout: 30000 }
  );

  const res = response.data;
  if (res.code !== 200) throw new Error("Échec du chargement des données.");

  return {
    title: res.title,
    video: "https://3bic.com" + res.originalVideoUrl,
    thumbnail: res.coverUrl,
    author: res.authorName,
  };
};

// 🎯 Endpoint: GET /api/capcut/download?url=<capcut_link>
router.get("/download", async (req, res) => {
  try {
    // ✅ Validation
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({
        status: false,
        error: "📌 Veuillez envoyer un lien CapCut",
        example: `${global.t || "http://localhost:3000"}/api/capcut/download?url=https://www.capcut.net/sharevideo?template_id=7446548553788411141`,
      });
    }

    // 🔗 Basic URL validation
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        status: false,
        error: "❌ Le lien n'est pas valide",
      });
    }

    // ⚙️ Execute Scraper
    const data = await Ponta3Bic(url);
    if (!data) {
      return res.status(500).json({
        status: false,
        error: "❌ Échec de la récupération de la vidéo. Vérifiez le lien ou réessayez plus tard.",
      });
    }

    // ✅ Success Response
    return res.json({
      status: true,
      ...data,
    });
  } catch (err) {
    console.error("❌ Error scraping:", err.message);
    return res.status(500).json({
      status: false,
      error: err.response?.data?.message || err.message || "Erreur inattendue",
    });
  }
});

// 📤 Export
module.exports = {
  path: "/api/capcut",
  name: "CapCut Video Downloader",
  type: "get",
  url: `${global.t || "http://localhost:3000"}/api/capcut/download?url=https://www.capcut.net/sharevideo?template_id=7446548553788411141`,
  logo: "https://upload.wikimedia.org/wikipedia/commons/e/e0/CapCut_logo.svg",
  category: "download",
  info: "Télécharge des vidéos CapCut via un lien de partage en haute qualité",
  router,
};

