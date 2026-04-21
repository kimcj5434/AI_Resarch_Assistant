import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000";
const DB_PATH = path.join(process.cwd(), "mock_db.json");

type MockDb = { articles: Record<string, unknown>[]; nextId: number };

function readDb(): MockDb {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  } catch {
    return { articles: [], nextId: 1 };
  }
}

function writeDb(db: MockDb) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

type Params = { params: Promise<{ proxy: string[] }> };

async function handler(request: NextRequest, { params }: Params) {
  const { proxy } = await params;
  const path = proxy.join("/");

  // Read body once upfront so it can be reused in both proxy and mock
  let rawBody: ArrayBuffer | undefined;
  let jsonBody: Record<string, unknown> | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    rawBody = await request.arrayBuffer();
    try {
      jsonBody = JSON.parse(new TextDecoder().decode(rawBody));
    } catch {
      // not JSON
    }
  }

  // Try forwarding to FastAPI
  try {
    const url = new URL(request.url);
    const target = `${FASTAPI_URL}/${path}${url.search}`;
    const headers = new Headers(request.headers);
    headers.delete("host");

    const res = await fetch(target, {
      method: request.method,
      headers,
      body: rawBody,
      signal: AbortSignal.timeout(3000),
    });
    return new NextResponse(res.body, { status: res.status, headers: res.headers });
  } catch {
    // FastAPI unreachable — fall through to mock
  }

  // Mock implementation
  const idMatch = path.match(/^articles\/(\d+)$/);
  const id = idMatch ? Number(idMatch[1]) : null;
  const db = readDb();

  if (path === "articles" && request.method === "GET") {
    return NextResponse.json(db.articles);
  }

  if (path === "articles" && request.method === "POST") {
    const article = {
      id: db.nextId++,
      collected_at: new Date().toISOString(),
      ...jsonBody,
    };
    db.articles = [article, ...db.articles];
    writeDb(db);
    return NextResponse.json(article, { status: 201 });
  }

  if (id !== null && request.method === "PATCH") {
    db.articles = db.articles.map((a) =>
      a.id === id ? { ...a, ...jsonBody } : a
    );
    const updated = db.articles.find((a) => a.id === id);
    writeDb(db);
    return updated
      ? NextResponse.json(updated)
      : NextResponse.json({ detail: "not found" }, { status: 404 });
  }

  if (id !== null && request.method === "DELETE") {
    db.articles = db.articles.filter((a) => a.id !== id);
    writeDb(db);
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({ detail: "not found" }, { status: 404 });
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
