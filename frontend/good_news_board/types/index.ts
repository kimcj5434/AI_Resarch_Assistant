export interface Article {
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
}

export interface ArticleFormData {
  headline: string;
  source: string;
  url: string;
  published_at: string;
  reason: string;
  is_shown?: boolean;
}

export type SortOrder = "newest" | "oldest";
