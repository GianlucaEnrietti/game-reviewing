"use client";

import { useState } from "react";
import { deleteNews } from "../../app/admin/news-actions";

type Props = {
  newsId: string;
  newsTitle: string;
};

export default function DeleteNewsButton({ newsId, newsTitle }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Eliminar la noticia "${newsTitle}"? Esta acción no se puede deshacer.`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteNews(newsId);

    if (result?.error) {
      alert(result.error);
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-400 underline-offset-2 hover:underline disabled:opacity-60"
    >
      {isDeleting ? "Eliminando..." : "Eliminar"}
    </button>
  );
}
