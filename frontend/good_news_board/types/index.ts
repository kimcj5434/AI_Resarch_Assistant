export interface Article {
  id: number;
  headline: string;
  source: string;
  url: string;
  published_date: string;
  collected_at: string;
  reason: string;
}

export interface ArticleFormData {
  headline: string;
  source: string;
  url: string;
  published_date: string;
  reason: string;
}

export type SortOrder = "newest" | "oldest";
