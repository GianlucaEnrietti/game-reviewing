"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../utils/supabase/server";
import { verifyTurnstileToken } from "../../utils/security/turnstile";
import { logAuthEvent } from "../../utils/auth/logger";
import { isAdminUser } from "../../utils/auth/admin";
import { slugify } from "../../utils/slug";
import { uploadCoverImage } from "../../utils/storage/upload-cover";
import {
  parseReviewFormData,
  validateReviewFields,
} from "../../utils/reviews/review-form-data";

export type AuthActionState = {
  error?: string;
};

export type CreateReviewState = {
  error?: string;
};

export type UpdateReviewState = {
  error?: string;
};

export type CompleteInviteState = {
  error?: string;
};

const COVERS_BUCKET = "review-covers";

const initialState: AuthActionState = {};

function getClientIp(headerList: Headers): string | null {
  const forwardedFor = headerList.get("x-forwarded-for");
  if (!forwardedFor) {
    return null;
  }

  return forwardedFor.split(",")[0]?.trim() ?? null;
}

function revalidateReviewPaths(slugs: string[]) {
  revalidatePath("/admin");

  for (const slug of slugs) {
    if (slug) {
      revalidatePath(`/reviews/${slug}`);
    }
  }

  revalidatePath("/reviews");
  revalidatePath("/");
}

export async function signInAdmin(
  _prevState: AuthActionState = initialState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const captchaToken = String(formData.get("captchaToken") ?? "");
  const headerList = await headers();
  const userAgent = headerList.get("user-agent");
  const ip = getClientIp(headerList);

  if (!email || !password) {
    return { error: "Email y contraseña son obligatorios." };
  }

  const captcha = await verifyTurnstileToken(captchaToken, ip ?? undefined);
  const captchaStatus = captcha.reason === "captcha_not_configured"
    ? "skipped"
    : captcha.ok
      ? "passed"
      : "failed";

  if (!captcha.ok) {
    logAuthEvent({
      event: "sign_in",
      email,
      success: false,
      captcha: captchaStatus,
      ip,
      userAgent,
      errorCode: "captcha_failed",
      errorMessage: captcha.reason,
    });

    return { error: "Captcha inválido o expirado. Intenta nuevamente." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: {
      captchaToken: captchaToken || undefined,
    },
  });

  if (error) {
    logAuthEvent({
      event: "sign_in",
      email,
      success: false,
      captcha: captchaStatus,
      ip,
      userAgent,
      errorCode: error.code,
      errorMessage: error.message,
    });

    return { error: "Credenciales inválidas." };
  }

  const signedInEmail = data.user?.email?.toLowerCase() ?? "";
  const userId = data.user?.id ?? "";

  if (data.session) {
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  }

  const admin = userId ? await isAdminUser(supabase, userId) : false;

  if (!admin) {
    await supabase.auth.signOut();

    logAuthEvent({
      event: "sign_in",
      email: signedInEmail || email,
      success: false,
      captcha: captchaStatus,
      ip,
      userAgent,
      errorCode: "not_authorized",
      errorMessage: "user_role_not_admin",
    });

    return { error: "Esta cuenta no tiene permisos de administrador." };
  }

  logAuthEvent({
    event: "sign_in",
    email: signedInEmail,
    success: true,
    captcha: captchaStatus,
    ip,
    userAgent,
  });

  redirect("/admin");
}

const initialCompleteInviteState: CompleteInviteState = {};

export async function completeInviteSignup(
  _prevState: CompleteInviteState = initialCompleteInviteState,
  formData: FormData
): Promise<CompleteInviteState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const nickname = String(formData.get("nickname") ?? "").trim();

  if (nickname.length < 2) {
    return { error: "El nickname debe tener al menos 2 caracteres." };
  }

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error:
        "El enlace de invitación expiró o no es válido. Pide una nueva invitación.",
    };
  }

  if (await isAdminUser(supabase, user.id)) {
    redirect("/admin");
  }

  const { error: passwordError } = await supabase.auth.updateUser({ password });

  if (passwordError) {
    return { error: passwordError.message };
  }

  const { error: profileError } = await supabase.rpc("complete_invite_profile", {
    p_nickname: nickname,
  });

  if (profileError) {
    console.error("[auth] complete_invite_profile failed", {
      code: profileError.code,
      message: profileError.message,
    });
    return { error: "No se pudo guardar el perfil. Intenta de nuevo." };
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function createReview(
  formData: FormData
): Promise<CreateReviewState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdminUser(supabase, user.id))) {
    return { error: "No autorizado." };
  }

  const fields = parseReviewFormData(formData);
  const slug = fields.slugInput ? slugify(fields.slugInput) : slugify(fields.title);
  const validationError = validateReviewFields(fields, slug);

  if (validationError) {
    return { error: validationError };
  }

  const { coverImage, error: uploadError } = await uploadCoverImage(
    supabase,
    fields.cover,
    slug,
    COVERS_BUCKET
  );

  if (uploadError) {
    return { error: uploadError };
  }

  const { error: insertError } = await supabase.from("reviews").insert({
    title: fields.title,
    subtitle: fields.subtitle || null,
    slug,
    excerpt: fields.excerpt,
    content: fields.content,
    rating: fields.rating,
    cover_image: coverImage,
    cover_alt: fields.coverAlt || null,
    genres: fields.genres,
    author_id: user.id,
    final_thoughts: fields.finalThoughts,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return { error: "Ya existe una reseña con ese slug." };
    }

    return { error: insertError.message };
  }

  revalidateReviewPaths([slug]);
  redirect("/admin");
}

export async function updateReview(
  formData: FormData
): Promise<UpdateReviewState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdminUser(supabase, user.id))) {
    return { error: "No autorizado." };
  }

  const reviewId = String(formData.get("reviewId") ?? "").trim();

  if (!reviewId) {
    return { error: "Reseña no válida." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("reviews")
    .select("*")
    .eq("id", reviewId)
    .maybeSingle();

  if (fetchError || !existing) {
    return { error: "Reseña no encontrada." };
  }

  if (existing.author_id !== user.id) {
    return { error: "Solo puedes editar reseñas que hayas creado." };
  }

  const fields = parseReviewFormData(formData);
  const slug = fields.slugInput ? slugify(fields.slugInput) : slugify(fields.title);
  const validationError = validateReviewFields(fields, slug);

  if (validationError) {
    return { error: validationError };
  }

  const { coverImage, error: uploadError } = await uploadCoverImage(
    supabase,
    fields.cover,
    slug,
    COVERS_BUCKET
  );

  if (uploadError) {
    return { error: uploadError };
  }

  const { error: updateError } = await supabase
    .from("reviews")
    .update({
      title: fields.title,
      subtitle: fields.subtitle || null,
      slug,
      excerpt: fields.excerpt,
      content: fields.content,
      rating: fields.rating,
      genres: fields.genres,
      final_thoughts: fields.finalThoughts,
      cover_alt: fields.coverAlt || null,
      ...(coverImage ? { cover_image: coverImage } : {}),
    })
    .eq("id", reviewId)
    .eq("author_id", user.id);

  if (updateError) {
    if (updateError.code === "23505") {
      return { error: "Ya existe una reseña con ese slug." };
    }

    return { error: updateError.message };
  }

  revalidateReviewPaths([existing.slug as string, slug]);
  redirect("/admin");
}

export async function deleteReview(
  reviewId: string
): Promise<UpdateReviewState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdminUser(supabase, user.id))) {
    return { error: "No autorizado." };
  }

  if (!reviewId) {
    return { error: "Reseña no válida." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("reviews")
    .select("slug")
    .eq("id", reviewId)
    .maybeSingle<{ slug: string }>();

  if (fetchError || !existing) {
    return { error: "Reseña no encontrada." };
  }

  const { data: deleted, error: deleteError } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("author_id", user.id)
    .select("id")
    .maybeSingle();

  if (deleteError) {
    return { error: deleteError.message };
  }

  if (!deleted) {
    return { error: "Solo puedes eliminar reseñas que hayas creado." };
  }

  revalidateReviewPaths([existing.slug]);
  redirect("/admin");
}
