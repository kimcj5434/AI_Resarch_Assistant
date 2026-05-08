import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000";

type Params = { params: Promise<{ proxy: string[] }> };

async function handler(request: NextRequest, { params }: Params) {
  const { proxy } = await params;
  const urlPath = proxy.join("/");

  let rawBody: ArrayBuffer | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    rawBody = await request.arrayBuffer();
  }

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
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
