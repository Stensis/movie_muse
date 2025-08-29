import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  tmdbApi,
  getImageUrl,
  formatRuntime,
  formatRating,
  type TmdbVideosResponse,
  type TmdbVideo,
} from "@/services/tmdb";
import type { MovieDetails, Credits, TmdbReviewsResponse, TmdbReview } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ArrowLeft, Play, Plus, Star, Calendar, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

function useAuth() {
  return { isLoggedIn: false, userId: null as string | null };
}

// ---- Simple localStorage watchlist (works even without login) ----
function useWatchlist() {
  const key = "moviemuse_watchlist";
  const getAll = (): number[] => {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  };
  const [ids, setIds] = useState<number[]>(getAll());

  const add = (id: number) => {
    setIds((prev) => {
      const next = Array.from(new Set([...prev, id]));
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  };
  const remove = (id: number) => {
    setIds((prev) => {
      const next = prev.filter((x) => x !== id);
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  };
  const has = (id: number) => ids.includes(id);

  return { ids, add, remove, has };
}

// NEW: simple circular score (0–10) → % ring
function ScoreCircle({ score10 }: { score10: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(score10 * 10))); // 0–100
  const r = 28;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <div className="relative inline-block" aria-label={`User score ${pct}%`}>
      <svg width={72} height={72} viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} stroke="rgba(255,255,255,0.15)" strokeWidth="8" fill="none" />
        <circle
          cx="36"
          cy="36"
          r={r}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          className="text-emerald-400"
          strokeDasharray={`${dash} ${c - dash}`}
          transform="rotate(-90 36 36)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold">{pct}%</span>
      </div>
    </div>
  );
}

// Small helper for TMDB/Gravatar avatar paths
function avatarUrl(path?: string | null) {
  if (!path) return "/avatar_placeholder.png";
  const trimmed = path.startsWith("/") ? path.slice(1) : path;
  if (trimmed.startsWith("http")) return trimmed;
  // otherwise TMDB image path
  return `https://image.tmdb.org/t/p/w185${path}`;
}

export const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id || 0);
  const location = useLocation();

  const { isLoggedIn } = useAuth();
  const watchlist = useWatchlist();

  const [trailerOpen, setTrailerOpen] = useState(false);
  const [activeVideoKey, setActiveVideoKey] = useState<string | null>(null);

  // Details
  const { data: movie, isLoading: loadingMovie } = useQuery<MovieDetails, Error>({
    queryKey: ["movie", movieId],
    queryFn: () => tmdbApi.getMovieDetails(movieId),
    enabled: !!movieId,
  });

  // Credits
  const { data: credits } = useQuery<Credits, Error>({
    queryKey: ["movie-credits", movieId],
    queryFn: () => tmdbApi.getMovieCredits(movieId),
    enabled: !!movieId,
  });

  // Videos
  const { data: videos } = useQuery<TmdbVideosResponse, Error>({
    queryKey: ["movie-videos", movieId],
    queryFn: () => tmdbApi.getMovieVideos(movieId),
    enabled: !!movieId,
    staleTime: 1000 * 60 * 5,
  });

  // Pick the best YouTube trailer
  const candidates: TmdbVideo[] = useMemo(() => {
    return (videos?.results ?? [])
      .filter((v: any) => v.site === "YouTube")
      .sort((a: any, b: any) => {
        // Rank by: official trailers first, then Trailer > Teaser > Clip, then latest
        const typeRank = (t: string) =>
          t === "Trailer" ? 0 : t === "Teaser" ? 1 : t === "Clip" ? 2 : 3;
        const aRank = (a.official ? -1 : 0) * 10 + typeRank(a.type);
        const bRank = (b.official ? -1 : 0) * 10 + typeRank(b.type);
        if (aRank !== bRank) return aRank - bRank;
        const at = a.published_at ? new Date(a.published_at).getTime() : 0;
        const bt = b.published_at ? new Date(b.published_at).getTime() : 0;
        return bt - at;
      });
  }, [videos]);

  const bestKey = candidates[0]?.key ?? null;

  // ✅ Reviews query
  const { data: reviews, isLoading: loadingReviews } = useQuery<TmdbReviewsResponse, Error>({
    queryKey: ["movie-reviews", movieId],
    queryFn: () => tmdbApi.getMovieReviews(movieId),
    enabled: !!movieId,
    staleTime: 1000 * 60 * 5,
  });


  // Open trailer automatically if URL hash == #trailer
  useEffect(() => {
    if (location.hash === "#trailer" && bestKey) {
      setActiveVideoKey(bestKey);
      setTrailerOpen(true);
    }
  }, [location.hash, bestKey]);

  // Loading placeholder
  if (loadingMovie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <LoadingSpinner size="sm" label="Loading movie details..." />
          </div>

          <div className="grid lg:grid-cols-[300px_1fr] gap-8">
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <div className="aspect-[2/3] w-full bg-muted animate-pulse" />
              </Card>
            </div>
            <div className="space-y-4">
              <div className="h-12 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
              <div className="h-20 bg-muted animate-pulse rounded w-full" />
              <div className="flex gap-4">
                <div className="h-10 bg-muted animate-pulse rounded w-32" />
                <div className="h-10 bg-muted animate-pulse rounded w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-foreground">Movie not found</h1>
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const openTrailer = () => {
    const key = bestKey;
    if (key) {
      setActiveVideoKey(key);
      setTrailerOpen(true);
    } else {
      // Fallback: open YouTube search in new tab
      const q = encodeURIComponent(`${movie.title} trailer`);
      window.open(`https://www.youtube.com/results?search_query=${q}`, "_blank");
    }
  };

  const isInWatchlist = watchlist.has(movieId);

  const toggleWatchlist = () => {
    if (watchlist.has(movieId)) watchlist.remove(movieId);
    else watchlist.add(movieId);
  };

  return (
    <div className="relative min-h-[100dvh] bg-gradient-to-br from-background via-background to-muted overflow-x-hidden">
      {/* Backdrop */}
      {movie.backdrop_path && (
        <div className="absolute inset-0 z-0">
          <img
            src={getImageUrl(movie.backdrop_path, "original")}
            alt=""
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-8 hover:bg-secondary/50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="grid lg:grid-cols-[300px_1fr] gap-8 mb-12">
          {/* Poster */}
          <div className="space-y-4">
            <Card className="overflow-hidden movie-card">
              <img
                src={getImageUrl(movie.poster_path, "w500")}
                alt={movie.title}
                className="w-full aspect-[2/3] object-cover"
              />
            </Card>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-4 text-muted-foreground">
                {movie.release_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(movie.release_date).getFullYear()}</span>
                  </div>
                )}

                {movie.runtime ? (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                ) : null}

                <div className="flex items-center gap-2">
                  {movie.genres.slice(0, 3).map((g) => (
                    <span key={g.id} className="px-2 py-1 bg-secondary rounded-full text-xs">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>

              {!!movie.vote_average && movie.vote_average > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <div className="rating-badge text-lg px-3 py-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-foreground font-bold text-lg">
                      {formatRating(movie.vote_average)}
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    ({movie.vote_count.toLocaleString()} votes)
                  </span>
                </div>
              )}

              <div className="flex gap-4 mb-6">
                <Button
                  size="lg"
                  onClick={openTrailer}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Play className="w-5 h-5 mr-2" fill="currentColor" />
                  Watch Trailer
                </Button>

                <Button
                  variant={isInWatchlist ? "default" : "outline"}
                  size="lg"
                  className={
                    isInWatchlist
                      ? "bg-primary text-primary-foreground"
                      : "border-border/50"
                  }
                  onClick={toggleWatchlist}
                  title={
                    isLoggedIn
                      ? "Add/Remove from watchlist"
                      : "Adds to local watchlist (login to sync later)"
                  }
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {isInWatchlist ? "In Watchlist" : "Add Watchlist"}
                </Button>

              </div>
            </div>

            {movie.tagline && (
              <p className="text-lg italic text-primary/80 mb-4">{movie.tagline}</p>
            )}

            <div>
              <h2 className="text-xl font-semibold mb-3 text-foreground">Overview</h2>
              <p className="text-muted-foreground leading-relaxed">{movie.overview}</p>
            </div>
          </div>
        </div>

        {/* ---------- TABS: Cast / Ratings ---------- */}
        <Tabs defaultValue="cast" className="mb-12">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="cast">Cast</TabsTrigger>
            <TabsTrigger value="ratings">Ratings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Cast Tab */}
          <TabsContent value="cast" className="mt-6">
            {credits?.cast?.length ? (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Cast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-4">
                  {credits.cast.slice(0, 10).map((actor) => (
                    <Card
                      key={actor.id}
                      className="overflow-hidden text-center bg-card/50 backdrop-blur-sm"
                    >
                      <img
                        src={getImageUrl(actor.profile_path, "w200")}
                        alt={actor.name}
                        className="w-full aspect-square object-cover"
                      />
                      <div className="p-2">
                        <p className="font-semibold text-sm text-foreground line-clamp-2">
                          {actor.name}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {actor.character}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground mt-4">No cast information available.</p>
            )}
          </TabsContent>

          {/* Ratings Tab */}
          <TabsContent value="ratings" className="mt-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Ratings</h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 flex items-center gap-4 bg-card/50">
                <ScoreCircle score10={movie.vote_average ?? 0} />
                <div>
                  <div className="text-sm text-muted-foreground">TMDB User Score</div>
                  <div className="text-xl font-semibold">
                    {formatRating(movie.vote_average ?? 0)}/10
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {movie.vote_count.toLocaleString()} votes
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/50">
                <div className="text-sm text-muted-foreground mb-2">Score Trend</div>
                <div className="h-2 w-full rounded bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${Math.min(100, (movie.vote_average ?? 0) * 10)}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Average rating across all TMDB users.
                </div>
              </Card>

              <Card className="p-6 bg-card/50">
                <div className="text-sm text-muted-foreground">Popularity</div>
                <div className="text-2xl font-semibold">{Math.round(movie.popularity ?? 0)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Higher means more interactions recently.
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* ✅ Reviews Tab */}
          <TabsContent value="reviews" className="mt-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Reviews</h2>

            {loadingReviews ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <LoadingSpinner size="sm" />
                <span>Loading reviews…</span>
              </div>
            ) : !reviews?.results?.length ? (
              <p className="text-muted-foreground">No reviews yet.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {reviews.results.slice(0, 6).map((rev: TmdbReview) => {
                  const rating = rev.author_details?.rating;
                  const date = rev.created_at ? new Date(rev.created_at) : null;
                  return (
                    <Card key={rev.id} className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
                      <div className="flex items-start gap-3">
                        <img
                          src={avatarUrl(rev.author_details?.avatar_path)}
                          alt={rev.author}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-white/20"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-semibold text-foreground">{rev.author}</div>
                            {rating != null && (
                              <div className="flex items-center gap-1 text-sm">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{rating.toFixed(1)}/10</span>
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {date ? date.toLocaleDateString() : ""}
                          </div>
                          <p className="mt-3 text-sm text-foreground/90 leading-relaxed line-clamp-6">
                            {rev.content}
                          </p>
                          <div className="mt-3">
                            <a
                              href={rev.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm underline text-primary hover:opacity-80"
                            >
                              Read full review
                            </a>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Optional: link to TMDB reviews page if there are more */}
            {reviews && reviews.total_pages > 1 && (
              <div className="mt-4">
                <a
                  href={`https://www.themoviedb.org/movie/${movieId}/reviews`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline text-foreground/80 hover:text-foreground"
                >
                  View all reviews on TMDB
                </a>
              </div>
            )}
          </TabsContent>

        </Tabs>
      </div>

      {/* Trailer Modal */}
      <Dialog open={trailerOpen} onOpenChange={setTrailerOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="text-lg font-semibold">
              {movie.title} — Trailer
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full bg-black">
            {activeVideoKey ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${activeVideoKey}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={`${movie.title} Trailer`}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No trailer found
              </div>
            )}
          </div>

          {candidates.length > 1 && (
            <div className="px-4 py-3 flex flex-wrap gap-2 border-t">
              {candidates.slice(0, 6).map((v) => (
                <button
                  key={v.id}
                  onClick={() => setActiveVideoKey(v.key)}
                  className={`px-3 py-1 rounded-full text-xs border ${activeVideoKey === v.key
                    ? "bg-accent text-accent-foreground border-transparent"
                    : "bg-secondary/60 text-foreground border-border hover:bg-secondary"
                    }`}
                  title={`${v.type}${v.official ? " · Official" : ""}`}
                >
                  {v.type}
                  {v.official ? " • Official" : ""}
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
