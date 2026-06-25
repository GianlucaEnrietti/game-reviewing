export type FeaturedPostType = "review" | "news" | "opinion";

export type FeaturedPostConfig = {
  post_type: FeaturedPostType | null;
  post_slug: string | null;
  updated_at: string | null;
};

export type FeaturedPost = {
  type: FeaturedPostType;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string;
  coverImage: string | null;
  coverAlt: string | null;
  href: string;
  rating?: number;
  createdAt: string;
};

export type FeaturedPostOption = {
  slug: string;
  title: string;
};
