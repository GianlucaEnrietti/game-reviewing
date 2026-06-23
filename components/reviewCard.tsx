import Link from "next/link";
import { Review } from "../data/reviews";

type Props = {
  review: Review;
};

export default function ReviewCard({ review }: Props) {
  return (
    <article className="border rounded-lg p-5 bg-white hover:shadow-md transition">
      <header>
        <span className="text-xs uppercase text-gray-500">
          Rating: {review.rating}/5
        </span>

        <h2 className="text-xl font-semibold leading-snug">
          {review.title}
        </h2>
      </header>

      <p className="mt-2 text-sm text-gray-600">
        {review.excerpt}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {review.genres.map((genre) => (
          <span
            key={genre}
            className="text-xs bg-gray-200 px-2 py-1 rounded"
          >
            {genre}
          </span>
        ))}
      </div>

      <div className="mt-4 text-right">
        <Link
          href={`/reviews/${review.slug}`}
          className="text-indigo-600 text-sm font-medium hover:underline"
        >
          Leer reseña →
        </Link>
      </div>
    </article>
  );
}
