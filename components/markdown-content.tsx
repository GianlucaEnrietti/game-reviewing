"use client";

import { Children, isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import YoutubeEmbed from "./embeds/youtube-embed";
import XEmbed from "./embeds/x-embed";
import {
  getYoutubeVideoId,
  isXPostUrl,
  parseEmbedBlocks,
} from "../utils/markdown/embeds";

type Props = {
  content: string;
  className?: string;
};

type ParagraphEmbed =
  | { type: "youtube"; videoId: string }
  | { type: "x"; url: string };

function getParagraphEmbed(children: ReactNode): ParagraphEmbed | null {
  const nodes = Children.toArray(children);

  if (nodes.length !== 1) {
    return null;
  }

  const node = nodes[0];

  if (!isValidElement<{ href?: string }>(node) || !node.props.href) {
    return null;
  }

  const href = node.props.href;
  const youtubeId = getYoutubeVideoId(href);

  if (youtubeId) {
    return { type: "youtube", videoId: youtubeId };
  }

  if (isXPostUrl(href)) {
    return { type: "x", url: href };
  }

  return null;
}

function MarkdownBlock({ content }: { content: string }) {
  if (!content.trim()) {
    return null;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => {
          const embed = getParagraphEmbed(children);

          if (embed?.type === "youtube") {
            return <YoutubeEmbed videoId={embed.videoId} />;
          }

          if (embed?.type === "x") {
            return <XEmbed url={embed.url} />;
          }

          return <p>{children}</p>;
        },
        a: ({ href, children, ...props }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default function MarkdownContent({ content, className }: Props) {
  const blocks = parseEmbedBlocks(content);

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        if (block.type === "youtube") {
          return <YoutubeEmbed key={`yt-${index}`} videoId={block.videoId} />;
        }

        if (block.type === "x") {
          return <XEmbed key={`x-${index}`} url={block.url} />;
        }

        return <MarkdownBlock key={`md-${index}`} content={block.content} />;
      })}
    </div>
  );
}
