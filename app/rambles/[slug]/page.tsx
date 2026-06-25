import { notFound } from "next/navigation";
import { Metadata } from "next";
import MarkdownContent from "../../../components/markdown-content";
import { getRambleBySlug } from "../../../utils/rambles/get-ramble-by-slug";
import {
  getRambleTitle,
  rambleExcerpt,
} from "../../../utils/rambles/format";
import { buildArticleShareMetadata } from "../../../utils/seo/article-metadata";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ramble = await getRambleBySlug(slug);

  if (!ramble) {
    return { title: "Ramble no encontrado" };
  }

  const title = getRambleTitle(ramble);
  const description = ramble.subtitle || rambleExcerpt(ramble.content);

  return buildArticleShareMetadata({
    title,
    description,
    pagePath: `/rambles/${slug}`,
    coverImage: ramble.cover_image,
    imageAlt: ramble.cover_alt || title,
  });
}

export default async function RambleDetailPage({ params }: Props) {
  const { slug } = await params;
  const ramble = await getRambleBySlug(slug);

  if (!ramble) {
    notFound();
  }

  const title = getRambleTitle(ramble);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      {ramble.cover_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ramble.cover_image}
          alt={ramble.cover_alt || title}
          className="mb-8 aspect-video w-full rounded-xl object-cover"
        />
      )}

      <header className="mb-6">
        <h1 className="text-3xl font-bold">{title}</h1>

        {ramble.subtitle && (
          <p className="mt-2 text-lg text-slate-300">{ramble.subtitle}</p>
        )}

        {ramble.author?.nickname && (
          <p className="mt-2 text-sm text-slate-400">
            Por {ramble.author.nickname}
          </p>
        )}

        <p className="mt-2 text-sm text-slate-500">
          {new Date(ramble.created_at).toLocaleDateString("es-AR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </header>

      <article className="prose prose-lg prose-invert mt-8 max-w-none prose-headings:font-bold prose-a:text-cyan-300 prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-code:text-cyan-200">
        <MarkdownContent content={ramble.content} />
      </article>
    </main>
  );
}
