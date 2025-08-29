import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { useWatchlist } from "@/hooks/useWatchlist";
import { tmdbApi, getImageUrl } from "@/services/tmdb";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ArrowLeft, BookmarkMinus, Trash2 } from "lucide-react";
import type { Movie } from "@/lib/types";

export default function Watchlist() {
    const navigate = useNavigate();
    const { ids, remove } = useWatchlist();

    const limited = useMemo(() => ids.slice(0, 40), [ids]);

    const results = useQueries({
        queries: limited.map((id) => ({
            queryKey: ["movie", id],
            queryFn: () => tmdbApi.getMovieDetails(id),
            staleTime: 1000 * 60 * 10,
            enabled: !!id,
        })),
    });

    const loading = results.some((r) => r.isLoading);
    const movies = results.map((r) => r.data).filter(Boolean) as Movie[];

    const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate("/"));

    const clearAll = () => {
        for (const id of ids) remove(id);
    };

    if (!ids.length) {
        return (
            <div className="container mx-auto px-4 py-12">
                <Button variant="ghost" className="mb-6 hover:bg-secondary/50" onClick={goBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <h1 className="text-2xl font-bold mb-4">My Watchlist</h1>
                <p className="text-muted-foreground mb-6">You haven’t added any movies yet.</p>
                <Link to="/"><Button>Browse movies</Button></Link>
            </div>
        );
    }

    if (loading) return <LoadingSpinner label="Loading your watchlist..." />;

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" className="hover:bg-secondary/50" onClick={goBack}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold">My Watchlist</h1>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                        {ids.length} item{ids.length > 1 ? "s" : ""}
                    </span>
                    <Button variant="outline" size="sm" onClick={clearAll}>
                        <Trash2 className="w-4 h-4 mr-2" /> Clear all
                    </Button>
                </div>
            </div>

            {/* Custom grid with an inline Remove action per card */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {movies.map((m) => {
                    const year = m.release_date ? new Date(m.release_date).getFullYear() : "—";
                    return (
                        <div key={m.id} className="group relative">
                            <Link to={`/movie/${m.id}`} className="block overflow-hidden rounded-xl ring-1 ring-border/50 bg-card/50">
                                <img
                                    src={getImageUrl(m.poster_path, "w500")}
                                    alt={m.title}
                                    className="aspect-[2/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                />
                            </Link>

                            {/* Remove button (shows on hover) */}
                            <button
                                aria-label="Remove from watchlist"
                                onClick={() => remove(m.id)}
                                className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/50 hover:bg-black/70 text-white px-2.5 py-1 opacity-0 group-hover:opacity-100 transition"
                                title="Remove from watchlist"
                            >
                                <BookmarkMinus className="w-4 h-4" />
                                <span className="hidden sm:inline text-xs">Remove</span>
                            </button>

                            <div className="mt-2">
                                <Link
                                    to={`/movie/${m.id}`}
                                    className="block text-sm font-semibold line-clamp-2 hover:underline"
                                >
                                    {m.title}
                                </Link>
                                <div className="text-xs text-muted-foreground">{year}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
