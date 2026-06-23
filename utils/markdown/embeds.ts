export type EmbedBlock =
  | { type: "markdown"; content: string }
  | { type: "youtube"; url: string; videoId: string }
  | { type: "x"; url: string };

const YOUTUBE_LINE_RE =
  /^\s*(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})[^\s]*)\s*$/;

const YOUTUBE_MD_LINK_LINE_RE =
  /^\s*\[[^\]]*\]\((https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})[^)]*)\)\s*$/;

const X_LINE_RE =
  /^\s*(https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)[^\s]*)\s*$/;

const X_MD_LINK_LINE_RE =
  /^\s*\[[^\]]*\]\((https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)[^)]*)\)\s*$/;

export function getYoutubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id && id.length === 11 ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = parsed.searchParams.get("v");
      return id && id.length === 11 ? id : null;
    }
  } catch {
    return null;
  }

  return null;
}

export function isXPostUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    return (
      (host === "twitter.com" || host === "x.com") &&
      /\/status\/\d+/.test(parsed.pathname)
    );
  } catch {
    return false;
  }
}

export function parseEmbedBlocks(content: string): EmbedBlock[] {
  const blocks: EmbedBlock[] = [];
  const markdownLines: string[] = [];

  function flushMarkdown() {
    if (markdownLines.length === 0) {
      return;
    }

    blocks.push({ type: "markdown", content: markdownLines.join("\n") });
    markdownLines.length = 0;
  }

  for (const line of content.split("\n")) {
    const youtubeMatch =
      line.match(YOUTUBE_LINE_RE) ?? line.match(YOUTUBE_MD_LINK_LINE_RE);

    if (youtubeMatch) {
      flushMarkdown();
      blocks.push({
        type: "youtube",
        url: youtubeMatch[1],
        videoId: youtubeMatch[2],
      });
      continue;
    }

    const xMatch = line.match(X_LINE_RE) ?? line.match(X_MD_LINK_LINE_RE);

    if (xMatch) {
      flushMarkdown();
      blocks.push({ type: "x", url: xMatch[1] });
      continue;
    }

    markdownLines.push(line);
  }

  flushMarkdown();
  return blocks;
}
