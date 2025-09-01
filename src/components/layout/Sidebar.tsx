import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Home, TrendingUp, Star, Clock, Calendar,
  User, LogIn, LogOut, Bookmark
} from "lucide-react";
import movieMuseLogo from "@/assets/movieMuseLogo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useMemo } from "react";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { Link } from "react-router-dom";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useQueries } from "@tanstack/react-query";
import { tmdbApi, getImageUrl } from "@/services/tmdb";
import type { SidebarProps } from "@/lib/types";

const mainCategories = [
  { id: "popular", label: "Popular", icon: Home },
  { id: "trending", label: "Trending", icon: TrendingUp },
  { id: "top_rated", label: "Top Rated", icon: Star },
  { id: "now_playing", label: "Now Playing", icon: Clock },
  { id: "upcoming", label: "Upcoming", icon: Calendar },
];

export const Sidebar = ({ activeCategory, onCategoryChange }: SidebarProps) => {
  const { user, loading, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  // watchlist count + tiny preview
  const { ids } = useWatchlist();
  const sampleIds = useMemo(() => ids.slice(0, 5), [ids]);

  // lightweight details for the preview row (first 5)
  const detailQueries = useQueries({
    queries: sampleIds.map((id) => ({
      queryKey: ["movie", id],
      queryFn: () => tmdbApi.getMovieDetails(id),
      staleTime: 5 * 60 * 1000,
      enabled: !!id,
    })),
  });

  const posters = detailQueries
    .map((q) => q.data?.poster_path)
    .filter(Boolean)
    .map((p) => getImageUrl(p!, "w200"));
  const watchlistButton = (
    <Button
      variant="ghost"
      className="w-full justify-between text-foreground/80 hover:bg-secondary/50 hover:!text-white"
      onClick={() => (user ? null : setAuthOpen(true))}
      asChild={!!user}   // when true, classes go onto <Link>
    >
      {user ? (
        <Link to="/watchlist" className="flex w-full items-center justify-between">
          <span className="flex items-center">
            <Bookmark className="w-4 h-4 mr-3" />
            Watchlist
          </span>
          <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/20 px-1.5 text-xs font-medium text-primary">
            {ids.length}
          </span>
        </Link>
      ) : (
        <span className="flex w-full items-center justify-between">
          <span className="flex items-center">
            <Bookmark className="w-4 h-4 mr-3" />
            Watchlist
          </span>
          <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/20 px-1.5 text-xs font-medium text-primary">
            {ids.length}
          </span>
        </span>
      )}
    </Button>
  );

  return (
    <Card className="w-[280px] h-fit p-0 bg-card/50 backdrop-blur-sm border-border/50 sticky top-24">
      {/* Logo */}
      <div className="px-2 pt-2 pb-2">
        <img src={movieMuseLogo} alt="MovieMuse" className="block h-24 md:h-28 lg:h-32 w-auto" />
      </div>
      <Separator className="bg-border/50" />

      <div className="p-6">
        {/* Browse */}
        <div className="space-y-2 mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Browse
          </h3>
          {mainCategories.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={activeCategory === id ? "default" : "ghost"}
              onClick={() => onCategoryChange(id)}
              className={`w-full justify-start text-left nav-button
      ${activeCategory === id
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-foreground/80 hover:bg-secondary/50 hover:!text-white"
                }`}
            >
              <Icon className="w-4 h-4 mr-3" />
              {label}
            </Button>
          ))}

        </div>

        <Separator className="my-4 bg-border/50" />

        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            My Library
          </h3>
          {watchlistButton}

          {posters.length > 0 && (
            <div className="mt-2 flex gap-2 overflow-hidden">
              {posters.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="h-16 w-12 rounded-md object-cover ring-1 ring-white/10"
                  loading="lazy"
                />
              ))}
            </div>
          )}
        </div>

        <Separator className="my-4 bg-border/50" />

        {/* Account */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Account
          </h3>

          {loading ? (
            <Button
              variant="ghost"
              className="w-full justify-start text-left nav-button"
              disabled
            >
              <User className="w-4 h-4 mr-3" />
              Loading…
            </Button>
          ) : user ? (
            <>
              <Button
                variant="ghost"
                className="w-full justify-start text-left nav-button hover:bg-secondary/50 hover:!text-white"
              >
                <User className="w-4 h-4 mr-3" />
                {user.displayName || user.email || "Profile"}
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start text-left nav-button hover:bg-secondary/50 hover:!text-white"
                onClick={() => signOut()}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="w-full justify-start text-left nav-button hover:bg-secondary/50 hover:!text-white"
                onClick={() => setAuthOpen(true)}
              >
                <LogIn className="w-4 h-4 mr-3" />
                Sign In
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start text-left nav-button"
                disabled
              >
                <User className="w-4 h-4 mr-3" />
                Profile
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Auth modal */}
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </Card>
  );
};
