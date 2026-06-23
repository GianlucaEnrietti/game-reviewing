import type { SupabaseClient } from "@supabase/supabase-js";

function normalizeRole(role: string | null | undefined): string {
  return (role ?? "").trim().toLowerCase();
}

export async function isAdminUser(
  supabase: SupabaseClient,
  userId?: string
): Promise<boolean> {
  const { data: rpcResult, error: rpcError } = await supabase.rpc("is_admin");

  if (!rpcError && rpcResult === true) {
    return true;
  }

  if (rpcError) {
    console.warn("[auth] is_admin rpc unavailable, using fallback", {
      code: rpcError.code,
      message: rpcError.message,
    });
  }

  let resolvedUserId = userId;

  if (!resolvedUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    resolvedUserId = user?.id;
  }

  if (!resolvedUserId) {
    return false;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", resolvedUserId)
    .maybeSingle<{ role: string | null }>();

  if (error) {
    console.error("[auth] profiles role lookup failed", {
      code: error.code,
      message: error.message,
      userId: resolvedUserId,
    });
    return false;
  }

  if (!data) {
    console.error("[auth] no profile row for user", { userId: resolvedUserId });
    return false;
  }

  return normalizeRole(data.role) === "admin";
}
