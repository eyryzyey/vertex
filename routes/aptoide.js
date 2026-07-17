const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

class GeminiAI {
  constructor() {
    this.baseURL = "https://gemini.google.com";
    this.defaultHeaders = {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Origin": "https://gemini.google.com",
      "Referer": "https://gemini.google.com/",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.0.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Connection": "keep-alive",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin"
    };
  }

  async getCookie() {
    try {
      const { headers } = await axios.post(
        `${this.baseURL}/_/BardChatUi/data/batchexecute?rpcids=maGuAc&source-path=%2F&bl=boq_assistant-bard-web-server_20250814.06_p1&f.sid=-7816331052118000090&hl=en-US&_reqid=173780&rt=c`,
        "f.req=%5B%5B%5B%22maGuAc%22%2C%22%5B0%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&",
        {
          headers: {
            ...this.defaultHeaders,
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
          },
          timeout: 30000
        }
      );

      const cookie = headers["set-cookie"]?.[0]?.split("; ")[0] || "";
      
      if (!cookie) {
        throw new Error("Failed to retrieve session cookie");
      }

      return cookie;
    } catch (error) {
      throw new Error(`Cookie retrieval failed: ${error.message}`);
    }
  }

  parseSession(sessionId) {
    if (!sessionId) return null;

    try {
      const sessionData = JSON.parse(
        Buffer.from(sessionId, "base64").toString("utf8")
      );
      
      return {
        resumeArray: sessionData.resumeArray,
        cookie: sessionData.cookie,
        instruction: sessionData.instruction || ""
      };
    } catch (e) {
      console.error("[parseSession] Error parsing session:", e.message);
      return null;
    }
  }

  async chat(input = {}) {
    const payload = typeof input === "string" ? { message: input } : input || {};
    const { message, instruction = "", sessionId = null } = payload;

    try {
      if (!message || message.trim().length === 0) {
        throw new Error("Message is required");
      }

      let resumeArray = null;
      let cookie = null;
      let savedInstruction = instruction;

      // Restaurer la session si fournie
      if (sessionId) {
        const sessionData = this.parseSession(sessionId);
        if (sessionData) {
          resumeArray = sessionData.resumeArray;
          cookie = sessionData.cookie;
          savedInstruction = instruction || sessionData.instruction || "";
        }
      }

      // Obtenir un nouveau cookie si nécessaire
      if (!cookie) {
        cookie = await this.getCookie();
      }

      const requestBody = [
        [message, 0, null, null, null, null, 0],
        ["en-US"],
        resumeArray || ["", "", "", null, null, null, null, null, null, ""],
        null,
        null,
        null,
        [1],
        1,
        null,
        null,
        1,
        0,
        null,
        null,
        null,
        null,
        null,
        [[0]],
        1,
        null,
        null,
        null,
        null,
        null,
        [
          "",
          "",
          savedInstruction,
          null,
          null,
          null,
          null,
          null,
          0,
          null,
          1,
          null,
          null,
          null,
          [],
        ],
        null,
        null,
        1,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        1,
        null,
        null,
        null,
        null,
        [1],
      ];

      const requestPayload = [null, JSON.stringify(requestBody)];

      const { data } = await axios.post(
        `${this.baseURL}/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl=boq_assistant-bard-web-server_20250729.06_p0&f.sid=4206607810970164620&hl=en-US&_reqid=2813378&rt=c`,
        new URLSearchParams({ "f.req": JSON.stringify(requestPayload) }).toString(),
        {
          headers: {
            ...this.defaultHeaders,
            "Cookie": cookie,
            "X-Goog-Ext-525001261-Jspb": '[1,null,null,null,"9ec249fc9ad08861",null,null,null,[4]]'
          },
          timeout: 60000,
          responseType: "text"
        }
      );

      // Parser la réponse
      const match = Array.from(data.matchAll(/^\d+\n(.+?)\n/gm));
      const array = match.reverse();
      let parse1 = null;

      for (const item of array) {
        const selectedArray = item?.[1];
        if (!selectedArray) continue;

        try {
          const realArray = JSON.parse(selectedArray);
          const candidate = realArray?.[0]?.[2];
          if (!candidate) continue;

          const parsed = JSON.parse(candidate);
          if (parsed?.[4]?.[0]?.[1]?.[0]) {
            parse1 = parsed;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!parse1) {
        throw new Error("Failed to parse Gemini response");
      }

      const newResumeArray = [...parse1[1], parse1[4][0][0]];
      const text = parse1[4][0][1][0].replace(/\*\*(.+?)\*\*/g, "*$1*");

      const newSessionId = Buffer.from(
        JSON.stringify({
          resumeArray: newResumeArray,
          cookie: cookie,
          instruction: savedInstruction,
        }),
        "utf8"
      ).toString("base64");

      return {
        status: true,
        text: text,
        sessionId: newSessionId,
        metadata: {
          hasContext: !!resumeArray,
          instruction: savedInstruction || null,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      if (error?.response?.data) {
        const apiMessage =
          typeof error.response.data === "string"
            ? error.response.data
            : error.response.data.message || error.response.data.error;
        if (apiMessage) {
          error.message = apiMessage;
        }
      }

      throw error;
    }
  }
}

// Endpoint GET /chat
router.get("/chat", async (req, res) => {
  try {
    const { 
      message, 
      prompt,
      instruction, 
      sessionId 
    } = req.query;

    // Validation du message (supporte 'message' ou 'prompt')
    const userMessage = message || prompt;

    if (!userMessage || userMessage.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Parameter 'message' or 'prompt' is required",
        example: `${global.t || "http://localhost:3000"}/api/gemini/chat?message=Hello%20world`,
        usage: "Send a message to Gemini AI and get a response",
        optionalParams: {
          instruction: "System instruction for the AI behavior",
          sessionId: "Previous session ID for conversation continuity"
        }
      });
    }

    // Validation de la longueur
    if (userMessage.length > 10000) {
      return res.status(400).json({
        status: false,
        error: "Message too long (max 10000 characters)"
      });
    }

    const gemini = new GeminiAI();
    
    const options = {
      message: userMessage.trim(),
      instruction: instruction || "",
      sessionId: sessionId || null
    };

    const result = await gemini.chat(options);

    return res.status(200).json(result);

  } catch (error) {
    console.error("Gemini API Error:", error.message);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
      message: "Failed to get response from Gemini AI"
    });
  }
});

// Endpoint POST /chat (pour les messages longs)
router.post("/chat", async (req, res) => {
  try {
    const { 
      message, 
      prompt,
      instruction = "", 
      sessionId = null 
    } = req.body;

    // Validation du message
    const userMessage = message || prompt;

    if (!userMessage || userMessage.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Parameter 'message' or 'prompt' is required in request body",
        example: {
          message: "Hello world",
          instruction: "You are a helpful assistant",
          sessionId: "optional_previous_session_id"
        }
      });
    }

    // Validation de la longueur
    if (userMessage.length > 10000) {
      return res.status(400).json({
        status: false,
        error: "Message too long (max 10000 characters)"
      });
    }

    const gemini = new GeminiAI();
    
    const options = {
      message: userMessage.trim(),
      instruction: instruction,
      sessionId: sessionId
    };

    const result = await gemini.chat(options);

    return res.status(200).json(result);

  } catch (error) {
    console.error("Gemini API Error:", error.message);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
      message: "Failed to get response from Gemini AI"
    });
  }
});

// Endpoint POST /chat/stream (simulation de streaming)
router.post("/chat/stream", async (req, res) => {
  try {
    const { message, instruction = "", sessionId = null } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Parameter 'message' is required"
      });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const gemini = new GeminiAI();
    const result = await gemini.chat({
      message: message.trim(),
      instruction: instruction,
      sessionId: sessionId
    });

    // Simuler le streaming en envoyant la réponse complète
    res.write(`data: ${JSON.stringify({ status: true, chunk: result.text, done: false })}\n\n`);
    res.write(`data: ${JSON.stringify({ status: true, sessionId: result.sessionId, done: true })}\n\n`);
    res.end();

  } catch (error) {
    res.write(`data: ${JSON.stringify({ status: false, error: error.message, done: true })}\n\n`);
    res.end();
  }
});

module.exports = {
  path: "/api/gemini",
  name: "Gemini AI Chat",
  type: "get",
  url: `${global.t || "http://localhost:3000"}/api/gemini/chat?message=Hello%20world`,
  logo: "https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg",
  category: "ai",
  info: "Google Gemini AI chat with conversation memory support via session IDs",
  router
};
