// src/components/layout/Header.tsx
import { useMemo } from "react";
import { SearchBar } from "@/components/ui/SearchBar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { HeaderProps } from "@/lib/types";

type Brand = { label: string; src: string };

const BRANDS: Brand[] = [
  { label: "Netflix", src: "https://images.ctfassets.net/y2ske730sjqp/1aONibCke6niZhgPxuiilC/2c401b05a07288746ddf3bd3943fbc76/BrandAssets_Logos_01-Wordmark.jpg?w=940" },
  { label: "Prime Video", src: "https://logos-world.net/wp-content/uploads/2021/04/Amazon-Prime-Video-Logo.jpg" },
  { label: "Disney+", src: "https://www.logo.wine/a/logo/Disney%2B/Disney%2B-White-Dark-Background-Logo.wine.svg" },
  { label: "Hulu", src: "https://greenhouse.hulu.com/app/uploads/sites/12/2023/10/logo-black-3up.svg" },
  { label: "IMAX", src: "https://e7.pngegg.com/pngimages/475/831/png-clipart-imax-logo-cinema-logos.png" },
  { label: "Apple TV+", src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSACrXhgsBlkJj0-ecpXZq9fMlHCF_Blz5dw&s" },
  { label: "YouTube", src: "https://pngdownload.io/wp-content/uploads/2024/03/YouTube-logo-video-platform-social-media-transparent-PNG-image-768x461.webp" },
];

function BrandChip({ b }: { b: Brand }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-1.5
                 ring-1 ring-white/10 hover:bg-white/10 transition-colors shrink-0"
      title={b.label}
    >
      {/* fixed square box + contain so logos don’t stretch */}
      <img
        src={b.src}
        alt={`${b.label} logo`}
        className="size-5 md:size-6 object-contain rounded-sm opacity-85 hover:opacity-100 transition"
        loading="lazy"
        decoding="async"
      />
      {/* show label on md+ only; icons only on mobile */}
      <span className="hidden md:inline text-xs font-medium text-foreground/80 tracking-wide">
        {b.label}
      </span>
    </span>
  );
}

function LeftServicesTicker() {
  // duplicate so the marquee can loop seamlessly
  const row = useMemo(() => [...BRANDS, ...BRANDS], []);
  return (
    <div className="group relative h-12 w-full overflow-hidden" aria-label="streaming brands">
      <div className="header-ticker flex items-center gap-3 whitespace-nowrap pr-4">
        {row.map((b, i) => <BrandChip key={`${b.label}-${i}`} b={b} />)}
      </div>

      {/* soft fades on edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}

export const Header = ({ onSearch, onSortChange }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="w-full pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <div className="grid grid-cols-2 items-center h-16 md:h-18">
          {/* LEFT 50%: logos */}
          <div className="pl-2 sm:pl-4 md:pl-6">
            <LeftServicesTicker />
          </div>

          {/* RIGHT 50%: search + sort */}
          <div className="pr-4 sm:pr-6 flex items-center gap-3">
            <div className="flex-1">
              <SearchBar onSearch={onSearch} placeholder="Search movies..." className="w-full" />
            </div>

            <Select defaultValue="score" onValueChange={onSortChange}>
              <SelectTrigger aria-label="Sort" className="w-[140px] h-10 bg-secondary/50 border-border/50">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Sort: Score</SelectItem>
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="release_date">Release Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </header>
  );
};
