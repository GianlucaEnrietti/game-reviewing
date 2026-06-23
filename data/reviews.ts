export type Review = {
  id: string;
  created_at: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  rating: number;
  cover_image: string | null;
  genres: string[];
  author_id: string | null;
  final_thoughts: string | null;
};

export type ReviewWithAuthor = Review & {
  author: { nickname: string | null } | null;
};
