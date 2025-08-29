// src/services/tmdb.ts
import {
  Credits,
  Genre,
  MovieDetails,
  MoviesResponse,
  TmdbReviewsResponse,
  TmdbVideo, 
} from "@/lib/types";

export type TmdbVideosResponse = { id: number; results: TmdbVideo[] };

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY!;
const BASE_URL =
  import.meta.env.VITE_TMDB_BASE_URL ?? "https://api.themoviedb.org/3";
const IMAGE_BASE_URL =
  import.meta.env.VITE_TMDB_IMAGE_BASE_URL ?? "https://image.tmdb.org/t/p";

if (!TMDB_API_KEY && import.meta.env.MODE === "development") {
  console.error("[TMDB] Missing VITE_TMDB_API_KEY in your .env file");
}

const apiRequest = async (
  endpoint: string,
  params: Record<string, string | number> = {}
): Promise<any> => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append("api_key", TMDB_API_KEY);
  Object.entries(params).forEach(([k, v]) =>
    url.searchParams.append(k, String(v))
  );
  const response = await fetch(url.toString());
  if (!response.ok)
    throw new Error(`API request failed: ${response.statusText}`);
  return response.json();
};

export const tmdbApi = {
  getPopularMovies: (page = 1): Promise<MoviesResponse> =>
    apiRequest("/movie/popular", { page }),
  getTrendingMovies: (page = 1): Promise<MoviesResponse> =>
    apiRequest("/trending/movie/week", { page }),
  getTopRatedMovies: (page = 1): Promise<MoviesResponse> =>
    apiRequest("/movie/top_rated", { page }),
  getNowPlayingMovies: (page = 1): Promise<MoviesResponse> =>
    apiRequest("/movie/now_playing", { page }),
  getUpcomingMovies: (page = 1): Promise<MoviesResponse> =>
    apiRequest("/movie/upcoming", { page }),
  searchMovies: (query: string, page = 1): Promise<MoviesResponse> =>
    apiRequest("/search/movie", { query, page }),

  getMovieDetails: (id: number): Promise<MovieDetails> =>
    apiRequest(`/movie/${id}`),
  getMovieCredits: (id: number): Promise<Credits> =>
    apiRequest(`/movie/${id}/credits`),

  // typed videos
  getMovieVideos: (id: number): Promise<TmdbVideosResponse> =>
    apiRequest(`/movie/${id}/videos`),

  // Reviews
  getMovieReviews: (id: number, page = 1): Promise<TmdbReviewsResponse> =>
    apiRequest(`/movie/${id}/reviews`, { page }),

  getGenres: (): Promise<{ genres: Genre[] }> =>
    apiRequest("/genre/movie/list"),
};

export const getImageUrl = (
  path: string | null,
  size: "w200" | "w300" | "w500" | "w780" | "original" = "w500"
): string => (path ? `${IMAGE_BASE_URL}/${size}${path}` : "/placeholder.svg");

export const formatRuntime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};
export const formatRating = (rating: number): string => rating.toFixed(1);
export { TmdbVideo };

