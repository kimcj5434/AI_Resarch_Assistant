import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000";
const DB_PATH = path.join(process.cwd(), "mock_db.json");

type MockArticle = {
  id: number;
  headline: string;
  source: string;
  url: string;
  published_at: string;
  collected_at: string;
  score: number;
  reason: string | null;
  is_shown: boolean;
  is_manual: boolean;
};
type MockDb = { articles: MockArticle[]; nextId: number };

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
  const urlPath = proxy.join("/");

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
    const target = `${FASTAPI_URL}/${urlPath}${url.search}`;
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
  const idMatch = urlPath.match(/^articles\/(\d+)$/);
  const id = idMatch ? Number(idMatch[1]) : null;
  const searchParams = new URL(request.url).searchParams;
  const db = readDb();

  if (urlPath === "articles" && request.method === "GET") {
    const isShownParam = searchParams.get("is_shown");
    let articles = db.articles;
    // Default: only show is_shown=true articles (matches FastAPI behavior)
    if (isShownParam === null || isShownParam === "true") {
      articles = articles.filter((a) => a.is_shown !== false);
    } else if (isShownParam === "false") {
      articles = articles.filter((a) => a.is_shown === false);
    }
    return NextResponse.json(articles);
  }

  if (urlPath === "articles" && request.method === "POST") {
    const body = (jsonBody ?? {}) as Partial<MockArticle>;
    if (body.url && db.articles.some((a) => a.url === body.url)) {
      return NextResponse.json({ detail: "Article with this URL already exists" }, { status: 409 });
    }
    const article: MockArticle = {
      id: db.nextId++,
      headline: body.headline ?? "",
      source: body.source ?? "",
      url: body.url ?? "",
      published_at: body.published_at ?? new Date().toISOString(),
      collected_at: new Date().toISOString(),
      score: 1,
      is_shown: body.is_shown ?? true,
      is_manual: true,
      reason: body.reason ?? null,
    };
    db.articles = [article, ...db.articles];
    writeDb(db);
    return NextResponse.json(article, { status: 201 });
  }

  if (id !== null && request.method === "PATCH") {
    db.articles = db.articles.map((a) =>
      a.id === id ? { ...a, ...(jsonBody as Partial<MockArticle>) } : a
    );
    const updated = db.articles.find((a) => a.id === id);
    writeDb(db);
    return updated
      ? NextResponse.json(updated)
      : NextResponse.json({ detail: "not found" }, { status: 404 });
  }

  if (id !== null && request.method === "DELETE") {
    const exists = db.articles.some((a) => a.id === id);
    if (!exists) return NextResponse.json({ detail: "not found" }, { status: 404 });
    db.articles = db.articles.filter((a) => a.id !== id);
    writeDb(db);
    return new NextResponse(null, { status: 204 });
  }

  // Mock crawl trigger — always return 202
  if (urlPath === "crawl/run" && request.method === "POST") {
    return NextResponse.json({ status: "crawl started (mock)" }, { status: 202 });
  }

  return NextResponse.json({ detail: "not found" }, { status: 404 });
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
