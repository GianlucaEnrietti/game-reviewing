"use client";

import { useActionState, useState } from "react";
import {
  ContactActionState,
  sendContactMessage,
} from "../app/contact-actions";
import TurnstileField from "./turnstile-field";

const initialState: ContactActionState = {};

const inputClassName =
  "w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-slate-500";

export default function ContactForm() {
  const [captchaToken, setCaptchaToken] = useState("");
  const [state, formAction, isPending] = useActionState(
    sendContactMessage,
    initialState
  );
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const shouldUseTurnstile =
    Boolean(turnstileSiteKey) && process.env.NODE_ENV !== "development";

  if (state.success) {
    return (
      <div
        className="rounded-lg border border-emerald-800/60 bg-emerald-950/40 px-4 py-6 text-emerald-200"
        role="status"
      >
        <p className="font-medium">Mensaje enviado</p>
        <p className="mt-2 text-sm text-emerald-300/90">
          Recibimos tu consulta. Te responderemos a la brevedad.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="captchaToken" value={captchaToken} />

      <div
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
        aria-hidden="true"
      >
        <label htmlFor="_honeypot">No completar</label>
        <input
          id="_honeypot"
          name="_honeypot"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label
          className="mb-1 block text-sm font-medium text-slate-200"
          htmlFor="contact-email"
        >
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClassName}
        />
      </div>

      <div>
        <label
          className="mb-1 block text-sm font-medium text-slate-200"
          htmlFor="contact-title"
        >
          Título
        </label>
        <input
          id="contact-title"
          name="title"
          type="text"
          required
          maxLength={120}
          className={inputClassName}
        />
      </div>

      <div>
        <label
          className="mb-1 block text-sm font-medium text-slate-200"
          htmlFor="contact-body"
        >
          Consulta
        </label>
        <textarea
          id="contact-body"
          name="body"
          required
          minLength={20}
          maxLength={2000}
          rows={6}
          className={`${inputClassName} resize-y`}
        />
      </div>

      {shouldUseTurnstile && (
        <TurnstileField onTokenChange={setCaptchaToken} />
      )}

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending || (shouldUseTurnstile && !captchaToken)}
        className="rounded-md bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-white disabled:opacity-60"
      >
        {isPending ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
}
