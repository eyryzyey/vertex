const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

class TeraboxSearch {
  constructor(config = {}) {
    this.base = config.base || "https://teraboxsearch.xyz/api";
    this.headers = {
      "Accept": "*/*",
      "Accept-Language": "id-ID,en-US;q=0.9,en;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Type": "application/json",
      "Origin": "https://teraboxsearch.xyz",
      "Referer": "https://teraboxsearch.xyz/",
      "User-Agent": config.ua || "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36",
      "Connection": "keep-alive",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      ...config.headers
    };
    this.http = axios.create({
      baseURL: this.base,
      headers: this.headers,
      timeout: config.timeout || 30000,
      responseType: "json"
    });
  }

  async search({ query, limit = 5, detail = true, ...rest }) {
    console.log(`[search] query: ${query}, limit: ${limit}, detail: ${detail}`);
    
    try {
      const { data } = await this.http.post("/search", {
        query: query,
        ...rest
      });

      const raw = data?.data?.content || [];
      console.log(`[search] found ${raw.length} channels`);

      const items = raw.slice(0, limit);
      const results = [];

      for (const item of items) {
        const ch = item?.channel || {};
        const res = item?.results?.[0] || {};
        
        const parsed = {
          title: res.title || "N/A",
          url: res.url || "",
          preview: res.preview || "",
          files: res.file_num || 0,
          channel: {
            id: ch.channel_id || "",
            name: ch.channel_name || "Unknown",
            groupId: ch.group_id || "",
            avatar: ch.head_url || ""
          }
        };

        if (detail && ch.channel_id) {
          console.log(`[search] fetching detail for channel: ${ch.channel_id}`);
          const detailData = await this.detail({ id: ch.channel_id });
          parsed.detail = detailData || null;
        }

        results.push(parsed);
      }

      console.log(`[search] returning ${results.length} results`);

      return {
        status: true,
        count: results.length,
        query: query,
        items: results
      };

    } catch (e) {
      console.error(`[search] error: ${e?.message || e}`);
      return {
        status: false,
        error: e?.message || "Unknown error",
        query: query,
        items: []
      };
    }
  }

  async detail({ id, lastPostTime = 0, ...rest }) {
    console.log(`[detail] id: ${id}, lastPostTime: ${lastPostTime}`);
    
    try {
      const { data } = await this.http.post("/channel-info", {
        buk: id,
        lastPostTime: lastPostTime,
        ...rest
      });

      const raw = data?.data?.content || [];
      console.log(`[detail] found ${raw.length} posts`);

      const posts = raw.map(item => {
        const ch = item?.channel || {};
        const res = item?.results?.[0] || {};
        
        return {
          title: res.title || "N/A",
          url: res.url || "",
          preview: res.preview || "",
          files: res.file_num || 0,
          created: item.create_time || 0,
          createdDate: item.create_time ? new Date(item.create_time * 1000).toISOString() : null,
          channel: {
            id: ch.channel_id || "",
            name: ch.channel_name || "Unknown",
            groupId: ch.group_id || "",
            avatar: ch.head_url || ""
          }
        };
      });

      console.log(`[detail] returning ${posts.length} posts`);

      return {
        status: true,
        count: posts.length,
        channelId: id,
        posts: posts
      };

    } catch (e) {
      console.error(`[detail] error: ${e?.message || e}`);
      return {
        status: false,
        error: e?.message || "Unknown error",
        channelId: id,
        posts: []
      };
    }
  }
}

// Endpoint GET /search
router.get("/search", async (req, res) => {
  try {
    const { 
      query, 
      limit = 5, 
      detail = "true",
      ...rest 
    } = req.query;

    // Validation du paramètre query
    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Parameter 'query' is required",
        example: `${global.t || "http://localhost:3000"}/api/terabox/search?query=anime&limit=5&detail=true`,
        usage: "Search for Terabox channels and files",
        optionalParams: {
          limit: "Number of results (default: 5)",
          detail: "Fetch channel details (default: true)"
        }
      });
    }

    // Validation du limit
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        status: false,
        error: "Invalid limit parameter (must be between 1 and 50)"
      });
    }

    const api = new TeraboxSearch();
    const result = await api.search({
      query: query.trim(),
      limit: limitNum,
      detail: detail !== "false" && detail !== "0",
      ...rest
    });

    if (!result.status) {
      return res.status(422).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error("Terabox Search API Error:", error.message);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
      message: "Failed to search Terabox channels"
    });
  }
});

// Endpoint GET /detail
router.get("/detail", async (req, res) => {
  try {
    const { 
      id, 
      lastPostTime = 0,
      ...rest 
    } = req.query;

    // Validation du paramètre id
    if (!id || id.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Parameter 'id' (channel ID) is required",
        example: `${global.t || "http://localhost:3000"}/api/terabox/detail?id=4402320787247&lastPostTime=0`,
        usage: "Get details and posts from a specific Terabox channel",
        optionalParams: {
          lastPostTime: "Timestamp for pagination (default: 0)"
        }
      });
    }

    // Validation du lastPostTime
    const lastPostNum = parseInt(lastPostTime);
    if (isNaN(lastPostNum) || lastPostNum < 0) {
      return res.status(400).json({
        status: false,
        error: "Invalid lastPostTime parameter (must be a positive number)"
      });
    }

    const api = new TeraboxSearch();
    const result = await api.detail({
      id: id.trim(),
      lastPostTime: lastPostNum,
      ...rest
    });

    if (!result.status) {
      return res.status(422).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error("Terabox Detail API Error:", error.message);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
      message: "Failed to fetch channel details"
    });
  }
});

// Endpoint POST /search (pour les requêtes complexes)
router.post("/search", async (req, res) => {
  try {
    const { 
      query, 
      limit = 5, 
      detail = true,
      ...rest 
    } = req.body;

    // Validation du paramètre query
    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Parameter 'query' is required in request body",
        example: {
          query: "anime",
          limit: 5,
          detail: true
        }
      });
    }

    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        status: false,
        error: "Invalid limit parameter (must be between 1 and 50)"
      });
    }

    const api = new TeraboxSearch();
    const result = await api.search({
      query: query.trim(),
      limit: limitNum,
      detail: detail === true || detail === "true",
      ...rest
    });

    if (!result.status) {
      return res.status(422).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error("Terabox Search API Error:", error.message);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error"
    });
  }
});

// Endpoint POST /detail
router.post("/detail", async (req, res) => {
  try {
    const { 
      id, 
      lastPostTime = 0,
      ...rest 
    } = req.body;

    if (!id || id.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Parameter 'id' (channel ID) is required in request body",
        example: {
          id: "4402320787247",
          lastPostTime: 0
        }
      });
    }

    const lastPostNum = parseInt(lastPostTime);
    if (isNaN(lastPostNum) || lastPostNum < 0) {
      return res.status(400).json({
        status: false,
        error: "Invalid lastPostTime parameter"
      });
    }

    const api = new TeraboxSearch();
    const result = await api.detail({
      id: id.trim(),
      lastPostTime: lastPostNum,
      ...rest
    });

    if (!result.status) {
      return res.status(422).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error("Terabox Detail API Error:", error.message);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error"
    });
  }
});

module.exports = {
  path: "/api/terabox",
  name: "Terabox Search",
  type: "get",
  url: `${global.t || "http://localhost:3000"}/api/terabox/search?query=anime&limit=5`,
  logo: "https://teraboxsearch.xyz/favicon.ico",
  category: "search",
  info: "Search Terabox channels and files with detailed channel information and post listings",
  router
};

