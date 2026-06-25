import { createClient } from "../../utils/supabase/server";
import { Comment, CommentPostType } from "../../data/comments";
import CommentForm from "./comment-form";

type Props = {
  postSlug: string;
  postType: CommentPostType;
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function CommentsSection({ postSlug, postType }: Props) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_slug", postSlug)
    .eq("post_type", postType)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .returns<Comment[]>();

  const comments = data ?? [];

  return (
    <section className="mt-12 border-t border-slate-800 pt-8">
      <h2 className="text-2xl font-bold text-slate-100">Comentarios</h2>
      <p className="mt-1 text-sm text-slate-400">
        Deja tu mensaje. Los comentarios nuevos pasan por moderación.
      </p>

      <div className="mt-6">
        <CommentForm postSlug={postSlug} postType={postType} />
      </div>

      <div className="mt-8 space-y-4">
        {error && (
          <p className="text-sm text-red-400">
            No se pudieron cargar los comentarios en este momento.
          </p>
        )}

        {!error && comments.length === 0 && (
          <p className="text-sm text-slate-400">
            Todavía no hay comentarios aprobados.
          </p>
        )}

        {comments.map((comment) => (
          <article
            key={comment.id}
            className="rounded-lg border border-slate-800 bg-slate-900 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-slate-100">{comment.nickname}</p>
              <span className="text-xs text-slate-500">
                {formatDate(comment.created_at)}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
              {comment.content}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
