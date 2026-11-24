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

const mb = (bytes) => (bytes ? (bytes / 1048576).toFixed(1) + "MB" : "؟");
const pureLink = (pkg) => `https://d.apkpure.com/b/APK/${pkg}?version=latest`;

// 🔽 FUNCTION: Search apps via Aptoide API (JSON, no key)
const aptoideSearch = async (query, limit = 8) => {
  const url = `https://ws75.aptoide.com/api/7.20190205/apps/search?query=${encodeURIComponent(query)}&limit=${limit}`;
  const { data } = await axios.get(url, {
    headers: PROFESSIONAL_HEADERS,
    timeout: 30000,
  });
  const list = data?.datalist?.list || [];
  return list
    .map((a) => ({
      name: a.name,
      pkg: a.package,
      dev: a.developer?.name || "",
      size: a.file?.filesize || a.size || 0,
      sizeHuman: mb(a.file?.filesize || a.size || 0),
      version: a.file?.vername || "",
      icon: a.icon || "",
      url: a.file?.path || a.file?.path_alt || "",
    }))
    .filter((a) => a.pkg && a.url);
};

// 🔗 Helper: extract package id from input (Play Store link or direct id)
const extractPackage = (q) => {
  const linkMatch = q.match(/[?&]id=([\w.]+)/);
  if (linkMatch) return linkMatch[1];
  if (/^[a-zA-Z][\w]*(\.[\w]+)+$/.test(q)) return q;
  return "";
};

// 🎯 Endpoint 1: GET /api/apk/search?q=whatsapp
router.get("/search", async (req, res) => {
  try {
    // ✅ Validation
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({
        status: false,
        error: "❌ Paramètre manquant : q (nom de l'application)",
        example: `${global.t || "http://localhost:3000"}/api/apk/search?q=whatsapp`,
      });
    }

    // ⚙️ Execute Search
    const results = await aptoideSearch(q.trim(), 8);
    if (!results.length) {
      return res.status(404).json({
        status: false,
        error: `🔍 Aucune application trouvée pour "${q}". Vérifiez le nom ou essayez le package id.`,
      });
    }

    // ✅ Success Response (Array of results)
    return res.json({
      status: true,
      query: q.trim(),
      count: results.length,
      results,
    });
  } catch (err) {
    console.error("❌ Error searching:", err.message);
    return res.status(500).json({
      status: false,
      error: err.response?.status
        ? `Erreur Aptoide HTTP ${err.response.status}`
        : err.message || "Erreur inattendue",
    });
  }
});

// 🎯 Endpoint 2: GET /api/apk/download?q=<package_id | name | play store link>
router.get("/download", async (req, res) => {
  try {
    // ✅ Validation
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({
        status: false,
        error: "❌ Paramètre manquant : q (package id, nom ou lien Play Store)",
        example: `${global.t || "http://localhost:3000"}/api/apk/download?q=com.whatsapp`,
      });
    }

    // ⚙️ Resolve app
    const input = q.trim();
    const pkg = extractPackage(input);
    const results = await aptoideSearch(pkg || input, 8);

    if (!results.length) {
      return res.status(404).json({
        status: false,
        error: `🔍 Aucune application trouvée pour "${input}".`,
      });
    }

    const app = pkg
      ? results.find((r) => r.pkg === pkg) || results[0]
      : results[0];

    // ✅ Success Response
    return res.json({
      status: true,
      name: app.name,
      pkg: app.pkg,
      dev: app.dev,
      version: app.version,
      size: app.size,
      sizeHuman: app.sizeHuman,
      icon: app.icon,
      download: app.url,
      apkpure: pureLink(app.pkg),
      directFile: `${global.t || "http://localhost:3000"}/api/apk/file?pkg=${app.pkg}`,
    });
  } catch (err) {
    console.error("❌ Error resolving download:", err.message);
    return res.status(500).json({
      status: false,
      error: err.response?.status
        ? `Erreur Aptoide HTTP ${err.response.status}`
        : err.message || "Erreur inattendue",
    });
  }
});

// 🎯 Endpoint 3: GET /api/apk/file?pkg=com.whatsapp — proxy the APK as attachment
router.get("/file", async (req, res) => {
  try {
    // ✅ Validation
    const { pkg } = req.query;
    if (!pkg || !/^[a-zA-Z][\w]*(\.[\w]+)+$/.test(pkg)) {
      return res.status(400).json({
        status: false,
        error: "❌ Package id invalide (ex: com.whatsapp)",
      });
    }

    // ⚙️ Resolve direct URL (Aptoide → fallback APKPure)
    let downloadUrl = pureLink(pkg);
    let fileName = `${pkg}.apk`;
    try {
      const results = await aptoideSearch(pkg, 8);
      const app = results.find((r) => r.pkg === pkg) || results[0];
      if (app?.url) {
        downloadUrl = app.url;
        fileName = `${String(app.name).replace(/[^\p{L}\p{N} ]/gu, "").trim().replace(/\s+/g, "_") || pkg}.apk`;
      }
    } catch {
      // fallback stays on APKPure
    }

    // 📥 Stream the file to the client (no memory buffering)
    const upstream = await axios.get(downloadUrl, {
      headers: { "User-Agent": PROFESSIONAL_HEADERS["User-Agent"] },
      responseType: "stream",
      timeout: 120000,
      maxRedirects: 5,
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.android.package-archive"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );
    upstream.data.pipe(res);
  } catch (err) {
    console.error("❌ Error downloading file:", err.message);
    if (!res.headersSent) {
      return res.status(500).json({
        status: false,
        error: "❌ Échec du téléchargement depuis toutes les sources. Réessayez plus tard.",
      });
    }
  }
});

// 📤 Export
module.exports = {
  path: "/api/apk",
  name: "APK Downloader",
  type: "get",
  url: `${global.t || "http://localhost:3000"}/api/apk/search?q=whatsapp`,
  logo: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Android_robot.svg",
  category: "download",
  info: "Recherche et téléchargement d'applications Android (APK) via Aptoide et APKPure",
  router,
};
