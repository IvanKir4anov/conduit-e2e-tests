// DTOs of the RealWorld API (https://docs.realworld.show), limited to what the tests use.

export interface NewUser {
  username: string;
  email: string;
  password: string;
}

export interface User {
  username: string;
  email: string;
  token: string;
  bio: string | null;
  image: string | null;
}

export interface NewArticle {
  title: string;
  description: string;
  body: string;
  tagList?: string[];
}

export interface Profile {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}

export type UserUpdate = Partial<Pick<NewUser, 'username' | 'email' | 'password'>> & {
  bio?: string;
  image?: string;
};

export interface ArticleQuery {
  tag?: string;
  author?: string;
  favorited?: string;
  limit?: number;
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  favorited: boolean;
  favoritesCount: number;
  author: Profile;
}

export interface Comment {
  id: number;
  body: string;
  author: Pick<Profile, 'username'>;
}
