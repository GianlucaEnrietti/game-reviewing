import { notFound } from "next/navigation";
import { Metadata } from "next";
import StarDisplay from "../../../components/star-display";
import ReviewShareButtons from "../../../components/review-share-buttons";
import MarkdownContent from "../../../components/markdown-content";
import { getReviewBySlug } from "../../../utils/reviews/get-review-by-slug";
import { getReviewShareUrl } from "../../../utils/reviews/share-url";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const review = await getReviewBySlug(slug);

  if (!review) {
    return {
      title: "Review no encontrada",
    };
  }

  return {
    title: review.title,
    description: review.excerpt,
    openGraph: {
      title: review.title,
      description: review.excerpt,
      type: "article",
    },
  };
}


type Props = {
    params: Promise<{
        slug: string;
    }>;
};

export default async function ReviewPage({ params }: Props) {
    const { slug } = await params;
    const review = await getReviewBySlug(slug);

    if (!review) {
        notFound();
    }

    const shareUrl = await getReviewShareUrl(slug);

    return (
        <main className="max-w-3xl mx-auto px-4 py-10">
            {review.cover_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={review.cover_image}
                    alt={review.cover_alt || review.title}
                    className="mb-8 aspect-video w-full rounded-xl object-cover"
                />
            )}

            <header className="mb-6">
                <h1 className="text-3xl font-bold">
                    {review.title}
                </h1>

                {review.author?.nickname && (
                    <p className="mt-2 text-sm text-slate-400">
                        Escrito por: {review.author.nickname}
                    </p>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                        {review.genres.map((genre) => (
                            <span
                                key={genre}
                                className="text-xs bg-slate-800 text-slate-200 px-2 py-1 rounded"
                            >
                                {genre}
                            </span>
                        ))}
                    </div>

                    <ReviewShareButtons url={shareUrl} title={review.title} />
                </div>
            </header>

            <article className="prose prose-lg prose-invert mt-8 max-w-none prose-headings:font-bold prose-a:text-cyan-300 prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-code:text-cyan-200">
                <MarkdownContent content={review.content} />
            </article>

            {(review.final_thoughts || review.rating > 0) && (
                <section className="mt-10 rounded-xl border border-slate-800 bg-slate-900 p-6">
                    <h2 className="text-lg font-semibold text-slate-100">
                        Pensamientos finales
                    </h2>

                    <div className="mt-4 flex items-center gap-3">
                        <StarDisplay value={review.rating} className="text-2xl" />
                        <span className="text-base font-semibold text-slate-200">
                            {review.rating}/5
                        </span>
                    </div>

                    {review.final_thoughts && (
                        <p className="mt-4 text-base leading-relaxed text-slate-300">
                            {review.final_thoughts}
                        </p>
                    )}
                </section>
            )}

        </main>
    );
}
