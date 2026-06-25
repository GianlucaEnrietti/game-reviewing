"use client";

import { useState } from "react";
import { approveComment } from "../../app/admin/comments-actions";

type Props = {
  commentId: string;
};

export default function ApproveCommentButton({ commentId }: Props) {
  const [isApproving, setIsApproving] = useState(false);

  async function handleApprove() {
    setIsApproving(true);
    const result = await approveComment(commentId);

    if (result?.error) {
      alert(result.error);
      setIsApproving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleApprove}
      disabled={isApproving}
      className="text-emerald-300 underline-offset-2 hover:underline disabled:opacity-60"
    >
      {isApproving ? "Aprobando..." : "Aprobar"}
    </button>
  );
}
