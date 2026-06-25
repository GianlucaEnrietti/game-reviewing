import { notFound } from "next/navigation";
import { Metadata } from "next";
import MarkdownContent from "../../../components/markdown-content";
import CommentsSection from "../../../components/comments/comments-section";
import { getNewsBySlug } from "../../../utils/news/get-news-by-slug";
import { getNewsTitle, getNewsExcerpt } from "../../../utils/news/format";
import { buildArticleShareMetadata } from "../../../utils/seo/article-metadata";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const newsItem = await getNewsBySlug(slug);

  if (!newsItem) {
    return { title: "Noticia no encontrada" };
  }

  const title = getNewsTitle(newsItem);
  const description = newsItem.subtitle || getNewsExcerpt(newsItem);

  return buildArticleShareMetadata({
    title,
    description,
    pagePath: `/noticias/${slug}`,
    coverImage: newsItem.cover_image,
    imageAlt: newsItem.cover_alt || title,
  });
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const newsItem = await getNewsBySlug(slug);

  if (!newsItem) {
    notFound();
  }

  const title = getNewsTitle(newsItem);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      {newsItem.cover_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={newsItem.cover_image}
          alt={newsItem.cover_alt || title}
          className="mb-8 aspect-video w-full rounded-xl object-cover"
        />
      )}

      <header className="mb-6">
        <h1 className="text-3xl font-bold">{title}</h1>

        {newsItem.subtitle && (
          <p className="mt-2 text-lg text-slate-300">{newsItem.subtitle}</p>
        )}

        {newsItem.author?.nickname && (
          <p className="mt-2 text-sm text-slate-400">
            Por {newsItem.author.nickname}
          </p>
        )}

        <p className="mt-2 text-sm text-slate-500">
          {new Date(newsItem.created_at).toLocaleDateString("es-AR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </header>

      <article className="prose prose-lg prose-invert mt-8 max-w-none prose-headings:font-bold prose-a:text-cyan-300 prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-code:text-cyan-200">
        <MarkdownContent content={newsItem.content} />
      </article>

      <CommentsSection postSlug={slug} postType="news" />
    </main>
  );
}
