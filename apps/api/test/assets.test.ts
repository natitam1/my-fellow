process.env.NODE_ENV = "test";
import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import app from "../src/app.js";
import { mongoClient } from "../src/utils/mongodb.js";

test.after(async () => {
  await mongoClient.close();
});

test("GET /assets/logo-primary.png returns 200 OK with image/png, cache, and CORS headers", async () => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const port = address.port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/assets/logo-primary.png`);
    assert.equal(res.status, 200);

    const contentType = res.headers.get("content-type");
    assert.ok(contentType, "Content-Type header should be present");
    assert.match(contentType, /^image\/png/);

    assert.equal(res.headers.get("access-control-allow-origin"), "*");
    assert.equal(res.headers.get("cross-origin-resource-policy"), "cross-origin");

    const cacheControl = res.headers.get("cache-control");
    assert.ok(cacheControl, "Cache-Control header should be present");
    assert.match(cacheControl, /public/);
    assert.match(cacheControl, /max-age=\d+/);

    const buffer = await res.arrayBuffer();
    assert.ok(buffer.byteLength > 1000, "Image buffer should not be empty");
  } finally {
    server.close();
  }
});

test("GET /assets/adaptive-icon.png falls back to mobile images and returns 200 OK with image/png", async () => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const port = address.port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/assets/adaptive-icon.png`);
    assert.equal(res.status, 200);

    const contentType = res.headers.get("content-type");
    assert.ok(contentType, "Content-Type header should be present");
    assert.match(contentType, /^image\/png/);

    assert.equal(res.headers.get("access-control-allow-origin"), "*");
    assert.equal(res.headers.get("cross-origin-resource-policy"), "cross-origin");

    const buffer = await res.arrayBuffer();
    assert.ok(buffer.byteLength > 1000, "Image buffer should not be empty");
  } finally {
    server.close();
  }
});

test("OPTIONS /assets/logo-primary.png returns 204 with CORS headers", async () => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const port = address.port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/assets/logo-primary.png`, {
      method: "OPTIONS",
    });
    assert.equal(res.status, 204);
    assert.equal(res.headers.get("access-control-allow-origin"), "*");
    assert.equal(res.headers.get("cross-origin-resource-policy"), "cross-origin");
  } finally {
    server.close();
  }
});

test("GET /assets/non-existent-file.png returns 404", async () => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const port = address.port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/assets/non-existent-file.png`);
    assert.equal(res.status, 404);
  } finally {
    server.close();
  }
});
