import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type TargetAndTransition, type Transition } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, Play, Info, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { getImageUrl } from "@/services/tmdb";
import type { Props } from "@/lib/types";

export function HeroBannerCarousel({ movies, intervalMs = 6000 }: Props) {
    const [idx, setIdx] = useState(0);
    const [paused, setPaused] = useState(false);
    const reduceMotion = useReducedMotion();
    const timer = useRef<number | null>(null);

    const safeMovies = (movies ?? []).filter(Boolean).slice(0, 10);
    const count = safeMovies.length;

    // Preload backdrops to avoid flash between slides
    const preload = useMemo(
        () =>
            safeMovies.map((m) => getImageUrl(m.backdrop_path ?? null, "w780")),
        [safeMovies]
    );
    useEffect(() => {
        preload.forEach((src) => {
            const img = new Image();
            img.src = src;
        });
    }, [preload]);

    // Autoplay
    useEffect(() => {
        if (!count) return;
        if (paused) {
            if (timer.current) window.clearInterval(timer.current);
            timer.current = null;
            return;
        }
        timer.current = window.setInterval(() => {
            setIdx((i) => (i + 1) % count);
        }, Math.max(2500, intervalMs));
        return () => {
            if (timer.current) window.clearInterval(timer.current);
            timer.current = null;
        };
    }, [count, paused, intervalMs]);

    const go = (next: number) => setIdx((next + count) % count);
    const next = () => go(idx + 1);
    const prev = () => go(idx - 1);

    if (!count) return null;
    const movie = safeMovies[idx];

    // slide transition
    const slideTransition: Transition = {
        duration: 0.55,
        ease: [0.42, 0, 0.58, 1] as const, // cubic-bezier tuple
    };

    // Ken Burns (reduced-motion safe)
    const kbInitial: TargetAndTransition = reduceMotion
        ? { scale: 1, x: 0 }
        : { scale: 1.06, x: 8 };

    const kbAnimate: TargetAndTransition = reduceMotion
        ? { scale: 1, x: 0 }
        : { scale: 1, x: 0 };

    const kbTransition: Transition = reduceMotion
        ? { duration: 0 }
        : { duration: intervalMs / 1000 + 0.5, ease: [0.22, 1, 0.36, 1] as const };


    const bg = getImageUrl(movie.backdrop_path ?? null, "w780");

    return (
        <section
            className="relative rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-2xl"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            aria-roledescription="carousel"
            aria-label="Featured movies"
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, scale: 0.995, x: 12 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.995, x: -12 }}
                    transition={slideTransition}
                    className="relative"
                    aria-live="polite"
                >
                    {/* Ken-Burns background */}
                    <motion.div
                        initial={kbInitial}
                        animate={kbAnimate}
                        transition={kbTransition}
                        className="aspect-[21/9] md:aspect-[16/6] w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${bg})` }}
                    />
                    {/* overlays */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-0 flex items-center p-6 md:p-8 lg:p-10">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 text-sm text-yellow-300">
                                <Star className="h-4 w-4" />
                                <span>{(movie.vote_average ?? 0).toFixed(1)}</span>
                                <span className="text-white/70">•</span>
                                <span className="uppercase tracking-wide text-white/80">
                                    {movie.release_date?.slice(0, 4) ?? "—"}
                                </span>
                            </div>

                            <h1 className="mt-2 text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight drop-shadow">
                                {movie.title}
                            </h1>

                            <p className="mt-3 text-white/90 text-sm md:text-base leading-relaxed line-clamp-3">
                                {movie.overview}
                            </p>

                            <div className="mt-5 flex flex-wrap items-center gap-3">
                                <Link
                                    to={`/movie/${movie.id}`}
                                    className="inline-flex items-center gap-2 rounded-full bg-white text-neutral-900 px-5 py-2.5 font-medium shadow hover:shadow-lg transition"
                                >
                                    <Play className="h-5 w-5" />
                                    Watch Now
                                </Link>

                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="absolute inset-x-0 bottom-3 flex items-center justify-between px-3">
                <div className="flex items-center gap-1">
                    {safeMovies.map((m, i) => (
                        <button
                            key={m.id}
                            aria-label={`Go to slide ${i + 1}`}
                            onClick={() => go(i)}
                            className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-white" : "w-3 bg-white/50 hover:bg-white/70"}`}
                        />
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={prev}
                        className="hidden sm:inline-flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 backdrop-blur p-2 ring-1 ring-white/20"
                        aria-label="Previous"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={next}
                        className="hidden sm:inline-flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 backdrop-blur p-2 ring-1 ring-white/20"
                        aria-label="Next"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </section>
    );
}
