import Link from "next/link";
import { FeaturedPost } from "../data/featured-post";
import { featuredPostTypeLabel } from "../utils/featured/post-type";
import StarDisplay from "./star-display";

type Props = {
  post: FeaturedPost;
};

export default function FeaturedPostHero({ post }: Props) {
  return (
    <section className="mt-10">
      <Link
        href={post.href}
        className="group block overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:border-slate-600"
      >
        <div className="md:grid md:grid-cols-2 md:items-stretch">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-800 md:aspect-auto md:min-h-[320px]">
            {post.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.coverImage}
                alt={post.coverAlt || post.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                Sin imagen
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center p-6 md:p-8 lg:p-10">
            <span className="inline-flex w-fit rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-medium text-slate-200">
              {featuredPostTypeLabel(post.type)}
            </span>

            <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-100 md:text-4xl lg:text-5xl">
              {post.title}
            </h2>

            {post.subtitle && (
              <p className="mt-3 text-lg text-slate-300 md:text-xl">
                {post.subtitle}
              </p>
            )}

            <p className="mt-4 line-clamp-4 text-base leading-relaxed text-slate-400 md:text-lg">
              {post.excerpt}
            </p>

            {post.rating != null && post.rating > 0 && (
              <StarDisplay value={post.rating} className="mt-5 text-xl" />
            )}

            <span className="mt-6 text-sm font-medium text-slate-200 underline-offset-4 group-hover:underline">
              Leer más
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
