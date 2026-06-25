import { headers } from "next/headers";

const ABSOLUTE_URL_REGEX = /^https?:\/\//i;

export async function getSiteOrigin(): Promise<string> {
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (envSiteUrl) {
    return envSiteUrl.replace(/\/$/, "");
  }

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";

  if (host) {
    return `${protocol}://${host}`;
  }

  return "http://localhost:3000";
}

export async function toAbsoluteUrl(urlOrPath: string): Promise<string> {
  if (ABSOLUTE_URL_REGEX.test(urlOrPath)) {
    return urlOrPath;
  }

  const origin = await getSiteOrigin();
  const normalizedPath = urlOrPath.startsWith("/") ? urlOrPath : `/${urlOrPath}`;

  return `${origin}${normalizedPath}`;
}
