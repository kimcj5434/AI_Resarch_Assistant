import { Newspaper } from "lucide-react";
import ArticleList from "@/components/ArticleList";
import { fetchArticles } from "@/lib/api";
import type { Article } from "@/types";

export default async function HomePage() {
  let articles: Article[] = [];

  try {
    articles = await fetchArticles();
  } catch {
    // Backend not available; start with empty list
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Newspaper className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">긍정 뉴스 보드</h1>
          </div>
          <p className="text-sm text-gray-500">
            투자 리서치를 위한 엄선된 긍정 뉴스 기사
          </p>
        </div>

        <ArticleList initialArticles={articles} />
      </div>
    </main>
  );
}
