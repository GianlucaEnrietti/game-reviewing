"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { validateContactFields } from "../utils/contact/validate-contact";
import { verifyTurnstileToken } from "../utils/security/turnstile";

export type ContactActionState = {
  error?: string;
  success?: boolean;
};

function getClientIp(headerList: Headers): string | null {
  const forwardedFor = headerList.get("x-forwarded-for");
  if (!forwardedFor) {
    return null;
  }

  return forwardedFor.split(",")[0]?.trim() ?? null;
}

export async function sendContactMessage(
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const validated = validateContactFields({
    email: formData.get("email"),
    title: formData.get("title"),
    body: formData.get("body"),
    honeypot: formData.get("_honeypot"),
  });

  if (!validated.ok) {
    return { error: validated.error };
  }

  const captchaToken = String(formData.get("captchaToken") ?? "");
  const headerList = await headers();
  const ip = getClientIp(headerList);

  const captcha = await verifyTurnstileToken(captchaToken, ip ?? undefined);

  if (!captcha.ok) {
    return { error: "Captcha inválido o expirado. Intentá nuevamente." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !toEmail || !fromEmail) {
    return {
      error:
        "El formulario de contacto no está configurado. Contactá al administrador del sitio.",
    };
  }

  const resend = new Resend(apiKey);
  const { email, title, body } = validated.data;

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    replyTo: email,
    subject: `[Contacto] ${title}`,
    text: [
      "Nueva consulta desde el formulario de contacto",
      "",
      `Email: ${email}`,
      `Título: ${title}`,
      "",
      body,
    ].join("\n"),
  });

  if (error) {
    console.error("[contact] resend error:", error);

    if (process.env.NODE_ENV === "development") {
      return {
        error: `Resend: ${error.message}`,
      };
    }

    return { error: "No se pudo enviar el mensaje. Intentá más tarde." };
  }

  return { success: true };
}
