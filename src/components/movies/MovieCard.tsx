// src/components/movies/MovieCard.tsx
import { Link } from "react-router-dom";
import { getImageUrl, formatRating } from "@/services/tmdb";
import { Card } from "@/components/ui/card";
import { Play, Star } from "lucide-react";
import { MovieCardProps } from "@/lib/types";

export const MovieCard = ({ movie, className = "" }: MovieCardProps) => {
  return (
    <Link to={`/movie/${movie.id}`} aria-label={movie.title}>
      <Card className={`movie-card cursor-pointer ${className}`}>
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg group">
          {/* Poster */}
          <img
            src={getImageUrl(movie.poster_path, "w500")}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          {/* Rating badge */}
          {movie.vote_average > 0 && (
            <div className="absolute top-3 right-3">
              <div className="rating-badge">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-foreground font-bold">
                  {formatRating(movie.vote_average)}
                </span>
              </div>
            </div>
          )}

          {/* Hover play hint */}
          <div className="play-button pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm">
              <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
            </div>
          </div>

          {/* ✅ Bottom overlay: OVERVIEW ONLY */}
          {movie.overview && (
            <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 bg-gradient-to-t from-background/85 via-background/40 to-transparent backdrop-blur-[2px]">
              <h6 className="text-sm font-semibold text-foreground line-clamp-2">
                {movie.title}
              </h6>
              <p
                className="text-xs md:text-[13px] text-muted-foreground/90 leading-relaxed line-clamp-3"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {movie.overview}
              </p>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};
