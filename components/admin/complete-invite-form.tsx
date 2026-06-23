"use client";

import { useActionState, useEffect, useState } from "react";
import {
  CompleteInviteState,
  completeInviteSignup,
} from "../../app/admin/actions";
import { createClient } from "../../utils/supabase/client";
import { readInviteHashFromWindow } from "../../utils/auth/invite-hash";

type Props = {
  initialEmail?: string | null;
};

const initialState: CompleteInviteState = {};

const inputClass =
  "w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-slate-500";

export default function CompleteInviteForm({ initialEmail }: Props) {
  const [state, formAction, isPending] = useActionState(
    completeInviteSignup,
    initialState
  );
  const [status, setStatus] = useState<"loading" | "ready" | "invalid">(
    initialEmail ? "ready" : "loading"
  );
  const [email, setEmail] = useState(initialEmail ?? "");

  useEffect(() => {
    async function bootstrapSession() {
      const supabase = createClient();
      const invite = readInviteHashFromWindow();

      if (invite) {
        const { error } = await supabase.auth.setSession({
          access_token: invite.accessToken,
          refresh_token: invite.refreshToken,
        });

        window.history.replaceState(null, "", window.location.pathname);

        if (error) {
          setStatus("invalid");
          return;
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        setStatus("invalid");
        return;
      }

      setEmail(user.email);
      setStatus("ready");
    }

    if (!initialEmail) {
      bootstrapSession();
    }
  }, [initialEmail]);

  if (status === "loading") {
    return (
      <p className="mt-6 text-sm text-slate-400">Validando invitación...</p>
    );
  }

  if (status === "invalid") {
    return (
      <div className="mt-6 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
        El enlace de invitación no es válido o expiró. Pide al administrador
        que te envíe una nueva invitación.
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
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
          value={email}
          readOnly
          className={`${inputClass} cursor-not-allowed text-slate-400`}
        />
      </div>

      <div>
        <label
          className="mb-1 block text-sm font-medium text-slate-200"
          htmlFor="nickname"
        >
          Nickname
        </label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          required
          minLength={2}
          maxLength={40}
          autoComplete="nickname"
          placeholder="Cómo te verán en las reseñas"
          className={inputClass}
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
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </div>

      <div>
        <label
          className="mb-1 block text-sm font-medium text-slate-200"
          htmlFor="confirmPassword"
        >
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white disabled:opacity-60"
      >
        {isPending ? "Guardando..." : "Completar registro"}
      </button>
    </form>
  );
}
