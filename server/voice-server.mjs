/**
 * XYRO local voice bridge.
 *
 * The browser can't reach macOS Personal Voice (Apple restricts it to native
 * apps). So web-XYRO POSTs its text here, and this local server speaks it in
 * Neeraj's own voice via the personal-say Swift bridge — out the Mac's
 * speakers, on the same machine, so it feels seamless.
 *
 * Engine chain (best first): ElevenLabs clone → macOS Personal Voice → stock
 * `say`. Run: node server/voice-server.mjs   (or npm run voice)
 */
import { createServer } from "node:http";
import { execFileSync, spawn } from "node:child_process";
import { existsSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.XYRO_VOICE_PORT ?? 8788);
const HERE = dirname(fileURLToPath(import.meta.url));
const PERSONAL_SAY = process.env.XYRO_PERSONAL_SAY ?? join(HERE, "personal-say");

// --- decide the engine once at startup ---
const hasEleven = Boolean(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID);
function personalVoiceReady() {
  if (!existsSync(PERSONAL_SAY)) return false;
  try {
    execFileSync(PERSONAL_SAY, ["list"], { stdio: ["ignore", "pipe", "ignore"] });
    return true;
  } catch { return false; }
}
const ENGINE = hasEleven ? "elevenlabs" : personalVoiceReady() ? "personal" : "say";
console.log(`XYRO voice bridge → engine: ${ENGINE}`);
if (ENGINE === "say") console.log("  (train a Personal Voice or set ELEVENLABS keys to speak in your own voice)");

let current = null; // kill in-flight speech when a new line arrives (barge-in)
function stop() { if (current) { current.kill("SIGKILL"); current = null; } }

async function speak(text) {
  stop();
  if (ENGINE === "elevenlabs") {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}?output_format=mp3_44100_128`,
      { method: "POST", headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "content-type": "application/json" },
        body: JSON.stringify({ text, model_id: process.env.ELEVENLABS_MODEL ?? "eleven_flash_v2_5" }) },
    );
    if (!res.ok) throw new Error(`ElevenLabs ${res.status}`);
    const file = join(tmpdir(), `xyro-${Date.now()}.mp3`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    await new Promise((r) => { current = spawn("afplay", [file], { stdio: "ignore" }); current.once("exit", r); });
    rmSync(file, { force: true });
  } else if (ENGINE === "personal") {
    await new Promise((res, rej) => { current = spawn(PERSONAL_SAY, ["speak", text], { stdio: "ignore" });
      current.once("exit", (c) => (c === 0 ? res() : rej(new Error(`personal-say ${c}`)))); current.once("error", rej); });
  } else {
    await new Promise((res) => { current = spawn("say", [text], { stdio: "ignore" }); current.once("exit", res); });
  }
  current = null;
}

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
};

createServer((req, res) => {
  if (req.method === "OPTIONS") { res.writeHead(204, CORS); return res.end(); }
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { ...CORS, "content-type": "application/json" });
    return res.end(JSON.stringify({ ok: true, engine: ENGINE }));
  }
  if (req.method === "POST" && req.url === "/speak") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      try {
        const { text } = JSON.parse(body || "{}");
        if (!text) throw new Error("no text");
        speak(String(text).slice(0, 600)).catch((e) => console.error("speak:", e.message));
        res.writeHead(200, { ...CORS, "content-type": "application/json" });
        res.end(JSON.stringify({ ok: true, engine: ENGINE }));
      } catch (e) {
        res.writeHead(400, { ...CORS, "content-type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }
  if (req.method === "POST" && req.url === "/stop") { stop(); res.writeHead(200, CORS); return res.end(); }
  res.writeHead(404, CORS); res.end();
}).listen(PORT, () => console.log(`XYRO voice bridge listening on http://localhost:${PORT}`));
