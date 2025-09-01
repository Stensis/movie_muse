// src/components/movies/MovieCardSkeleton.tsx
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const MovieCardSkeleton = () => {
  return (
    <Card
      role="status"                 
      aria-label="Loading movie"    
      aria-live="polite"
      aria-busy="true"
      data-testid="movie-skeleton" 
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
