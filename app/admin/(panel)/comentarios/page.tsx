import Link from "next/link";
import { createClient } from "../../../../utils/supabase/server";
import { Comment } from "../../../../data/comments";
import ApproveCommentButton from "../../../../components/admin/approve-comment-button";
import DeleteCommentButton from "../../../../components/admin/delete-comment-button";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function postLabel(type: Comment["post_type"]): string {
  if (type === "review") {
    return "Reseña";
  }
  if (type === "news") {
    return "Noticia";
  }
  return "Ramble";
}

function postUrl(type: Comment["post_type"], slug: string): string {
  if (type === "review") {
    return `/reviews/${slug}`;
  }
  if (type === "news") {
    return `/noticias/${slug}`;
  }
  return `/rambles/${slug}`;
}

export default async function AdminCommentsPage() {
  const supabase = await createClient();
  const { data: comments, error } = await supabase
    .from("comments")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Comment[]>();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-100">Comentarios</h1>
      <p className="mt-1 text-sm text-slate-400">
        Modera comentarios pendientes y elimina contenido inapropiado.
      </p>

      {error && (
        <p className="mt-4 text-sm text-red-400">
          No se pudieron cargar los comentarios.
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Autor</th>
              <th className="px-4 py-3 font-medium">Comentario</th>
              <th className="px-4 py-3 font-medium">Publicación</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(comments ?? []).map((comment) => (
              <tr
                key={comment.id}
                className="border-t border-slate-800 align-top text-slate-200"
              >
                <td className="px-4 py-3 font-medium">{comment.nickname}</td>
                <td className="px-4 py-3 text-slate-300">
                  <p className="line-clamp-3 max-w-md whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={postUrl(comment.post_type, comment.post_slug)}
                    className="text-slate-100 underline-offset-2 hover:underline"
                  >
                    {postLabel(comment.post_type)}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      comment.status === "approved"
                        ? "text-emerald-300"
                        : "text-amber-300"
                    }
                  >
                    {comment.status === "approved" ? "Aprobado" : "Pendiente"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {formatDate(comment.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {comment.status === "pending" && (
                      <ApproveCommentButton commentId={comment.id} />
                    )}
                    <DeleteCommentButton
                      commentId={comment.id}
                      nickname={comment.nickname}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {(comments ?? []).length === 0 && !error && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  Todavía no hay comentarios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
