const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const FormData = require("form-data");
const { exec } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const { tmpdir } = require("os");

const router = express.Router();
const execPromise = promisify(exec);

const VOCAL_API = "https://aivocalremover.com";
const VOCAL_UPLOAD = "https://aivocalremover.com/api/v2/FileUpload";
const VOCAL_PROCESS = "https://aivocalremover.com/api/v2/ProcessFile";
const CATBOX_API = "https://catbox.moe/user/api.php";
const LITTERBOX_API = "https://litterbox.catbox.moe/resources/internals/api.php";

const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";
const KEY = "X9QXlU9PaCqGWpnP1Q4IzgXoKinMsKvMuMn3RYXnKHFqju8VfScRmLnIGQsJBnbZFdcKyzeCDOcnJ3StBmtT9nDEXJn";

async function getSession() {
  const res = await axios.get(VOCAL_API, {
    headers: { "User-Agent": UA },
    timeout: 30000
  });
  const cookie = (res.headers["set-cookie"] || []).map(c => c.split(";")[0]).join("; ");
  if (!cookie) throw new Error("Failed to get session");
  return cookie;
}

async function uploadFile(buffer, filename, cookie) {
  const form = new FormData();
  const mimeType = filename.endsWith(".mp4") ? "video/mp4" : "audio/mpeg";
  form.append("fileName", buffer, { filename: filename, contentType: mimeType });

  const res = await axios.post(VOCAL_UPLOAD, form, {
    headers: {
      "User-Agent": UA,
      "Cookie": cookie,
      "Origin": VOCAL_API,
      "Referer": `${VOCAL_API}/`,
      "Accept": "application/json, text/javascript, */*; q=0.01",
      "X-Requested-With": "XMLHttpRequest",
      ...form.getHeaders()
    },
    timeout: 120000
  });

  const data = res.data;
  if (data.error || !data.file_name) throw new Error(data.message || "Upload failed");
  return data.file_name;
}

async function processFile(fileName, cookie) {
  const res = await axios.post(VOCAL_PROCESS,
    new URLSearchParams({
      file_name: fileName,
      action: "watermark_video",
      key: KEY,
      web: "web"
    }),
    {
      headers: {
        "User-Agent": UA,
        "Cookie": cookie,
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": VOCAL_API,
        "Referer": `${VOCAL_API}/`,
        "X-Requested-With": "XMLHttpRequest"
      },
      timeout: 300000
    }
  );

  const data = res.data;
  if (data.error) throw new Error(data.message || "Processing failed");
  if (!data.vocal_path || !data.instrumental_path) throw new Error("No output files returned");
  return { vocal: data.vocal_path, instrumental: data.instrumental_path };
}

async function uploadLitterbox(buffer, fileName) {
  const form = new FormData();
  const mimeType = fileName.endsWith(".mp4") ? "video/mp4" : "audio/mpeg";
  form.append("reqtype", "fileupload");
  form.append("time", "72h");
  form.append("fileToUpload", buffer, { filename: fileName, contentType: mimeType });

  const res = await axios.post(LITTERBOX_API, form, {
    headers: { ...form.getHeaders(), "User-Agent": UA },
    timeout: 120000
  });
  const text = String(res.data).trim();
  if (!text.startsWith("https://")) throw new Error(text);
  return text;
}

async function uploadCatboxFromUrl(url) {
  const form = new FormData();
  form.append("reqtype", "urlupload");
  form.append("url", url);

  const res = await axios.post(CATBOX_API, form, {
    headers: { ...form.getHeaders(), "User-Agent": UA },
    timeout: 60000
  });
  const text = String(res.data).trim();
  if (!text.startsWith("https://")) throw new Error(text);
  return text;
}

async function toCatbox(buffer, fileName) {
  const tempUrl = await uploadLitterbox(buffer, fileName);
  return await uploadCatboxFromUrl(tempUrl);
}

async function downloadUrl(url) {
  const res = await axios.get(url, {
    responseType: "arraybuffer",
    headers: { "User-Agent": UA },
    timeout: 120000
  });
  return Buffer.from(res.data);
}

async function mergeAudioWithVideo(videoBuffer, audioUrl, outputPath) {
  const videoPath = path.join(tmpdir(), `temp_video_${Date.now()}.mp4`);
  fs.writeFileSync(videoPath, videoBuffer);

  const audioBuffer = await downloadUrl(audioUrl);
  const audioPath = path.join(tmpdir(), `temp_audio_${Date.now()}.mp3`);
  fs.writeFileSync(audioPath, audioBuffer);

  const cmd = `ffmpeg -i "${videoPath}" -i "${audioPath}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest "${outputPath}" -y`;

  try {
    await execPromise(cmd);
  } catch (error) {
    throw new Error(`Merge failed: ${error.message}`);
  } finally {
    try { fs.unlinkSync(videoPath); } catch {}
    try { fs.unlinkSync(audioPath); } catch {}
  }

  return outputPath;
}

router.post("/remove", async (req, res) => {
  try {
    const { videoUrl } = req.body;

    if (!videoUrl || typeof videoUrl !== "string" || videoUrl.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Missing or invalid parameter: 'videoUrl' is required in body",
        example: `${global.t || "http://localhost:3000"}/api/vocal/remove`
      });
    }

    if (!/^https?:\/\//i.test(videoUrl)) {
      return res.status(400).json({
        status: false,
        error: "Invalid URL format"
      });
    }

    const videoBuffer = await downloadUrl(videoUrl.trim());
    const fileName = `video.${videoUrl.split("?")[0].split(".").pop() || "mp4"}`;

    if (!videoBuffer || videoBuffer.length === 0) {
      throw new Error("Empty file or download failed");
    }

    const cookie = await getSession();
    const uploadedFileName = await uploadFile(videoBuffer, fileName, cookie);

    const { vocal, instrumental } = await processFile(uploadedFileName, cookie);

    const outputPath = path.join(tmpdir(), `output_${Date.now()}.mp4`);
    await mergeAudioWithVideo(videoBuffer, vocal, outputPath);

    const outputBuffer = fs.readFileSync(outputPath);

    const instBuffer = await downloadUrl(instrumental);
    let instUrl;
    try {
      instUrl = await toCatbox(instBuffer, "music_only.mp3");
    } catch (_) {
      instUrl = instrumental;
    }

    try { fs.unlinkSync(outputPath); } catch {}

    return res.status(200).json({
      status: true,
      videoSize: `${(outputBuffer.length / 1024 / 1024).toFixed(1)} MB`,
      vocalVideo: outputBuffer.toString("base64"),
      instrumentalAudio: instUrl
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Vocal removal failed"
    });
  }
});

module.exports = {
  path: "/api/vocal",
  name: "AI Vocal Remover",
  type: "post",
  url: `${global.t || "http://localhost:3000"}/api/vocal/remove`,
  logo: "https://cdn-icons-png.flaticon.com/512/727/727218.png",
  category: "tools",
  info: "Remove vocals from video - isolate voice and music",
  router
};

