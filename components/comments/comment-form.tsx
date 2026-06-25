"use client";

import { useActionState, useState } from "react";
import {
  createComment,
  CreateCommentState,
} from "../../app/comment-actions";
import { CommentPostType } from "../../data/comments";
import TurnstileField from "../turnstile-field";

const initialState: CreateCommentState = {};

type Props = {
  postSlug: string;
  postType: CommentPostType;
};

const inputClass =
  "w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-slate-500";

export default function CommentForm({ postSlug, postType }: Props) {
  const [captchaToken, setCaptchaToken] = useState("");
  const [state, formAction, isPending] = useActionState(
    createComment,
    initialState
  );
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const shouldUseTurnstile =
    Boolean(turnstileSiteKey) && process.env.NODE_ENV !== "development";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="postSlug" value={postSlug} />
      <input type="hidden" name="postType" value={postType} />
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

      {state.success ? (
        <div
          className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
          role="status"
        >
          Comentario enviado. Quedó pendiente de moderación.
        </div>
      ) : (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200" htmlFor="nickname">
              Nickname
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              required
              minLength={2}
              maxLength={40}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200" htmlFor="comment-content">
              Mensaje
            </label>
            <textarea
              id="comment-content"
              name="content"
              required
              minLength={3}
              maxLength={2000}
              rows={4}
              className={`${inputClass} resize-y`}
            />
          </div>

          {shouldUseTurnstile && (
            <TurnstileField onTokenChange={setCaptchaToken} />
          )}

          {state.error && <p className="text-sm text-red-400">{state.error}</p>}

          <button
            type="submit"
            disabled={isPending || (shouldUseTurnstile && !captchaToken)}
            className="rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white disabled:opacity-60"
          >
            {isPending ? "Enviando..." : "Enviar comentario"}
          </button>
        </>
      )}
    </form>
  );
}
