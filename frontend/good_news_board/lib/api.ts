import type { Article, ArticleFormData } from "@/types";

const BASE = "/api/articles";

async function throwWithDetail(res: Response, fallback: string): Promise<never> {
  let detail = fallback;
  try {
    const body = await res.json();
    if (body?.detail) detail = String(body.detail);
    else if (body?.message) detail = String(body.message);
  } catch {
    // ignore parse error
  }
  throw new Error(`[${res.status}] ${detail}`);
}

export async function fetchArticles(): Promise<Article[]> {
  const res = await fetch(BASE, { cache: "no-store" });
  if (!res.ok) await throwWithDetail(res, "Failed to fetch articles");
  return res.json();
}

export async function createArticle(data: ArticleFormData): Promise<Article> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) await throwWithDetail(res, "Failed to create article");
  return res.json();
}

export async function updateArticle(
  id: number,
  data: Partial<ArticleFormData>
): Promise<Article> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) await throwWithDetail(res, "Failed to update article");
  return res.json();
}

export async function deleteArticle(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) await throwWithDetail(res, "Failed to delete article");
}
