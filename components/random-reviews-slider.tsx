"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Review } from "../data/reviews";
import StarDisplay from "./star-display";

type Props = {
  reviews: Review[];
};

const AUTO_SCROLL_MS = 5000;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function useSlidesPerView() {
  const [slidesPerView, setSlidesPerView] = useState(1);

  useEffect(() => {
    const update = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setSlidesPerView(4);
        return;
      }

      if (window.matchMedia("(min-width: 768px)").matches) {
        setSlidesPerView(2);
        return;
      }

      setSlidesPerView(1);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return slidesPerView;
}

function ReviewSlide({ review }: { review: Review }) {
  return (
    <article className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-slate-800">
        {review.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={review.cover_image}
            alt={review.title}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-lg font-semibold leading-tight">
          {review.title}
        </h3>
        <StarDisplay value={review.rating} className="mt-1 text-base" />
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-300">
          {review.excerpt}
        </p>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <span>{formatDate(review.created_at)}</span>
          <Link
            href={`/reviews/${review.slug}`}
            className="font-medium text-slate-100 underline-offset-2 hover:underline"
          >
            Ver reseña
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function RandomReviewsSlider({ reviews }: Props) {
  const slidesPerView = useSlidesPerView();
  const containerRef = useRef<HTMLDivElement>(null);
  const [slideStep, setSlideStep] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const maxIndex = Math.max(0, reviews.length - slidesPerView);

  const goNext = useCallback(() => {
    setActiveIndex((current) => (current >= maxIndex ? 0 : current + 1));
  }, [maxIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const updateStep = () => {
      setSlideStep(container.clientWidth / slidesPerView);
    };

    updateStep();
    const observer = new ResizeObserver(updateStep);
    observer.observe(container);
    return () => observer.disconnect();
  }, [slidesPerView]);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (reviews.length <= slidesPerView) {
      return;
    }

    const timer = window.setInterval(goNext, AUTO_SCROLL_MS);
    return () => window.clearInterval(timer);
  }, [goNext, reviews.length, slidesPerView]);

  if (reviews.length === 0) {
    return (
      <p className="mt-4 text-sm text-slate-400">
        Todavía no hay reseñas para mostrar aquí.
      </p>
    );
  }

  const slideWidthClass =
    slidesPerView === 4
      ? "w-full md:w-1/2 lg:w-1/4"
      : slidesPerView === 2
        ? "w-full md:w-1/2"
        : "w-full";

  return (
    <div className="mt-5">
      <div ref={containerRef} className="overflow-hidden">
        <div
          className="flex items-stretch transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${activeIndex * slideStep}px)` }}
        >
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`box-border flex shrink-0 px-2 ${slideWidthClass}`}
            >
              <ReviewSlide review={review} />
            </div>
          ))}
        </div>
      </div>

      {reviews.length > slidesPerView && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Ir al grupo ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition ${
                index === activeIndex
                  ? "w-6 bg-slate-100"
                  : "w-2 bg-slate-600 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
