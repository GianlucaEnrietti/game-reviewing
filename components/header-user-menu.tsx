"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "../app/admin/actions";

type Props = {
  email?: string;
};

export default function HeaderUserMenu({ email }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
        aria-label="Abrir menú de usuario"
      >
        <span className="text-base">👤</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-11 z-20 min-w-56 rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-lg">
          <p className="mb-3 text-xs text-slate-400">Conectado como</p>
          <p className="mb-3 truncate text-sm font-medium text-slate-100">
            {email ?? "Administrador"}
          </p>

          <Link
            href="/admin"
            className="mb-2 block rounded-md border border-slate-700 px-3 py-2 text-center text-sm font-medium text-slate-100 hover:bg-slate-800"
          >
            Panel
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              className="w-full rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
