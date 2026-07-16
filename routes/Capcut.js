const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const { CookieJar } = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");

const router = express.Router();

class SscCut {
  constructor() {
    this.jar = new CookieJar();
    this.client = wrapper(
      axios.create({
        jar: this.jar,
        withCredentials: true,
        timeout: 30000,
        headers: {
          "Accept": "*/*",
          "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          "Accept-Encoding": "gzip, deflate, br",
          "Connection": "keep-alive",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin"
        }
      })
    );
    this.base = "https://ssccut.com";
    this.ajax = `${this.base}/wp-admin/admin-ajax.php`;
  }

  log(msg, type = "info") {
    const time = new Date().toLocaleTimeString();
    const icon = type === "error" ? "❌" : type === "success" ? "✅" : "ℹ️";
    console.log(`[${time}] ${icon} ${msg}`);
  }

  head(ref) {
    return {
      "Accept": "*/*",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Origin": this.base,
      "Referer": ref || this.base,
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36",
      "X-Requested-With": "XMLHttpRequest",
      "Sec-CH-UA": '"Chromium";v="127", "Not)A;Brand";v="99"',
      "Sec-CH-UA-Mobile": "?1",
      "Sec-CH-UA-Platform": '"Android"',
      "Priority": "u=1, i",
      "Connection": "keep-alive"
    };
  }

  async req(url, method = "GET", data = null, headers = {}) {
    try {
      const opts = {
        method: method,
        url: url,
        headers: {
          ...this.head(),
          ...headers
        },
        data: data || undefined
      };
      return await this.client(opts);
    } catch (e) {
      this.log(`Request Error: ${e.message}`, "error");
      return null;
    }
  }

  async download({ url, ...rest }) {
    this.log(`Start processing: ${url}`);
    
    try {
      // Étape 1 : Récupérer le nonce depuis la page principale
      this.log("Fetching Token & Nonce...");
      const pageRes = await this.req(this.base, "GET");
      
      if (!pageRes?.data) {
        throw new Error("Failed to load main page");
      }

      const $ = cheerio.load(pageRes.data);
      
      // Fallback selectors pour trouver le script de configuration
      let scriptContent = null;
      const selectors = [
        "#video-downloader-script-js-extra",
        "script[id*='video-downloader']",
        "script[id*='downloader-script']",
        "script:contains('videoDownloader')"
      ];
      
      for (const selector of selectors) {
        try {
          scriptContent = $(selector).html();
          if (scriptContent && scriptContent.includes("videoDownloader")) break;
        } catch (e) {
          continue;
        }
      }

      // Fallback : chercher dans tous les scripts
      if (!scriptContent) {
        $("script").each((i, el) => {
          const content = $(el).html();
          if (content && content.includes("videoDownloader")) {
            scriptContent = content;
            return false;
          }
        });
      }

      if (!scriptContent) {
        throw new Error("Could not find videoDownloader script on page");
      }

      const match = scriptContent.match(/var videoDownloader\s*=\s*(\{.*?\});/);
      let config = null;
      
      if (match && match[1]) {
        try {
          config = JSON.parse(match[1]);
        } catch (e) {
          // Fallback : essayer de parser avec des corrections
          const cleanJson = match[1]
            .replace(/,\s*}/g, "}")
            .replace(/,\s*]/g, "]");
          config = JSON.parse(cleanJson);
        }
      }

      const nonce = config?.nonce;
      if (!nonce) {
        throw new Error("Failed to extract Nonce from page");
      }
      
      this.log(`Nonce found: ${nonce}`);

      // Étape 2 : Envoyer la requête AJAX
      const payload = new URLSearchParams({
        action: "fetch_capcut_content",
        nonce: nonce,
        url: url,
        ...rest
      }).toString();

      this.log("Sending data request...");
      
      const apiRes = await this.req(this.ajax, "POST", payload, {
        "Referer": this.base + "/"
      });

      const json = apiRes?.data;
      
      if (!json?.success || !json?.data) {
        throw new Error("Failed to fetch video data or invalid URL");
      }

      // Étape 3 : Parser la réponse HTML
      const htmlString = json.data.html || json.data;
      
      if (typeof htmlString !== "string") {
        throw new Error("Invalid response format from server");
      }

      const $$ = cheerio.load(htmlString);
      
      // Fallback selectors pour les données du routeur
      let rawData = null;
      const routerSelectors = [
        "#__MODERN_ROUTER_DATA__",
        "#__NEXT_DATA__",
        "#__APP_DATA__",
        "script[data-name='modern-router']"
      ];
      
      for (const selector of routerSelectors) {
        rawData = $$(selector).html();
        if (rawData) break;
      }

      // Fallback : chercher dans tous les scripts
      if (!rawData) {
        $$("script").each((i, el) => {
          const content = $$(el).html();
          if (content && (content.includes("template-detail") || content.includes("templateDetail"))) {
            rawData = content;
            return false;
          }
        });
      }

      if (!rawData) {
        throw new Error("Router data not found in HTML response");
      }

      let jsonData;
      try {
        jsonData = JSON.parse(rawData);
      } catch (e) {
        // Fallback : extraire le JSON depuis le script
        const jsonMatch = rawData.match(/\{[\s\S]*"templateDetail"[\s\S]*\}/);
        if (jsonMatch) {
          jsonData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse router data");
        }
      }

      // Fallback pour trouver les données du template
      let templateDetail = null;
      const possiblePaths = [
        jsonData?.loaderData?.["template-detail_$"]?.templateDetail,
        jsonData?.props?.pageProps?.templateDetail,
        jsonData?.templateDetail,
        jsonData?.data?.templateDetail
      ];
      
      for (const path of possiblePaths) {
        if (path?.templateId) {
          templateDetail = path;
          break;
        }
      }

      if (!templateDetail?.templateId) {
        throw new Error("Invalid or empty template details");
      }

      // Construction du résultat
      const result = {
        id: templateDetail.templateId,
        title: templateDetail.title || "No Title",
        description: templateDetail.desc || "",
        coverUrl: templateDetail.coverUrl || "",
        videoUrl: templateDetail.videoUrl || "",
        videoWidth: templateDetail.videoWidth || 0,
        videoHeight: templateDetail.videoHeight || 0,
        durationMs: templateDetail.templateDuration || 0,
        durationSec: templateDetail.templateDuration ? (templateDetail.templateDuration / 1000).toFixed(2) : 0,
        playAmount: templateDetail.playAmount || 0,
        usageAmount: templateDetail.usageAmount || 0,
        likeAmount: templateDetail.likeAmount || 0,
        commentAmount: templateDetail.commentAmount || 0,
        segmentAmount: templateDetail.segmentAmount || 0,
        createTime: templateDetail.createTime || 0,
        createDate: templateDetail.createTime ? new Date(templateDetail.createTime * 1000).toISOString() : null,
        author: {
          name: templateDetail.author?.name || "Unknown",
          avatarUrl: templateDetail.author?.avatarUrl || "",
          description: templateDetail.author?.description || "",
          profileUrl: templateDetail.author?.profileUrl || "",
          secUid: templateDetail.author?.secUid || "",
          uid: templateDetail.author?.uid || 0
        },
        structuredData: templateDetail.structuredData || null
      };

      this.log(`Successfully parsed data: ${result.title}`, "success");
      
      return {
        status: true,
        result: result
      };

    } catch (e) {
      this.log(e.message, "error");
      return {
        status: false,
        error: e.message || "Unknown error occurred",
        data: null
      };
    }
  }
}

// Validation URL CapCut
function validateCapCutUrl(url) {
  const capcutRegex = /^https?:\/\/(www\.)?(capcut\.com|ssccut\.com)\/(template|t|share)\/[^/?#&]+/i;
  const tiktokRegex = /^https?:\/\/(www\.)?(tiktok\.com)\/[^/?#&]+/i;
  return capcutRegex.test(url) || tiktokRegex.test(url);
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
        example: `${global.t || "http://localhost:3000"}/api/ssccut/download?url=https://www.capcut.com/template/xxxxxx`,
        usage: "Provide a CapCut template URL to download",
        supportedFormats: [
          "https://www.capcut.com/template/...",
          "https://www.capcut.com/t/...",
          "https://ssccut.com/..."
        ]
      });
    }

    const trimmedUrl = url.trim();

    // Validation du format URL CapCut
    if (!validateCapCutUrl(trimmedUrl)) {
      return res.status(400).json({
        status: false,
        error: "Invalid CapCut URL format",
        example: "https://www.capcut.com/template-detail/xxxxxx",
        supportedPlatforms: ["capcut.com", "ssccut.com", "tiktok.com"]
      });
    }

    const api = new SscCut();
    const result = await api.download({ url: trimmedUrl });

    if (!result.status) {
      return res.status(422).json({
        status: false,
        error: result.error || "Failed to process CapCut URL"
      });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error("SscCut API Error:", error.message);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
      message: "Failed to download CapCut template"
    });
  }
});

// Endpoint POST /download (pour les URLs longues)
router.post("/download", async (req, res) => {
  try {
    const { url, ...additionalParams } = req.body;

    // Validation du paramètre URL
    if (!url || url.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Parameter 'url' is required in request body",
        example: {
          url: "https://www.capcut.com/template-detail/xxxxxx"
        }
      });
    }

    const trimmedUrl = url.trim();

    // Validation du format URL CapCut
    if (!validateCapCutUrl(trimmedUrl)) {
      return res.status(400).json({
        status: false,
        error: "Invalid CapCut URL format",
        example: "https://www.capcut.com/template-detail/xxxxxx"
      });
    }

    const api = new SscCut();
    const result = await api.download({ url: trimmedUrl, ...additionalParams });

    if (!result.status) {
      return res.status(422).json({
        status: false,
        error: result.error || "Failed to process CapCut URL"
      });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error("SscCut API Error:", error.message);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
      message: "Failed to download CapCut template"
    });
  }
});

// Endpoint GET /info (alias de download pour compatibilité)
router.get("/info", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || url.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Parameter 'url' is required",
        example: `${global.t || "http://localhost:3000"}/api/ssccut/info?url=https://www.capcut.com/watch/7289244487848434949
`
      });
    }

    const trimmedUrl = url.trim();

    if (!validateCapCutUrl(trimmedUrl)) {
      return res.status(400).json({
        status: false,
        error: "Invalid CapCut URL format"
      });
    }

    const api = new SscCut();
    const result = await api.download({ url: trimmedUrl });

    return res.status(200).json(result);

  } catch (error) {
    console.error("SscCut Info API Error:", error.message);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error"
    });
  }
});

module.exports = {
  path: "/api/ssccut",
  name: "CapCut Template Downloader",
  type: "get",
  url: `${global.t || "http://localhost:3000"}/api/ssccut/download?url=https://www.capcut.com/watch/7289244487848434949
`,
  logo: "https://www.capcut.com/favicon.ico",
  category: "download",
  info: "Download CapCut templates with metadata including video URL, cover, author info and statistics",
  router
};

