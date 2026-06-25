"use client";

import { useState } from "react";
import { deleteRamble } from "../../app/admin/rambles-actions";

type Props = {
  rambleId: string;
  rambleTitle: string;
};

export default function DeleteRambleButton({ rambleId, rambleTitle }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Eliminar el ramble "${rambleTitle}"? Esta acción no se puede deshacer.`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteRamble(rambleId);

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
