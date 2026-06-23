export type InviteHashParams = {
  accessToken: string;
  refreshToken: string;
  type: string;
};

export function parseInviteHash(hash: string): InviteHashParams | null {
  if (!hash.startsWith("#")) {
    return null;
  }

  const params = new URLSearchParams(hash.slice(1));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const type = params.get("type");

  if (!accessToken || !refreshToken || type !== "invite") {
    return null;
  }

  return { accessToken, refreshToken, type };
}

export function readInviteHashFromWindow(): InviteHashParams | null {
  if (typeof window === "undefined") {
    return null;
  }

  return parseInviteHash(window.location.hash);
}
