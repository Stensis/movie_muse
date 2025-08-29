// src/components/ui/LoadingSpinner.tsx
import * as React from "react";
import { cn } from "@/lib/utils"; // if you don't have a cn helper, replace cn(...) with a template string

type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<SpinnerSize, number> = {
  xs: 16,
  sm: 22,
  md: 28,
  lg: 36,
  xl: 48,
};

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  label?: string;
}

export const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ size = "md", label, className, ...props }, ref) => {
    const px = SIZE_MAP[size];

    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-label={label || "Loading"}
        className={cn("inline-flex items-center gap-2", className)}
        {...props}
      >
        {/* Glow */}
        <span
          className="relative inline-block"
          style={{ width: px, height: px }}
        >
          <span className="absolute inset-0 rounded-full blur-[6px] opacity-70 pointer-events-none"
                style={{
                  background:
                    "conic-gradient(from 0deg, #FF7A00, #F59E0B, #A855F7, #FF7A00)",
                }}
          />
          {/* Ring spinner */}
          <svg
            className="relative animate-spin"
            style={{ width: px, height: px }}
            viewBox="0 0 24 24"
          >
            <defs>
              <linearGradient id="mm-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF7A00" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              className="opacity-20"
              strokeWidth="3"
              fill="none"
            />
            {/* Arc */}
            <path
              d="M21 12a9 9 0 0 0-9-9"
              stroke="url(#mm-ring)"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          {/* Center pulse (film lens vibe) */}
          <span className="absolute inset-0 grid place-items-center">
            <span className="h-[22%] w-[22%] rounded-full bg-white/70 dark:bg-white/80 animate-pulse" />
          </span>
        </span>

        {/* Optional label */}
        {label ? (
          <span className="text-sm text-muted-foreground">{label}</span>
        ) : (
          <span className="sr-only">Loading…</span>
        )}
      </div>
    );
  }
);
LoadingSpinner.displayName = "LoadingSpinner";
