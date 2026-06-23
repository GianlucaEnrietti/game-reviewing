const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TITLE_MAX = 120;
const BODY_MIN = 20;
const BODY_MAX = 2000;

export type ContactFields = {
  email: string;
  title: string;
  body: string;
};

export type ContactValidationResult =
  | { ok: true; data: ContactFields }
  | { ok: false; error: string };

export function validateContactFields(raw: {
  email: unknown;
  title: unknown;
  body: unknown;
  honeypot?: unknown;
}): ContactValidationResult {
  if (String(raw.honeypot ?? "").trim()) {
    return { ok: false, error: "No se pudo enviar el mensaje." };
  }

  const email = String(raw.email ?? "").trim().toLowerCase();
  const title = String(raw.title ?? "").trim();
  const body = String(raw.body ?? "").trim();

  if (!email || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Ingresá un email válido." };
  }

  if (!title) {
    return { ok: false, error: "El título es obligatorio." };
  }

  if (title.length > TITLE_MAX) {
    return {
      ok: false,
      error: `El título no puede superar ${TITLE_MAX} caracteres.`,
    };
  }

  if (body.length < BODY_MIN) {
    return {
      ok: false,
      error: `La consulta debe tener al menos ${BODY_MIN} caracteres.`,
    };
  }

  if (body.length > BODY_MAX) {
    return {
      ok: false,
      error: `La consulta no puede superar ${BODY_MAX} caracteres.`,
    };
  }

  return { ok: true, data: { email, title, body } };
}
