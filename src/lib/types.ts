export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Credits {
  cast: Cast[];
  crew: Crew[];
}

export interface MoviesResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface ApiError {
  success: false;
  status_code: number;
  status_message: string;
}

// ///////////////PROPS

export interface MovieCardProps {
  movie: Movie;
  className?: string;
}

export type Props = {
  movies: Movie[];
  intervalMs?: number;
};

export interface MovieGridProps {
  movies: Movie[];
  isLoading?: boolean;
  className?: string;
}

export type TmdbReview = {
  id: string;
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null; 
  };
  content: string;
  created_at: string; 
  updated_at: string;
  url: string;       
};

export type TmdbReviewsResponse = {
  id: number;
  page: number;
  results: TmdbReview[];
  total_pages: number;
  total_results: number;
};

export interface HeaderProps {
  onSearch: (query: string) => void;
  onSortChange: (value: string) => void;
}

export interface SidebarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
  totalResults?: number;
}

// src/lib/types.ts
export interface TmdbVideo {
  id: string;
  key: string;
  name: string;
  site: string;              
  type: 'Trailer' | 'Teaser' | 'Clip' | string;
  official?: boolean;
  published_at?: string;
}

export interface TmdbVideosResponse {
  id?: number;
  results: TmdbVideo[];
}
