export type CommentPostType = "review" | "news" | "opinion";
export type CommentStatus = "pending" | "approved";

export type Comment = {
  id: string;
  post_slug: string;
  post_type: CommentPostType;
  nickname: string;
  content: string;
  status: CommentStatus;
  created_at: string;
};
