"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  clearFeaturedPost,
  FeaturedActionState,
  setFeaturedPost,
} from "../../app/admin/featured-actions";
import {
  FeaturedPost,
  FeaturedPostConfig,
  FeaturedPostType,
} from "../../data/featured-post";
import { FeaturedPostOptionsByType } from "../../utils/featured/get-post-options";
import { featuredPostTypeLabel } from "../../utils/featured/post-type";
import StarDisplay from "../star-display";

const initialState: FeaturedActionState = {};

type Props = {
  config: FeaturedPostConfig | null;
  featured: FeaturedPost | null;
  options: FeaturedPostOptionsByType;
};

const inputClass =
  "w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-slate-500";
const labelClass = "mb-1 block text-sm font-medium text-slate-200";

function optionsForType(
  type: FeaturedPostType,
  options: FeaturedPostOptionsByType
) {
  if (type === "review") {
    return options.reviews;
  }

  if (type === "news") {
    return options.news;
  }

  return options.rambles;
}

export default function FeaturedPostForm({ config, featured, options }: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    setFeaturedPost,
    initialState
  );
  const [postType, setPostType] = useState<FeaturedPostType>(
    config?.post_type ?? "review"
  );
  const [postSlug, setPostSlug] = useState(config?.post_slug ?? "");
  const [clearError, setClearError] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const slugOptions = useMemo(
    () => optionsForType(postType, options),
    [postType, options]
  );

  const selectedExists = slugOptions.some((item) => item.slug === postSlug);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  async function handleClear() {
    const confirmed = window.confirm(
      "¿Quitar el post destacado de la home? Esta acción se puede revertir eligiendo otro post."
    );

    if (!confirmed) {
      return;
    }

    setIsClearing(true);
    setClearError(null);

    const result = await clearFeaturedPost();

    if (result?.error) {
      setClearError(result.error);
      setIsClearing(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="text-lg font-semibold text-slate-100">Destacado actual</h2>

        {!featured && (
          <p className="mt-3 text-sm text-slate-400">
            No hay ningún post destacado en la home.
          </p>
        )}

        {featured && (
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
            {featured.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featured.coverImage}
                alt={featured.coverAlt || featured.title}
                className="aspect-[21/9] w-full object-cover"
              />
            )}

            <div className="p-4">
              <span className="inline-flex rounded-full border border-slate-700 bg-slate-900 px-2.5 py-0.5 text-xs font-medium text-slate-200">
                {featuredPostTypeLabel(featured.type)}
              </span>

              <h3 className="mt-3 text-xl font-bold text-slate-100">
                {featured.title}
              </h3>

              {featured.subtitle && (
                <p className="mt-2 text-sm text-slate-300">{featured.subtitle}</p>
              )}

              <p className="mt-3 line-clamp-3 text-sm text-slate-400">
                {featured.excerpt}
              </p>

              {featured.rating != null && featured.rating > 0 && (
                <StarDisplay value={featured.rating} className="mt-3 text-base" />
              )}

              <Link
                href={featured.href}
                className="mt-4 inline-block text-sm text-slate-200 underline-offset-2 hover:underline"
              >
                Ver publicación
              </Link>
            </div>
          </div>
        )}

        {featured && (
          <div className="mt-4">
            <button
              type="button"
              onClick={handleClear}
              disabled={isClearing}
              className="rounded-md border border-red-500/40 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-60"
            >
              {isClearing ? "Quitando..." : "Quitar destacado"}
            </button>
            {clearError && (
              <p className="mt-2 text-sm text-red-400">{clearError}</p>
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100">
          Elegir post destacado
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Solo puede haber un destacado a la vez. Se mostrará en la home debajo
          del título del sitio.
        </p>

        <form action={formAction} className="mt-6 max-w-xl space-y-5">
          <div>
            <label className={labelClass} htmlFor="postType">
              Tipo
            </label>
            <select
              id="postType"
              name="postType"
              value={postType}
              onChange={(event) => {
                const nextType = event.target.value as FeaturedPostType;
                setPostType(nextType);
                setPostSlug("");
              }}
              className={inputClass}
            >
              <option value="review">Reseña</option>
              <option value="news">Noticia</option>
              <option value="opinion">Ramble</option>
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="postSlug">
              Publicación
            </label>
            <select
              id="postSlug"
              name="postSlug"
              value={postSlug}
              onChange={(event) => setPostSlug(event.target.value)}
              required
              className={inputClass}
            >
              <option value="" disabled>
                Selecciona una publicación
              </option>
              {slugOptions.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.title}
                </option>
              ))}
            </select>
            {slugOptions.length === 0 && (
              <p className="mt-2 text-sm text-slate-400">
                No hay publicaciones de este tipo todavía.
              </p>
            )}
            {postSlug && !selectedExists && (
              <p className="mt-2 text-sm text-amber-300">
                La publicación guardada ya no está en la lista. Elegí otra.
              </p>
            )}
          </div>

          {state.error && (
            <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {state.error}
            </p>
          )}

          {state.success && (
            <p
              className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
              role="status"
            >
              Destacado actualizado correctamente.
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || !postSlug || slugOptions.length === 0}
            className="rounded-md bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-white disabled:opacity-60"
          >
            {isPending ? "Guardando..." : "Guardar destacado"}
          </button>
        </form>
      </section>
    </div>
  );
}
