import http from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { Readable, Writable } from "node:stream";
import handler from "./dist/server/index.js";

const PORT = Number(process.env.PORT || 3000);
const publicDir = "dist/client";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function getMimeType(filePath) {
  return mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream";
}

function tryServeStatic(req, res) {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);

  if (pathname === "/") {
    return false;
  }

  const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    return false;
  }

  if (!existsSync(filePath)) {
    return false;
  }

  const fileStat = statSync(filePath);

  if (!fileStat.isFile()) {
    return false;
  }

  const headers = {
    "Content-Type": getMimeType(filePath),
  };

  if (pathname.startsWith("/assets/")) {
    headers["Cache-Control"] = "public, max-age=31536000, immutable";
  } else {
    headers["Cache-Control"] = "public, max-age=3600";
  }

  res.writeHead(200, headers);

  if (req.method === "HEAD") {
    res.end();
    return true;
  }

  createReadStream(filePath).pipe(res);
  return true;
}

function createFetchRequest(req) {
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host || `127.0.0.1:${PORT}`;
  const url = `${protocol}://${host}${req.url}`;

  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item);
      }
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }

  const hasBody = !["GET", "HEAD"].includes(req.method || "GET");

  return new Request(url, {
    method: req.method,
    headers,
    body: hasBody ? Readable.toWeb(req) : undefined,
    duplex: hasBody ? "half" : undefined,
  });
}

async function writeFetchResponse(fetchResponse, res) {
  res.statusCode = fetchResponse.status;
  res.statusMessage = fetchResponse.statusText;

  fetchResponse.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (!fetchResponse.body) {
    res.end();
    return;
  }

  await fetchResponse.body.pipeTo(Writable.toWeb(res));
}

const server = http.createServer(async (req, res) => {
  try {
    if (tryServeStatic(req, res)) {
      return;
    }

    const request = createFetchRequest(req);

    const env = {};
    const ctx = {
      waitUntil(promise) {
        Promise.resolve(promise).catch(console.error);
      },
      passThroughOnException() {},
    };

    const response = await handler.fetch(request, env, ctx);
    await writeFetchResponse(response, res);
  } catch (error) {
    console.error(error);

    if (!res.headersSent) {
      res.writeHead(500, {
        "Content-Type": "text/plain; charset=utf-8",
      });
    }

    res.end("Internal Server Error");
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`TanStack app running on http://127.0.0.1:${PORT}`);
});