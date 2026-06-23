import { notFound } from "next/navigation";
import Link from "next/link";
import ReviewForm from "../../../../../components/admin/review-form";
import { createClient } from "../../../../../utils/supabase/server";
import { getReviewForEdit } from "../../../../../utils/reviews/get-review-for-edit";

export const metadata = {
  title: "Editar reseña | Panel",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EditarResenaPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const review = await getReviewForEdit(slug, user.id);

  if (!review) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin"
        className="text-sm text-slate-400 hover:text-slate-200"
      >
        ← Volver al panel
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-slate-100">Editar reseña</h1>
      <p className="mt-1 text-sm text-slate-400">
        Modifica los campos de tu reseña. Solo puedes editar contenido que hayas
        publicado.
      </p>

      <div className="mt-8">
        <ReviewForm review={review} />
      </div>
    </div>
  );
}
