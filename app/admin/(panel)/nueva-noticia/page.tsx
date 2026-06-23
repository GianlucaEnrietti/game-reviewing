import NewsForm from "../../../../components/admin/news-form";

export const metadata = {
  title: "Nueva noticia | Panel",
  robots: { index: false, follow: false },
};

export default function NuevaNoticiaPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-100">Nueva noticia</h1>
      <p className="mt-1 text-sm text-slate-400">
        Publica una nota con slug, portada y contenido en Markdown.
      </p>

      <div className="mt-8">
        <NewsForm />
      </div>
    </div>
  );
}
