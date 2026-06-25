import FeaturedPostForm from "../../../../components/admin/featured-post-form";
import { getFeaturedConfig } from "../../../../utils/featured/get-featured-config";
import { getFeaturedPost } from "../../../../utils/featured/get-featured-post";
import { getFeaturedPostOptions } from "../../../../utils/featured/get-post-options";

export const metadata = {
  title: "Destacado | Panel",
  robots: { index: false, follow: false },
};

export default async function AdminFeaturedPage() {
  const [config, featured, options] = await Promise.all([
    getFeaturedConfig(),
    getFeaturedPost(),
    getFeaturedPostOptions(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-100">Post destacado</h1>
      <p className="mt-1 text-sm text-slate-400">
        Elegí qué publicación aparece destacada en la home.
      </p>

      <div className="mt-8">
        <FeaturedPostForm config={config} featured={featured} options={options} />
      </div>
    </div>
  );
}
