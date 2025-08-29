import { Button } from '@/components/ui/button';
import { PaginationProps } from '@/lib/types';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

export const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  maxVisiblePages = 5,
  totalResults
}: PaginationProps) => {
  const getVisiblePages = () => {
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);
    
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();
  const showLeftEllipsis = visiblePages[0] > 2;
  const showRightEllipsis = visiblePages[visiblePages.length - 1] < totalPages - 1;

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      {/* Results info */}
      {totalResults && (
        <div className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * 20) + 1}-{Math.min(currentPage * 20, totalResults)} of {totalResults.toLocaleString()} results
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="bg-secondary/50 border-border/50 hover:bg-secondary"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        {visiblePages[0] > 1 && (
          <>
            <Button
              variant={currentPage === 1 ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(1)}
              className="w-10 bg-secondary/50 border-border/50 hover:bg-secondary"
            >
              1
            </Button>
            {showLeftEllipsis && (
              <div className="flex items-center px-2">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </>
        )}

        {visiblePages.map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className={`w-10 ${
              currentPage === page 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary/50 border-border/50 hover:bg-secondary"
            }`}
          >
            {page}
          </Button>
        ))}

        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {showRightEllipsis && (
              <div className="flex items-center px-2">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <Button
              variant={currentPage === totalPages ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(totalPages)}
              className="w-10 bg-secondary/50 border-border/50 hover:bg-secondary"
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="bg-secondary/50 border-border/50 hover:bg-secondary"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">
        Page {currentPage} of {totalPages.toLocaleString()}
      </div>
    </div>
  );
};