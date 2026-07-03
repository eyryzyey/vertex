const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

async function translateText(text, to = "ar", from = "auto") {
  const url = `https://api.orx.ma/tl/translate?text=${encodeURIComponent(text)}&to=${to}`;

  const headers = {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "accept-encoding": "gzip, deflate, br",
    "referer": "https://api.orx.ma/",
    "origin": "https://api.orx.ma"
  };

  const { data } = await axios.get(url, { headers });

  if (!data.status || !data.translated) {
    throw new Error("Translation failed");
  }

  return {
    original: data.original,
    translated: data.translated,
    from: data.from,
    to: data.to,
    fromName: data.from_name,
    toName: data.to_name,
    quality: data.quality
  };
}

router.get("/translate", async (req, res) => {
  try {
    const { q, query, text, to = "ar" } = req.query;

    const inputText = q || query || text;

    if (!inputText || typeof inputText !== "string" || inputText.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Missing or invalid parameter: 'q', 'query', or 'text' is required",
        example: `${global.t || "http://localhost:3000"}/api/translate/translate?q=hello+world&to=ar`
      });
    }

    const result = await translateText(inputText.trim(), to);

    return res.status(200).json({
      status: true,
      original: result.original,
      translated: result.translated,
      from: result.from,
      to: result.to,
      fromName: result.fromName,
      toName: result.toName,
      quality: result.quality
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Failed to translate text"
    });
  }
});

module.exports = {
  path: "/api/translate",
  name: "Text Translator",
  type: "get",
  url: `${global.t || "http://localhost:3000"}/api/translate/translate?q=hello+world&to=ar`,
  logo: "https://cdn-icons-png.flaticon.com/512/484/484633.png",
  category: "tools",
  info: "Translate text between languages",
  router
};
