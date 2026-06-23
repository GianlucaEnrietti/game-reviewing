type AuthLogEvent = "sign_in" | "sign_up";

type AuthLogPayload = {
  event: AuthLogEvent;
  email: string;
  success: boolean;
  captcha: "passed" | "failed" | "skipped";
  ip?: string | null;
  userAgent?: string | null;
  errorCode?: string;
  errorMessage?: string;
};

export function logAuthEvent(payload: AuthLogPayload) {
  const logLine = {
    scope: "supabase_auth",
    timestamp: new Date().toISOString(),
    ...payload,
  };

  if (payload.success) {
    console.info("[auth]", JSON.stringify(logLine));
    return;
  }

  console.warn("[auth]", JSON.stringify(logLine));
}
