"use client";

import { useActionState, useState } from "react";
import { AuthActionState, signInAdmin } from "../../app/admin/actions";
import TurnstileField from "../turnstile-field";

const initialState: AuthActionState = {};

export default function AdminLoginForm() {
  const [captchaToken, setCaptchaToken] = useState("");
  const [state, formAction, isPending] = useActionState(
    signInAdmin,
    initialState
  );
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const shouldUseTurnstile =
    Boolean(turnstileSiteKey) && process.env.NODE_ENV !== "development";

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="captchaToken" value={captchaToken} />

      <div>
        <label
          className="mb-1 block text-sm font-medium text-slate-200"
          htmlFor="email"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-slate-500"
        />
      </div>

      <div>
        <label
          className="mb-1 block text-sm font-medium text-slate-200"
          htmlFor="password"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-slate-500"
        />
      </div>

      {shouldUseTurnstile && (
        <TurnstileField onTokenChange={setCaptchaToken} />
      )}

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending || (shouldUseTurnstile && !captchaToken)}
        className="w-full rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white disabled:opacity-60"
      >
        {isPending ? "Verificando..." : "Ingresar"}
      </button>
    </form>
  );
}
