/**
 * Minimal static file server for the XYRO face (prototype/). No dependencies
 * beyond Node's built-ins — keeps the always-on launchd services to a single
 * runtime (Node) instead of also depending on Python being on PATH, which
 * launchd services can't rely on (they don't source your shell profile).
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.XYRO_FACE_PORT ?? 8777);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "prototype");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

createServer(async (req, res) => {
  const urlPath = new URL(req.url, "http://x").pathname;
  const rel = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = normalize(join(ROOT, rel));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end("Forbidden"); }

  try {
    await stat(filePath);
    const body = await readFile(filePath);
    res.writeHead(200, { "content-type": TYPES[extname(filePath)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}).listen(PORT, () => console.log(`XYRO face listening on http://localhost:${PORT}`));
