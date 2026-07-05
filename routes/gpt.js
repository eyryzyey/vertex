const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

async function gptChat(text, userId = "anonymous") {
  const url = `https://api.joanimi-world.online/api/gpt?text=${encodeURIComponent(text)}&userId=${userId}`;

  const headers = {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "accept-encoding": "gzip, deflate, br",
    "referer": "https://api.joanimi-world.online/",
    "origin": "https://api.joanimi-world.online"
  };

  const { data } = await axios.get(url, { headers });

  if (!data.status || !data.result) {
    throw new Error("Failed to get response from GPT");
  }

  return {
    response: data.result,
    creator: data.creator
  };
}

router.get("/chat", async (req, res) => {
  try {
    const { q, query, text, userId = "anonymous" } = req.query;

    const inputText = q || query || text;

    if (!inputText || typeof inputText !== "string" || inputText.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Missing or invalid parameter: 'q', 'query', or 'text' is required",
        example: `${global.t || "http://localhost:3000"}/api/gpt/chat?q=hello&userId=123`
      });
    }

    const result = await gptChat(inputText.trim(), userId);

    return res.status(200).json({
      status: true,
      query: inputText.trim(),
      userId: userId,
      response: result.response,
      creator: result.creator
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Failed to get GPT response"
    });
  }
});

module.exports = {
  path: "/api/gpt",
  name: "GPT AI Chat",
  type: "get",
  url: `${global.t || "http://localhost:3000"}/api/gpt/chat?q=hello&userId=123`,
  logo: "https://cdn-icons-png.flaticon.com/512/4712/4712035.png",
  category: "tools",
  info: "AI chat powered by GPT API",
  router
};

