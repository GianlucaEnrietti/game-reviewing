"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { createReview, updateReview } from "../../app/admin/actions";
import { Review } from "../../data/reviews";
import { slugify } from "../../utils/slug";
import StarRating from "./star-rating";
import MarkdownEditor from "./markdown-editor";

type FormValues = {
  title: string;
  slug: string;
  excerpt: string;
  genres: string;
  rating: number;
  content: string;
  finalThoughts: string;
  cover: FileList | null;
};

type Props = {
  review?: Review;
};

const inputClass =
  "w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-slate-500";
const labelClass = "mb-1 block text-sm font-medium text-slate-200";

export default function ReviewForm({ review }: Props) {
  const isEditing = Boolean(review);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      title: review?.title ?? "",
      slug: review?.slug ?? "",
      excerpt: review?.excerpt ?? "",
      genres: review?.genres.join(", ") ?? "",
      rating: review?.rating ?? 0,
      content: review?.content ?? "",
      finalThoughts: review?.final_thoughts ?? "",
      cover: null,
    },
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    review?.cover_image ?? null
  );

  const title = watch("title");
  const cover = watch("cover");

  useEffect(() => {
    if (!slugTouched) {
      setValue("slug", slugify(title || ""));
    }
  }, [title, slugTouched, setValue]);

  useEffect(() => {
    if (cover && cover.length > 0) {
      const url = URL.createObjectURL(cover[0]);
      setCoverPreview(url);
      return () => URL.revokeObjectURL(url);
    }

    if (isEditing && review?.cover_image) {
      setCoverPreview(review.cover_image);
      return;
    }

    setCoverPreview(null);
  }, [cover, isEditing, review?.cover_image]);

  async function onSubmit(values: FormValues) {
    setServerError(null);

    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("slug", values.slug);
    formData.append("excerpt", values.excerpt);
    formData.append("genres", values.genres);
    formData.append("rating", String(values.rating));
    formData.append("content", values.content);
    formData.append("finalThoughts", values.finalThoughts);

    if (values.cover && values.cover.length > 0) {
      formData.append("cover", values.cover[0]);
    }

    if (isEditing && review) {
      formData.append("reviewId", review.id);
    }

    const result = isEditing
      ? await updateReview(formData)
      : await createReview(formData);

    if (result?.error) {
      setServerError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className={labelClass} htmlFor="title">
          Título
        </label>
        <input
          id="title"
          className={inputClass}
          {...register("title", { required: "El título es obligatorio." })}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="slug">
          Slug (URL)
        </label>
        <input
          id="slug"
          className={inputClass}
          {...register("slug", {
            required: "El slug es obligatorio.",
            onChange: () => setSlugTouched(true),
          })}
        />
        {errors.slug && (
          <p className="mt-1 text-sm text-red-400">{errors.slug.message}</p>
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="excerpt">
          Extracto
        </label>
        <input
          id="excerpt"
          className={inputClass}
          {...register("excerpt", { required: "El extracto es obligatorio." })}
        />
        {errors.excerpt && (
          <p className="mt-1 text-sm text-red-400">{errors.excerpt.message}</p>
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="genres">
          Géneros (separados por coma)
        </label>
        <input
          id="genres"
          placeholder="RPG, Acción, Indie"
          className={inputClass}
          {...register("genres")}
        />
      </div>

      <div>
        <span className={labelClass}>Puntaje</span>
        <Controller
          control={control}
          name="rating"
          rules={{
            validate: (value) =>
              (value >= 0.5 && value <= 5) ||
              "Selecciona un puntaje entre 0.5 y 5.",
          }}
          render={({ field }) => (
            <StarRating value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.rating && (
          <p className="mt-1 text-sm text-red-400">{errors.rating.message}</p>
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="cover">
          Portada{isEditing ? " (opcional, reemplaza la actual)" : ""}
        </label>
        <input
          id="cover"
          type="file"
          accept="image/*"
          className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-slate-100"
          {...register("cover")}
        />
        {coverPreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverPreview}
            alt="Vista previa de portada"
            className="mt-3 h-40 w-full rounded-md object-cover"
          />
        )}
      </div>

      <div>
        <span className={labelClass}>Contenido (Markdown)</span>
        <Controller
          control={control}
          name="content"
          rules={{ required: "El contenido es obligatorio." }}
          render={({ field }) => (
            <MarkdownEditor value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-400">{errors.content.message}</p>
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="finalThoughts">
          Pensamientos finales
        </label>
        <textarea
          id="finalThoughts"
          rows={4}
          placeholder="Tu cierre personal sobre el juego..."
          className={`${inputClass} resize-y`}
          {...register("finalThoughts", {
            required: "Los pensamientos finales son obligatorios.",
          })}
        />
        {errors.finalThoughts && (
          <p className="mt-1 text-sm text-red-400">
            {errors.finalThoughts.message}
          </p>
        )}
      </div>

      {serverError && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-white disabled:opacity-60"
      >
        {isSubmitting
          ? "Guardando..."
          : isEditing
            ? "Guardar cambios"
            : "Publicar reseña"}
      </button>
    </form>
  );
}
