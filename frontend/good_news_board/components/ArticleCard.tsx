"use client";

import { ExternalLink, MoreVertical, Pencil, Trash2, Newspaper, EyeOff } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { getSourceColor } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { Article } from "@/types";

interface ArticleCardProps {
  article: Article;
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
}

export default function ArticleCard({ article, onEdit, onDelete }: ArticleCardProps) {
  const sourceColor = getSourceColor(article.source);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-3">
        <div className="mt-0.5 flex-shrink-0">
          <Newspaper className="h-4 w-4 text-gray-400" />
        </div>

        <div className="flex-1 min-w-0">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 leading-snug block"
          >
            {article.headline}
          </a>

          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${sourceColor}`}
            >
              {article.source}
            </span>
            {!article.is_shown && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border border-gray-200 text-gray-400">
                <EyeOff className="h-3 w-3" />
                숨김
              </span>
            )}
            {article.is_manual && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-blue-100 text-blue-500">
                수동
              </span>
            )}
          </div>

          {article.reason && (
            <p className="mt-1.5 text-sm text-gray-500 line-clamp-2 leading-relaxed">
              {article.reason}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span>{format(new Date(article.published_at), "MMM d, yyyy")}</span>
              <span>·</span>
              <span>
                수집:{" "}
                {formatDistanceToNow(new Date(article.collected_at), {
                  addSuffix: true,
                })}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                title="기사 열기"
              >
                <ExternalLink className="h-3.5 w-3.5 text-gray-400 hover:text-blue-500" />
              </a>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded hover:bg-gray-100 transition-colors">
                    <MoreVertical className="h-3.5 w-3.5 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(article)}>
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    수정
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(article)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
