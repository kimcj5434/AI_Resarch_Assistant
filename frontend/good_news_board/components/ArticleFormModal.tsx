"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Article, ArticleFormData } from "@/types";

interface ArticleFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ArticleFormData) => Promise<void>;
  article?: Article | null;
}

const EMPTY_FORM: ArticleFormData = {
  headline: "",
  source: "",
  url: "",
  published_date: "",
  reason: "",
};

export default function ArticleFormModal({
  open,
  onClose,
  onSubmit,
  article,
}: ArticleFormModalProps) {
  const [form, setForm] = useState<ArticleFormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (article) {
      setForm({
        headline: article.headline,
        source: article.source,
        url: article.url,
        published_date: article.published_date.slice(0, 10),
        reason: article.reason,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError(null);
  }, [article, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(form);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "기사 저장에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{article ? "기사 수정" : "기사 추가"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="headline">헤드라인</Label>
            <Input
              id="headline"
              name="headline"
              value={form.headline}
              onChange={handleChange}
              placeholder="기사 헤드라인"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="source">출처</Label>
              <Input
                id="source"
                name="source"
                value={form.source}
                onChange={handleChange}
                placeholder="예: 연합뉴스"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="published_date">발행일</Label>
              <Input
                id="published_date"
                name="published_date"
                type="date"
                value={form.published_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              name="url"
              type="url"
              value={form.url}
              onChange={handleChange}
              placeholder="https://"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reason">왜 긍정적인 뉴스인가요?</Label>
            <Textarea
              id="reason"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="이 기사가 긍정적인 이유를 설명해 주세요..."
              rows={3}
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "저장 중..." : article ? "변경사항 저장" : "기사 추가"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
