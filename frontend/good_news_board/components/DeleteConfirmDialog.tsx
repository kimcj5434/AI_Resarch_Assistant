"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Article } from "@/types";

interface DeleteConfirmDialogProps {
  article: Article | null;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
}

export default function DeleteConfirmDialog({
  article,
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!article) return;
    setLoading(true);
    try {
      await onConfirm(article.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!article} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>기사 삭제</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600 mt-1">
          <span className="font-medium text-gray-900">
            &ldquo;{article?.headline}&rdquo;
          </span>
          을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
        </p>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "삭제 중..." : "삭제"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
