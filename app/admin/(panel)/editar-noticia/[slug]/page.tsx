import { notFound } from "next/navigation";
import Link from "next/link";
import NewsForm from "../../../../../components/admin/news-form";
import { createClient } from "../../../../../utils/supabase/server";
import { getNewsForEdit } from "../../../../../utils/news/get-news-for-edit";

export const metadata = {
  title: "Editar noticia | Panel",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EditarNoticiaPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const newsItem = await getNewsForEdit(slug, user.id);

  if (!newsItem) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/noticias"
        className="text-sm text-slate-400 hover:text-slate-200"
      >
        ← Volver a noticias
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-slate-100">Editar noticia</h1>
      <p className="mt-1 text-sm text-slate-400">
        Modifica el slug, portada o contenido de tu nota.
      </p>

      <div className="mt-8">
        <NewsForm newsItem={newsItem} />
      </div>
    </div>
  );
}
