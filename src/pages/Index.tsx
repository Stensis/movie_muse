import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { tmdbApi } from '@/services/tmdb';
import { Header } from '@/components/layout/Header';
import { MovieGrid } from '@/components/movies/MovieGrid';
import { Pagination } from '@/components/navigation/Pagination';
import { Sidebar } from '@/components/layout/Sidebar';
import { useToast } from '@/hooks/use-toast';
import { HeroBannerCarousel } from '@/components/movies/HeroBanner';
import { Movie, MoviesResponse } from '@/lib/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const DEFAULT_CAT = 'popular';

export default function Index() {
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();

  // URL state
  const activeCategory = params.get('cat') || DEFAULT_CAT;
  const currentPage = Number(params.get('page') || 1);
  const searchQuery = params.get('q') || '';
  const sortBy = params.get('sort') || 'score';

  const fetchFn = useMemo<() => Promise<MoviesResponse>>(() => {
    if (searchQuery) return () => tmdbApi.searchMovies(searchQuery, currentPage);
    switch (activeCategory) {
      case 'trending':    return () => tmdbApi.getTrendingMovies(currentPage);
      case 'top_rated':   return () => tmdbApi.getTopRatedMovies(currentPage);
      case 'now_playing': return () => tmdbApi.getNowPlayingMovies(currentPage);
      case 'upcoming':    return () => tmdbApi.getUpcomingMovies(currentPage);
      default:            return () => tmdbApi.getPopularMovies(currentPage);
    }
  }, [activeCategory, currentPage, searchQuery]);

  const { data: moviesData, isLoading, isError } = useQuery<
    MoviesResponse,            // TQueryFnData
    Error,                     // TError
    MoviesResponse,            // TData (no select → same as TQueryFnData)
    (string | number)[]        // TQueryKey
  >({
    queryKey: ['movies', activeCategory, currentPage, searchQuery],
    queryFn: fetchFn,
    // v5 replacement for keepPreviousData:
    // keep showing previous page’s data while the next page loads
    placeholderData: (prev) => prev as MoviesResponse | undefined,
    retry: 2,
  });

  useEffect(() => {
    if (isError) {
      toast({
        title: 'Error loading movies',
        description: 'Please check your connection and try again',
        variant: 'destructive',
      });
    }
  }, [isError, toast]);

  // URL writers
  const handleCategoryChange = (category: string) => {
    const next = new URLSearchParams(params);
    next.set('cat', category);
    next.delete('q');      // clear search when changing category
    next.set('page', '1'); // reset page
    setParams(next, { replace: true });
  };

  const handleSearch = (query: string) => {
    const next = new URLSearchParams(params);
    next.set('q', query);
    next.set('cat', 'search');
    next.set('page', '1');
    setParams(next, { replace: true });
  };

  const handleSortChange = (value: string) => {
    const next = new URLSearchParams(params);
    next.set('sort', value);
    setParams(next, { replace: true });
  };

  const handlePageChange = (page: number) => {
    const next = new URLSearchParams(params);
    next.set('page', String(page));
    setParams(next, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Safely typed list for the grid
  const results: Movie[] = moviesData?.results ?? [];

  const sortedMovies: Movie[] = useMemo(() => {
    const list = [...results];
    switch (sortBy) {
      case 'popularity':
        return list.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
      case 'release_date':
        return list.sort(
          (a, b) => new Date(b.release_date ?? 0).getTime() - new Date(a.release_date ?? 0).getTime()
        );
      case 'title':
        return list.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''));
      default: // score
        return list.sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0));
    }
  }, [results, sortBy]);

  if (isLoading && !moviesData) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Header onSearch={handleSearch} onSortChange={handleSortChange} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block">
            <Sidebar activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
          </div>

          {/* Main */}
          <div className="space-y-8">
            {!searchQuery && sortedMovies.length > 0 && (
              <HeroBannerCarousel movies={sortedMovies.slice(0, 8)} />
            )}

            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">
                {searchQuery
                  ? `All Results for “${searchQuery}”`
                  : ({
                      popular: '🔥 Popular Movies',
                      trending: '📈 Trending Movies',
                      top_rated: '⭐ Top Rated Movies',
                      now_playing: '🎬 Now Playing',
                      upcoming: '🗓️ Coming Soon',
                    } as Record<string, string>)[activeCategory] ?? 'All Movies'}
              </h3>
            </div>

            <MovieGrid movies={sortedMovies} isLoading={isLoading} />

            {moviesData && moviesData.total_pages > 1 && (
              <Pagination
                currentPage={Math.max(1, currentPage)}
                totalPages={Math.min(moviesData.total_pages, 500)}
                totalResults={moviesData.total_results}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
