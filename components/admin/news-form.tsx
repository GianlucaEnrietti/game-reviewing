"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { createNews, updateNews } from "../../app/admin/news-actions";
import { News } from "../../data/news";
import { slugify } from "../../utils/slug";
import { MAX_COVER_BYTES } from "../../utils/news/news-form-data";
import MarkdownEditor from "./markdown-editor";

type FormValues = {
  title: string;
  slug: string;
  content: string;
  coverAlt: string;
  cover: FileList | null;
};

type Props = {
  newsItem?: News;
};

const inputClass =
  "w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-slate-500";
const labelClass = "mb-1 block text-sm font-medium text-slate-200";

export default function NewsForm({ newsItem }: Props) {
  const isEditing = Boolean(newsItem);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      title: newsItem?.title ?? "",
      slug: newsItem?.slug ?? "",
      content: newsItem?.content ?? "",
      coverAlt: newsItem?.cover_alt ?? "",
      cover: null,
    },
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    newsItem?.cover_image ?? null
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

    if (isEditing && newsItem?.cover_image) {
      setCoverPreview(newsItem.cover_image);
      return;
    }

    setCoverPreview(null);
  }, [cover, isEditing, newsItem?.cover_image]);

  async function onSubmit(values: FormValues) {
    setServerError(null);

    if (values.cover && values.cover.length > 0 && values.cover[0].size > MAX_COVER_BYTES) {
      setServerError("La portada no puede superar los 5MB.");
      return;
    }

    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("slug", values.slug);
    formData.append("content", values.content);
    formData.append("coverAlt", values.coverAlt);

    if (values.cover && values.cover.length > 0) {
      formData.append("cover", values.cover[0]);
    }

    if (isEditing && newsItem) {
      formData.append("newsId", newsItem.id);
    }

    const result = isEditing
      ? await updateNews(formData)
      : await createNews(formData);

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
          placeholder="nueva-expansion-anunciada"
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
        <p className="mt-1 text-xs text-slate-400">
          Máximo 5 MB. Formatos de imagen habituales (JPG, PNG, WebP).
        </p>
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
        <label className={labelClass} htmlFor="coverAlt">
          Texto alternativo de la portada (opcional)
        </label>
        <input
          id="coverAlt"
          className={inputClass}
          placeholder="Descripción breve de la imagen para accesibilidad"
          {...register("coverAlt")}
        />
      </div>

      <div>
        <span className={labelClass}>Contenido (Markdown)</span>
        <p className="mb-2 text-xs text-slate-400">
          Para insertar YouTube o X, pegá la URL en una línea aparte o usá los
          botones del editor.
        </p>
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
            : "Publicar noticia"}
      </button>
    </form>
  );
}
