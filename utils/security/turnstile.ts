type TurnstileVerificationResult = {
  ok: boolean;
  reason?: string;
};

type TurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
};

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<TurnstileVerificationResult> {
  if (process.env.NODE_ENV === "development") {
    return { ok: true, reason: "captcha_disabled_local" };
  }

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!siteKey || !secretKey) {
    return { ok: true, reason: "captcha_not_configured" };
  }

  if (!token) {
    return { ok: false, reason: "missing_token" };
  }

  const body = new URLSearchParams({
    secret: secretKey,
    response: token,
  });

  if (remoteIp) {
    body.append("remoteip", remoteIp);
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    return { ok: false, reason: `http_${response.status}` };
  }

  const payload = (await response.json()) as TurnstileResponse;

  if (!payload.success) {
    const codes = payload["error-codes"] ?? [];
    return { ok: false, reason: codes.join(",") || "verification_failed" };
  }

  return { ok: true };
}
