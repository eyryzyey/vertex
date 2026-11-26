const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

const SOURCE_URL = "https://www.wadifa-info.com/api/v1/salaires?lang=fr";
const CACHE_TTL = 30 * 60 * 1000;
const SESSION_TTL = 10 * 60 * 1000;

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
  Referer: "https://www.wadifa-info.com/",
};

let cache = { data: null, at: 0 };
const sessions = new Map();

const normalize = (s = "") =>
  String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const cleanupSessions = () => {
  const now = Date.now();
  for (const [key, val] of sessions.entries()) {
    if (!val || now - val.at > SESSION_TTL) {
      sessions.delete(key);
    }
  }
};

const fetchSalaries = async () => {
  if (cache.data && Date.now() - cache.at < CACHE_TTL) {
    return cache.data;
  }

  try {
    const response = await axios.get(SOURCE_URL, {
      headers: HEADERS,
      timeout: 15000,
    });

    const json = response.data;
    const rawItems = Array.isArray(json?.items)
      ? json.items
      : Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json)
      ? json
      : [];

    const items = rawItems
      .map((item) => ({
        grade: item?.grade ?? item?.title ?? item?.name ?? "",
        net_monthly_mad: Number(item?.net_monthly_mad ?? item?.salary ?? 0) || 0,
        url: item?.url ?? item?.link ?? null,
      }))
      .filter((i) => i.grade);

    if (!items.length) {
      throw new Error("La liste des salaires est vide depuis la source");
    }

    cache = { data: items, at: Date.now() };
    return items;
  } catch (err) {
    // Solution de repli par scraping si le format JSON change
    try {
      const htmlRes = await axios.get("https://www.wadifa-info.com/fr/salaires", {
        headers: {
          ...HEADERS,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        timeout: 15000,
      });

      const $ = cheerio.load(htmlRes.data);
      const scraped = [];
      const rowSelectors = ["table tbody tr", ".salaires-list .salaire-item", ".card-salaire", "article"];

      for (const sel of rowSelectors) {
        $(sel).each((_, el) => {
          const grade =
            $(el).find("td:first-child, .grade, .title, h2, h3").first().text().trim();
          const salaryText =
            $(el).find("td:nth-child(2), .salaire, .amount, .price").first().text().trim();
          const numeric = Number(salaryText.replace(/[^\d.]/g, "")) || 0;
          const href = $(el).find("a").attr("href") || null;

          if (grade) {
            scraped.push({
              grade,
              net_monthly_mad: numeric,
              url: href ? new URL(href, "https://www.wadifa-info.com").toString() : null,
            });
          }
        });
        if (scraped.length) break;
      }

      if (!scraped.length) {
        throw err;
      }

      cache = { data: scraped, at: Date.now() };
      return scraped;
    } catch {
      throw new Error(err?.message || "Impossible de récupérer les données des salaires");
    }
  }
};

router.get("/salaires", async (req, res) => {
  try {
    cleanupSessions();
    const q = String(req.query.q ?? req.query.search ?? "").trim();
    const indexParam = req.query.index ?? req.query.number ?? req.query.id;
    const sessionId = String(req.query.sessionId ?? req.query.sender ?? "default").trim();
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    if (
      req.query.q !== undefined &&
      typeof req.query.q === "string" &&
      req.query.q.trim() === "" &&
      req.query.stats === "true"
    ) {
      return res.status(400).json({
        status: false,
        error: "Le paramètre de recherche q est vide",
      });
    }

    const items = await fetchSalaries();

    // Détails d'un résultat par son numéro depuis la dernière recherche
    if (indexParam !== undefined && String(indexParam).trim() !== "") {
      if (!/^\d+$/.test(String(indexParam).trim())) {
        return res.status(400).json({
          status: false,
          error: "Le numéro du résultat (index) doit être un entier positif",
        });
      }

      const session = sessions.get(sessionId);
      if (!session || Date.now() - session.at > SESSION_TTL) {
        return res.status(404).json({
          status: false,
          error: "Aucune recherche active pour cette session, veuillez d'abord effectuer une recherche via le paramètre q",
        });
      }

      const idx = Number(indexParam) - 1;
      const item = session.results[idx];
      if (!item) {
        return res.status(404).json({
          status: false,
          error: `Numéro introuvable. Choisissez un numéro entre 1 et ${session.results.length}`,
        });
      }

      return res.status(200).json({
        status: true,
        index: Number(indexParam),
        total_session_results: session.results.length,
        item: {
          ...item,
          formatted_salary: `${item.net_monthly_mad.toLocaleString("fr-MA")} MAD`,
          note: "Salaire approximatif au 1er échelon — Source : Wadifa Info",
        },
        source: "Wadifa Info (CC-BY-4.0)",
      });
    }

    // Statistiques générales lorsque q n'est pas fourni
    if (!q) {
      const sorted = [...items].sort((a, b) => a.net_monthly_mad - b.net_monthly_mad);
      const lowest = sorted[0];
      const highest = sorted[sorted.length - 1];

      return res.status(200).json({
        status: true,
        mode: "stats",
        total_grades: items.length,
        lowest_salary: lowest,
        highest_salary: highest,
        results: items.slice(0, limit),
        source: "Wadifa Info (CC-BY-4.0)",
      });
    }

    // Recherche par mots-clés
    const qNorm = normalize(q);
    if (!qNorm) {
      return res.status(400).json({
        status: false,
        error: "Veuillez saisir un mot-clé valide dans le paramètre q",
      });
    }

    const filtered = items.filter((item) => normalize(item.grade).includes(qNorm));

    if (!filtered.length) {
      return res.status(404).json({
        status: false,
        error: `Aucun grade correspondant à "${q}" n'a été trouvé`,
      });
    }

    sessions.set(sessionId, { results: filtered, at: Date.now() });

    const results = filtered.slice(0, limit).map((item, i) => ({
      index: i + 1,
      ...item,
    }));

    return res.status(200).json({
      status: true,
      mode: "search",
      query: q,
      sessionId,
      total: filtered.length,
      count: results.length,
      results,
      source: "Wadifa Info (CC-BY-4.0)",
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      error: err?.message || "Une erreur est survenue lors de la récupération des salaires",
    });
  }
});

module.exports = {
  path: "/api/salaires",
  name: "Salaires de la Fonction Publique Marocaine",
  type: "get",
  url: `${global.t || "http://localhost:3000"}/api/salaires/salaires?q=professeur`,
  logo: "https://www.wadifa-info.com/favicon.ico",
  category: "tools",
  info: "API permettant d'obtenir les statistiques et de rechercher les salaires des fonctionnaires au Maroc depuis Wadifa Info",
  router,
};
