"use client";

import { useState, useMemo } from "react";
import { Search, Plus, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ArticleCard from "@/components/ArticleCard";
import ArticleFormModal from "@/components/ArticleFormModal";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { createArticle, updateArticle, deleteArticle } from "@/lib/api";
import type { Article, ArticleFormData, SortOrder } from "@/types";

const PAGE_SIZE = 10;

interface ArticleListProps {
  initialArticles: Article[];
}

export default function ArticleList({ initialArticles }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Article | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);

  const filtered = useMemo(() => {
    let result = articles.filter((a) => {
      const matchSearch =
        !search ||
        a.headline.toLowerCase().includes(search.toLowerCase()) ||
        a.source.toLowerCase().includes(search.toLowerCase());

      const pubDate = a.published_date.slice(0, 10);
      const matchFrom = !dateFrom || pubDate >= dateFrom;
      const matchTo = !dateTo || pubDate <= dateTo;

      return matchSearch && matchFrom && matchTo;
    });

    result = [...result].sort((a, b) => {
      const diff =
        new Date(b.published_date).getTime() -
        new Date(a.published_date).getTime();
      return sortOrder === "newest" ? diff : -diff;
    });

    return result;
  }, [articles, search, dateFrom, dateTo, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  const handleCreate = async (data: ArticleFormData) => {
    const created = await createArticle(data);
    setArticles((prev) => [created, ...prev]);
    resetPage();
  };

  const handleUpdate = async (data: ArticleFormData) => {
    if (!editTarget) return;
    const updated = await updateArticle(editTarget.id, data);
    setArticles((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a))
    );
  };

  const handleDelete = async (id: number) => {
    await deleteArticle(id);
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const openEdit = (article: Article) => {
    setEditTarget(article);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditTarget(null);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="헤드라인 또는 출처 검색..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); resetPage(); }}
            className="w-36"
            title="시작일"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); resetPage(); }}
            className="w-36"
            title="종료일"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))
            }
            title={sortOrder === "newest" ? "최신순" : "오래된순"}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
          <Button onClick={() => { setEditTarget(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" />
            추가
          </Button>
        </div>
      </div>

      {/* Sort indicator */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{filtered.length}개 기사</span>
        <span>{sortOrder === "newest" ? "최신순" : "오래된순"}</span>
      </div>

      {/* Card list */}
      {paginated.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">기사가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              onClick={() => setPage(p)}
              className="w-8 h-8 p-0"
            >
              {p}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Modals */}
      <ArticleFormModal
        open={formOpen}
        onClose={closeForm}
        onSubmit={editTarget ? handleUpdate : handleCreate}
        article={editTarget}
      />
      <DeleteConfirmDialog
        article={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
