حوّل هذا الكود إلى API احترافي باستخدام Node.js و Express بنفس الهيكلة التالية:

🔹 الشروط:
- استعمل require وليس import (CommonJS)
- استعمل express.Router()
- استعمل axios لأي طلبات
- استعمل cheerio إذا كان scraping
- ضيف headers احترافية (User-Agent + Accept + ...)

🔹 شكل الكود النهائي يجب أن يكون:

1. استيراد المكتبات:
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

2. إنشاء router:
const router = express.Router();

3. إنشاء endpoint:
- يكون router.get أو post حسب الكود
- يستقبل parameters من req.query أو req.body
- تحقق من المدخلات (validation)
- إذا ماكانوش parameters رجّع error JSON

4. تنفيذ الكود الأصلي داخل try/catch:
- أي scraping يرجع JSON منظم
- أي function تتحول ل response JSON

5. JSON response يكون منظم:
نجاح:
{
  status: true,
  ...data
}

خطأ:
{
  status: false,
  error: "message"
}

6. في الأخير export بهذا الشكل:

module.exports = {
  path: "/api/اسم-الخدمة",
  name: "اسم واضح للAPI",
  type: "get أو post",
  url: `${global.t || "http://localhost:3000"}/api/اسم-الخدمة/endpoint?param=value`,
  logo: "رابط أيقونة",
  category: "search | tools | download | anime | etc",
  info: "وصف قصير للAPI",
  router
};

🔹 إضافات مهمة:
- نظّم الكود وخليه readable
- استعمل async/await
- تعامل مع الأخطاء بشكل احترافي
- رجّع النتائج في Array إذا كانت متعددة
- إذا scraping، حاول تستعمل أكثر من selector fallback

🔹 المطلوب:
حوّل الكود التالي فقط بدون شرح، وارجع الكود النهائي جاهز للاستعمال:
[// ============================================================
//  DeepSeek API Router  –  v3.0
//  Response: clean JSON  |  Supports: chat · files · sessions
// ============================================================

const express  = require('express');
const axios    = require('axios');
const crypto   = require('crypto');
const fs       = require('fs');
const path     = require('path');
const FormData = require('form-data');

const router = express.Router();

// ─────────────────────────────────────────────────────────────
//  Configuration
// ─────────────────────────────────────────────────────────────

const CONFIG = Object.freeze({
    AUTH_TOKEN          : 'Bearer wSQWrqR9ng/yapn+yTqVhjYIetYQRs9JGQk5lxkCYSUu0rS6ztCJ7dZUMuLyMOpx',
    BASE_URL            : 'https://chat.deepseek.com',
    WASM_PATH           : path.join(__dirname, '../deepseek.wasm'),
    SESSION_TTL         : 60 * 60 * 1000,
    SESSION_GC_INTERVAL : 15 * 60 * 1000,
    FILE_POLL_INTERVAL  : 2_000,
    FILE_POLL_MAX       : 30,
    POW_MAX_NONCE       : 2_000_000n,

    HEADERS: {
        'User-Agent'               : 'DeepSeek/1.8.3 Android/33',
        'x-client-platform'        : 'android',
        'x-client-version'         : '1.8.3',
        'x-client-locale'          : 'en_US',
        'x-client-bundle-id'       : 'com.deepseek.chat',
        'x-client-timezone-offset' : '3600',
        'Accept'                   : 'application/json',
        'Content-Type'             : 'application/json',
    },
});

// ─────────────────────────────────────────────────────────────
//  Session Store
// ─────────────────────────────────────────────────────────────

/** @type {Map<string, { lastMsgId: string|null, lastActive: number }>} */
const sessions = new Map();

setInterval(() => {
    const cutoff = Date.now() - CONFIG.SESSION_TTL;
    for (const [id, data] of sessions) {
        if (data.lastActive < cutoff) sessions.delete(id);
    }
}, CONFIG.SESSION_GC_INTERVAL);

async function getOrCreateSession(sessionId) {
    if (sessionId && sessions.has(sessionId)) {
        const data = sessions.get(sessionId);
        return { sessionId, lastMsgId: data.lastMsgId };
    }
    const res = await apiPost('/api/v0/chat_session/create', {});
    const id  = res.data.data.biz_data.chat_session.id;
    sessions.set(id, { lastMsgId: null, lastActive: Date.now() });
    return { sessionId: id, lastMsgId: null };
}

function saveSession(sessionId, lastMsgId) {
    sessions.set(sessionId, { lastMsgId, lastActive: Date.now() });
}

// ─────────────────────────────────────────────────────────────
//  HTTP Helpers
// ─────────────────────────────────────────────────────────────

const authHeaders = (extra = {}) => ({
    ...CONFIG.HEADERS,
    authorization: CONFIG.AUTH_TOKEN,
    ...extra,
});

const apiPost = (endpoint, data, extra = {}) =>
    axios.post(`${CONFIG.BASE_URL}${endpoint}`, data, { headers: authHeaders(extra) });

const apiGet = (endpoint, extra = {}) =>
    axios.get(`${CONFIG.BASE_URL}${endpoint}`, { headers: authHeaders(extra) });

// ─────────────────────────────────────────────────────────────
//  Proof-of-Work Engine
// ─────────────────────────────────────────────────────────────

let wasmInstance = null;

async function loadWasm() {
    if (wasmInstance) return wasmInstance;
    if (!fs.existsSync(CONFIG.WASM_PATH)) return null;
    try {
        const { instance } = await WebAssembly.instantiate(fs.readFileSync(CONFIG.WASM_PATH), {});
        return (wasmInstance = instance);
    } catch {
        return null;
    }
}

async function solvePoW(pow) {
    const prefix = `${pow.salt}_${pow.expire_at}_`;
    const engine = await loadWasm();

    // WASM path
    if (engine) {
        try {
            const { wasm_solve, memory, __wbindgen_export_0, __wbindgen_add_to_stack_pointer } = engine.exports;
            const alloc = (str) => {
                const buf = Buffer.from(str, 'utf8');
                const ptr = __wbindgen_export_0(buf.length, 1);
                new Uint8Array(memory.buffer, ptr, buf.length).set(buf);
                return [ptr, buf.length];
            };
            const [cPtr, cLen] = alloc(pow.challenge);
            const [pPtr, pLen] = alloc(prefix);
            const stackPtr     = __wbindgen_add_to_stack_pointer(-16);
            wasm_solve(stackPtr, cPtr, cLen, pPtr, pLen, pow.difficulty);
            const view = new DataView(memory.buffer, stackPtr, 16);
            if (view.getInt32(0, true) !== 0) return Math.floor(view.getFloat64(8, true));
        } catch { /* fall through to JS */ }
    }

    // Pure-JS fallback
    const target = (1n << 256n) / BigInt(pow.difficulty);
    const cBuf   = Buffer.from(pow.challenge, 'hex');
    const pBuf   = Buffer.from(prefix, 'utf8');
    for (let nonce = 0n; nonce < CONFIG.POW_MAX_NONCE; nonce++) {
        const nBuf = Buffer.alloc(8);
        nBuf.writeBigUInt64LE(nonce);
        const hash = crypto.createHash('sha256')
            .update(Buffer.concat([cBuf, pBuf, nBuf]))
            .digest();
        if (BigInt(`0x${hash.toString('hex')}`) < target) return Number(nonce);
    }
    return 0;
}

async function buildPoWHeader(targetPath) {
    const res    = await apiPost('/api/v0/chat/create_pow_challenge', { target_path: targetPath });
    const pow    = res.data.data.biz_data.challenge;
    const answer = await solvePoW(pow);
    return Buffer.from(JSON.stringify({
        algorithm: pow.algorithm, challenge: pow.challenge,
        salt: pow.salt, signature: pow.signature,
        answer, target_path: targetPath,
    })).toString('base64');
}

// ─────────────────────────────────────────────────────────────
//  File Upload
// ─────────────────────────────────────────────────────────────

const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

/**
 * Download a remote file, upload it to DeepSeek, and wait for processing to finish.
 * @param   {string}          fileUrl
 * @returns {Promise<string>} DeepSeek file ID
 */
async function uploadFile(fileUrl) {
    const { data: raw } = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const fileBuffer    = Buffer.from(raw);

    let fileName = 'document.pdf';
    try { fileName = decodeURIComponent(path.basename(new URL(fileUrl).pathname)) || fileName; }
    catch { /* keep default */ }

    const mimeType  = IMAGE_EXT.test(fileName) ? 'image/jpeg' : 'application/pdf';
    const powHeader = await buildPoWHeader('/api/v0/file/upload_file');

    const form = new FormData();
    form.append('file', fileBuffer, { filename: fileName, contentType: mimeType });

    const uploadRes = await axios.post(`${CONFIG.BASE_URL}/api/v0/file/upload_file`, form, {
        headers: {
            ...authHeaders({ 'x-ds-pow-response': powHeader, 'x-file-size': String(fileBuffer.length) }),
            ...form.getHeaders(),
        },
    });

    const fileId = uploadRes.data?.data?.biz_data?.id;
    if (!fileId) throw new Error('Upload succeeded but no file ID was returned.');

    for (let i = 0; i < CONFIG.FILE_POLL_MAX; i++) {
        await sleep(CONFIG.FILE_POLL_INTERVAL);
        const res    = await apiGet(`/api/v0/file/fetch_files?file_ids=${fileId}`);
        const status = res.data?.data?.biz_data?.files?.[0]?.status;
        if (status === 'SUCCESS') return fileId;
        if (status === 'ERROR')   throw new Error('DeepSeek rejected the file during processing.');
    }
    throw new Error('File processing timed out.');
}

// ─────────────────────────────────────────────────────────────
//  Stream Collector  (SSE → single string)
// ─────────────────────────────────────────────────────────────

/**
 * Collect all text chunks from a DeepSeek SSE stream into one string.
 * @param   {import('stream').Readable} stream
 * @returns {Promise<{ text: string, messageId: string|null }>}
 */
function collectStream(stream) {
    return new Promise((resolve, reject) => {
        let buffer    = '';
        let fullText  = '';
        let messageId = null;

        stream.on('data', (chunk) => {
            buffer += chunk.toString('utf8');
            const lines = buffer.split('\n');
            buffer = lines.pop(); // keep incomplete tail

            for (let line of lines) {
                line = line.trim();
                if (!line.startsWith('data: ')) continue;

                const payload = line.slice(6);
                if (payload === '[DONE]') continue;

                try {
                    const json    = JSON.parse(payload);
                    const content = (typeof json.v === 'string' && json.v)
                        || json.v?.response?.fragments?.[0]?.content
                        || '';

                    if (content)                      fullText  += content;
                    if (json.v?.response?.message_id) messageId  = json.v.response.message_id;
                } catch { /* partial chunk, skip */ }
            }
        });

        stream.on('end',   () => resolve({ text: fullText, messageId }));
        stream.on('error', reject);
    });
}

// ─────────────────────────────────────────────────────────────
//  Utility
// ─────────────────────────────────────────────────────────────

const sleep     = (ms)               => new Promise((r) => setTimeout(r, ms));
const jsonOk    = (res, data)        => res.status(200).json({ ok: true,  ...data });
const jsonError = (res, msg, code=500) => res.status(code).json({ ok: false, error: msg });

// ─────────────────────────────────────────────────────────────
//  Route  GET /api/deepseek
// ─────────────────────────────────────────────────────────────
//
//  Query params:
//    text       {string}  required  – user message
//    sessionId  {string}  optional  – reuse from a previous response to continue the chat
//    file       {string}  optional  – public URL of a PDF or image to attach
//
//  Success response:
//  {
//    "ok"        : true,
//    "sessionId" : "abc123",   ← pass this back in &sessionId= to continue the conversation
//    "answer"    : "...",
//    "file"      : { "id": "...", "sourceUrl": "..." } | null
//  }
//
//  Error response:
//  {
//    "ok"    : false,
//    "error" : "reason"
//  }
//

router.get('/', async (req, res) => {
    const { text, sessionId: incomingSessionId, file: fileUrl } = req.query;

    if (!text) return jsonError(res, 'Query param "text" is required.', 400);

    try {
        // 1. Session
        const { sessionId, lastMsgId } = await getOrCreateSession(incomingSessionId);

        // 2. File upload (optional)
        let fileId = null;
        if (fileUrl) fileId = await uploadFile(fileUrl);

        // 3. PoW
        const powHeader = await buildPoWHeader('/api/v0/chat/completion');

        // 4. Chat completion (streaming internally)
        const chatRes = await axios.post(
            `${CONFIG.BASE_URL}/api/v0/chat/completion`,
            {
                chat_session_id   : sessionId,
                parent_message_id : lastMsgId,
                prompt            : text,
                ref_file_ids      : fileId ? [fileId] : [],
                thinking_enabled  : false,
                search_enabled    : false,
                model_type        : 'default',
            },
            {
                headers      : authHeaders({
                    'x-ds-pow-response' : powHeader,
                    'Accept'            : 'text/event-stream',
                }),
                responseType : 'stream',
            }
        );

        // 5. Collect full answer
        const { text: answer, messageId } = await collectStream(chatRes.data);

        // 6. Persist session
        if (messageId) saveSession(sessionId, messageId);

        // 7. Return clean JSON
        return jsonOk(res, {
            sessionId,
            answer,
            file: fileId ? { id: fileId, sourceUrl: fileUrl } : null,
        });

    } catch (err) {
        const detail = err.response?.data
            ? JSON.stringify(err.response.data)
            : err.message;
        return jsonError(res, detail);
    }
});

// ─────────────────────────────────────────────────────────────
//  Module Export
// ─────────────────────────────────────────────────────────────

module.exports = {
    path   : '/api/deepseek',
    name   : 'DeepSeek AI',
    type   : 'ai',
    url    : 'https://mahoragaxmta.vercel.app/api/deepseek?text=query&file=url',
    logo   : 'https://files.catbox.moe/rtdlrj.jpg',
    router,
};]
