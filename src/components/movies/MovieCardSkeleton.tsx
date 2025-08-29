// src/components/movies/MovieCardSkeleton.tsx
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const MovieCardSkeleton = () => {
  return (
    <Card
      role="status"                 // ✅ accessible role
      aria-label="Loading movie"    // ✅ accessible name (matches the test)
      aria-live="polite"
      aria-busy="true"
      data-testid="movie-skeleton"  // ✅ handy stable hook if you prefer getByTestId
      className="overflow-hidden animate-pulse"
    >
      <Skeleton className="aspect-[2/3] w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </Card>
  );
};
