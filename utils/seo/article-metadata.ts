import type { Metadata } from "next";
import { SITE_NAME } from "../site-metadata";
import { toAbsoluteUrl } from "./absolute-url";
import { getShareImageUrl } from "./share-image";

type ArticleShareMetadataInput = {
  title: string;
  description: string;
  pagePath: string;
  coverImage: string | null | undefined;
  imageAlt: string;
};

export async function buildArticleShareMetadata(
  input: ArticleShareMetadataInput
): Promise<Pick<Metadata, "title" | "description" | "openGraph" | "twitter">> {
  const pageUrl = await toAbsoluteUrl(input.pagePath);
  const shareImage = await getShareImageUrl(input.coverImage);

  return {
    title: input.title,
    description: input.description,
    openGraph: {
      url: pageUrl,
      title: input.title,
      description: input.description,
      type: "article",
      siteName: SITE_NAME,
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: input.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [shareImage],
    },
  };
}
