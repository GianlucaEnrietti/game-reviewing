"use client";

import { useState } from "react";
import { deleteReview } from "../../app/admin/actions";

type Props = {
  reviewId: string;
  reviewTitle: string;
};

export default function DeleteReviewButton({ reviewId, reviewTitle }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Eliminar "${reviewTitle}"? Esta acción no se puede deshacer.`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    const result = await deleteReview(reviewId);

    if (result?.error) {
      setError(result.error);
      setIsDeleting(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-end">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-red-400 underline-offset-2 hover:underline disabled:opacity-60"
      >
        {isDeleting ? "Eliminando..." : "Eliminar"}
      </button>
      {error && <span className="mt-1 text-xs text-red-400">{error}</span>}
    </span>
  );
}
