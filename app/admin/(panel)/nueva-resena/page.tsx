import ReviewForm from "../../../../components/admin/review-form";

export const metadata = {
  title: "Nueva reseña | Panel",
  robots: { index: false, follow: false },
};

export default function NuevaResenaPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-100">Nueva reseña</h1>
      <p className="mt-1 text-sm text-slate-400">
        Completa los campos y publica la reseña en el sitio.
      </p>

      <div className="mt-8">
        <ReviewForm />
      </div>
    </div>
  );
}
