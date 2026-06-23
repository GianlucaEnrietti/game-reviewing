export type News = {
  id: string;
  created_at: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string | null;
  cover_alt: string | null;
  author_id: string | null;
};

export type NewsWithAuthor = News & {
  author: { nickname: string | null } | null;
};
