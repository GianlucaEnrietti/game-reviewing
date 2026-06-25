"use client";

import { useState } from "react";
import { deleteComment } from "../../app/admin/comments-actions";

type Props = {
  commentId: string;
  nickname: string;
};

export default function DeleteCommentButton({ commentId, nickname }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Eliminar el comentario de "${nickname}"? Esta acción no se puede deshacer.`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteComment(commentId);

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
