import { toAbsoluteUrl } from "./absolute-url";

export const DEFAULT_SHARE_IMAGE_PATH = "/vn-icon.png";

export async function getShareImageUrl(
  coverImage: string | null | undefined
): Promise<string> {
  if (coverImage?.trim()) {
    return toAbsoluteUrl(coverImage.trim());
  }

  return toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH);
}
