const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

async function getAlloschoolLevels() {
  const url = "https://api.orx.ma/tl/alloschool?action=ecole";

  const headers = {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "accept-encoding": "gzip, deflate, br",
    "referer": "https://api.orx.ma/",
    "origin": "https://api.orx.ma"
  };

  const { data } = await axios.get(url, { headers });

  if (!data.status || !data.levels) {
    throw new Error("Failed to fetch levels");
  }

  return {
    message: data.message,
    usage: data.usage,
    primary: data.levels.primary.map(item => ({
      title: item.title,
      id: item.id
    })),
    middle: data.levels.middle.map(item => ({
      title: item.title,
      id: item.id
    })),
    high: data.levels.high.map(item => ({
      title: item.title,
      id: item.id
    }))
  };
}

router.get("/levels", async (req, res) => {
  try {
    const result = await getAlloschoolLevels();

    return res.status(200).json({
      status: true,
      message: result.message,
      usage: result.usage,
      totalPrimary: result.primary.length,
      totalMiddle: result.middle.length,
      totalHigh: result.high.length,
      levels: {
        primary: result.primary,
        middle: result.middle,
        high: result.high
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Failed to fetch Alloschool levels"
    });
  }
});

module.exports = {
  path: "/api/alloschool",
  name: "Alloschool Education Levels",
  type: "get",
  url: `${global.t || "http://localhost:3000"}/api/alloschool/levels`,
  logo: "https://cdn-icons-png.flaticon.com/512/3048/3048386.png",
  category: "tools",
  info: "Get Moroccan education levels from Alloschool",
  router
};

