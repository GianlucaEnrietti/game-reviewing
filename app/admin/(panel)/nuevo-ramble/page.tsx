import RambleForm from "../../../../components/admin/ramble-form";

export const metadata = {
  title: "Nuevo ramble | Panel",
  robots: { index: false, follow: false },
};

export default function NuevoRamblePage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-100">Nuevo ramble</h1>
      <p className="mt-1 text-sm text-slate-400">
        Publica una opinión con slug, portada y contenido en Markdown.
      </p>

      <div className="mt-8">
        <RambleForm />
      </div>
    </div>
  );
}
