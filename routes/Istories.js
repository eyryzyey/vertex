const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

const API_URL = "https://istories.media/page-data/news/page-data.json";
const NEWS_PAGE_URL = "https://istories.media/news/";
const BASE_URL = "https://istories.media";
const CACHE_TTL = 10 * 60 * 1000;

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
  Referer: NEWS_PAGE_URL,
};

let cache = { data: null, at: 0 };

const cleanText = (str = "") =>
  String(str)
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&mdash;/g, "—")
    .replace(/\s+/g, " ")
    .trim();

const formatMaterial = (item, index) => {
  const topics = Array.isArray(item?.topics)
    ? item.topics.map((t) => cleanText(t?.name)).filter(Boolean)
    : [];

  const blocksText = Array.isArray(item?.blocks)
    ? item.blocks
        .map((b) => (b?.type === "p" || b?.type === "ul" ? cleanText(b?.data) : ""))
        .filter(Boolean)
        .join("\n\n")
    : "";

  const imageUrl =
    Array.isArray(item?.entry_image) && item.entry_image.length
      ? item.entry_image[0]?.original_url || item.entry_image[0]?.url_1x || null
      : null;

  return {
    number: index + 1,
    id: item?.id ?? null,
    title: cleanText(item?.header) || "Sans titre",
    lead: cleanText(item?.lead) || "",
    preview: cleanText(item?.body_preview) || "",
    content: blocksText || cleanText(item?.body_preview) || "",
    date: item?.created_at_date || null,
    datetime: item?.created_at_date_time || null,
    topics,
    image: imageUrl,
    url: item?._path ? `${BASE_URL}${item._path}` : NEWS_PAGE_URL,
  };
};

const scrapeFallbackNews = async () => {
  const res = await axios.get(NEWS_PAGE_URL, {
    headers: {
      ...HEADERS,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    timeout: 15000,
  });

  const $ = cheerio.load(res.data);
  const scraped = [];
  const selectors = [
    "article",
    '[class*="NewsCard"]',
    '[class*="MaterialCard"]',
    ".news-item",
    "main a[href*='/news/']",
  ];

  for (const sel of selectors) {
    $(sel).each((idx, el) => {
      const title =
        cleanText($(el).find("h1, h2, h3, h4, [class*='header'], [class*='title']").first().text()) ||
        cleanText($(el).text());
      const lead = cleanText($(el).find("p, [class*='lead'], [class*='preview']").first().text());
      const href = $(el).is("a") ? $(el).attr("href") : $(el).find("a[href]").first().attr("href");
      const img = $(el).find("img").first().attr("src") || $(el).find("img").first().attr("data-src") || null;

      if (title && title.length > 4) {
        scraped.push({
          number: idx + 1,
          id: null,
          title,
          lead,
          preview: lead,
          content: lead,
          date: null,
          datetime: null,
          topics: [],
          image: img ? new URL(img, BASE_URL).toString() : null,
          url: href ? new URL(href, BASE_URL).toString() : NEWS_PAGE_URL,
        });
      }
    });

    if (scraped.length) break;
  }

  return scraped;
};

const fetchNewsMaterials = async () => {
  if (cache.data && Date.now() - cache.at < CACHE_TTL) {
    return cache.data;
  }

  try {
    const response = await axios.get(API_URL, {
      headers: HEADERS,
      timeout: 15000,
    });

    const rawMaterials = response?.data?.result?.pageContext?.materials;
    if (!Array.isArray(rawMaterials) || !rawMaterials.length) {
      throw new Error("Aucune actualité trouvée dans la source JSON");
    }

    const formatted = rawMaterials.map((item, index) => formatMaterial(item, index));
    cache = { data: formatted, at: Date.now() };
    return formatted;
  } catch (err) {
    const scraped = await scrapeFallbackNews();
    if (!scraped.length) {
      throw new Error(err?.message || "Impossible de récupérer les actualités");
    }
    cache = { data: scraped, at: Date.now() };
    return scraped;
  }
};

router.get("/news", async (req, res) => {
  try {
    const hasQueryKey = Object.prototype.hasOwnProperty.call(req.query, "q");
    const hasSearchKey = Object.prototype.hasOwnProperty.call(req.query, "search");
    const hasNumberKey = Object.prototype.hasOwnProperty.call(req.query, "number");
    const hasIndexKey = Object.prototype.hasOwnProperty.call(req.query, "index");

    if (
      (hasQueryKey && String(req.query.q).trim() === "") ||
      (hasSearchKey && String(req.query.search).trim() === "") ||
      (hasNumberKey && String(req.query.number).trim() === "") ||
      (hasIndexKey && String(req.query.index).trim() === "")
    ) {
      return res.status(400).json({
        status: false,
        error: "Le paramètre fourni est vide",
      });
    }

    const q = String(req.query.q ?? req.query.search ?? "").trim();
    const numberParam = req.query.number ?? req.query.index;
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

    const materials = await fetchNewsMaterials();

    if (numberParam !== undefined) {
      const numStr = String(numberParam).trim();
      if (!/^\d+$/.test(numStr)) {
        return res.status(400).json({
          status: false,
          error: "Le paramètre number doit être un entier positif",
        });
      }

      const idx = Number(numStr) - 1;
      const article = materials[idx];

      if (!article) {
        return res.status(404).json({
          status: false,
          error: `Article introuvable. Choisissez un numéro entre 1 et ${materials.length}`,
        });
      }

      return res.status(200).json({
        status: true,
        mode: "article",
        total_available: materials.length,
        article,
        results: [article],
        source: "Istories Media",
      });
    }

    let list = materials;
    let mode = "latest";

    if (q) {
      mode = "search";
      const qLower = q.toLowerCase();
      list = materials.filter((item) => {
        const title = item.title.toLowerCase();
        const lead = item.lead.toLowerCase();
        const preview = item.preview.toLowerCase();
        const content = item.content.toLowerCase();
        const topics = item.topics.join(" ").toLowerCase();
        return (
          title.includes(qLower) ||
          lead.includes(qLower) ||
          preview.includes(qLower) ||
          content.includes(qLower) ||
          topics.includes(qLower)
        );
      });

      if (!list.length) {
        return res.status(404).json({
          status: false,
          error: `Aucun résultat trouvé pour "${q}"`,
        });
      }
    }

    const results = list.slice(0, limit);

    return res.status(200).json({
      status: true,
      mode,
      query: q || null,
      total: list.length,
      count: results.length,
      results,
      source: "Istories Media",
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      error: err?.message || "Erreur lors de la récupération des actualités",
    });
  }
});

module.exports = {
  path: "/api/istories",
  name: "Istories News API",
  type: "get",
  url: `${global.t || "http://localhost:3000"}/api/istories/news?q=санкции`,
  logo: "https://istories.media/favicon.ico",
  category: "news",
  info: "API pour consulter et rechercher les actualités d'Istories Media",
  router,
};
