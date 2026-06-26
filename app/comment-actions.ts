"use server";

import { headers } from "next/headers";
import { createClient } from "../utils/supabase/server";
import { verifyTurnstileToken } from "../utils/security/turnstile";
import { CommentPostType } from "../data/comments";
import { notifyDiscordModeration } from "../utils/notifications/discord";

export type CreateCommentState = {
  error?: string;
  success?: boolean;
};

const POST_TYPES: CommentPostType[] = ["review", "news", "opinion"];

function getClientIp(headerList: Headers): string | null {
  const forwardedFor = headerList.get("x-forwarded-for");
  if (!forwardedFor) {
    return null;
  }

  return forwardedFor.split(",")[0]?.trim() ?? null;
}

function isValidPostType(value: string): value is CommentPostType {
  return POST_TYPES.includes(value as CommentPostType);
}

export async function createComment(
  _prevState: CreateCommentState,
  formData: FormData
): Promise<CreateCommentState> {
  const nickname = String(formData.get("nickname") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const postSlug = String(formData.get("postSlug") ?? "").trim();
  const postType = String(formData.get("postType") ?? "").trim();
  const honeypot = String(formData.get("_honeypot") ?? "").trim();
  const captchaToken = String(formData.get("captchaToken") ?? "");

  if (honeypot) {
    return { error: "No se pudo enviar el comentario." };
  }

  if (!isValidPostType(postType)) {
    return { error: "Tipo de publicación inválido." };
  }

  if (!postSlug || postSlug.length < 2 || postSlug.length > 120) {
    return { error: "Publicación inválida." };
  }

  if (!nickname || nickname.length < 2 || nickname.length > 20) {
    return { error: "El nickname debe tener entre 2 y 20 caracteres." };
  }

  if (!content || content.length < 3 || content.length > 300) {
    return { error: "El comentario debe tener entre 3 y 300 caracteres." };
  }

  const headerList = await headers();
  const ip = getClientIp(headerList);
  const captcha = await verifyTurnstileToken(captchaToken, ip ?? undefined);

  if (!captcha.ok) {
    return { error: "Captcha inválido o expirado. Intentá nuevamente." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("comments").insert({
    post_slug: postSlug,
    post_type: postType,
    nickname,
    content,
    status: "pending",
  });

  if (error) {
    return { error: "No se pudo guardar el comentario. Intentá más tarde." };
  }

  notifyDiscordModeration(nickname, content, postSlug, postType);
  
  return { success: true };
}
