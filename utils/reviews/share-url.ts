import { headers } from "next/headers";

export async function getReviewShareUrl(slug: string): Promise<string> {
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (envSiteUrl) {
    return `${envSiteUrl.replace(/\/$/, "")}/reviews/${slug}`;
  }

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";

  if (host) {
    return `${protocol}://${host}/reviews/${slug}`;
  }

  return `http://localhost:3000/reviews/${slug}`;
}
