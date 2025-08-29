# 🎬 MovieMuse — A Cinematic Movie Discovery App

Discover, search, and track movies with a slick, cinematic UI. Built with **Vite + React (TypeScript)**, **Tailwind**, **shadcn/ui**, **React Query**, **Firebase Auth/Firestore**, and **TMDB**.

> **Note**: This product uses the **TMDB API** but is not endorsed or certified by TMDB. Streaming service logos are trademarks of their respective owners and used here for demonstration only.

---

## ✨ Features

- **Browse**: Popular, Trending, Top Rated, Now Playing, Upcoming
- **Search & Sort**: Full‑text search (TMDB) + sort by Score, Popularity, Release Date, Title
- **Movie Details**: Poster, backdrop, runtime, genres, tagline, overview
- **Trailers**: Best YouTube trailer auto‑picked; plays in a modal
- **Cast / Ratings / Reviews**: Organized tabs with TMDB data
- **Watchlist**  
  - Works **offline** via `localStorage`  
  - **Syncs to Firestore** when signed in (merges local + cloud)  
  - Separate **Watchlist** page with remove support and back button
- **Auth**: Email/Password + Google (Firebase)
- **Beautiful UI**: Dark “cinema” theme, hero banners, skeletons, and a **brand‑logo ticker** header
- **Fast & Typed**: React Query caching, TypeScript models, Vite dev server

---

## 🧰 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui, lucide-react, embla-carousel
- **Data**: @tanstack/react-query (caching, deduping, background refresh)
- **Auth/DB**: Firebase Auth + Firestore
- **Routing**: react-router-dom
- **Toasts**: sonner

---

## 🚀 Quick Start

### 1) Clone & Install

```bash
git clone https://github.com/Stensis/movie_muse.git
cd movie_muse
npm install
```

### 2) Create `.env.local`

```bash
# TMDB (v3)
VITE_TMDB_API_KEY=YOUR_TMDB_V3_KEY
# Optional (defaults shown)
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p

# Firebase (from your Firebase Console)
VITE_FIREBASE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-app
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef012345
```

> Vite only exposes variables that start with **`VITE_`**. Keep the file named **`.env.local`** (not committed).  
> Get a TMDB API v3 key here: https://www.themoviedb.org/settings/api

### 3) Firestore Rules (minimal)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /watchlists/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4) Run

```bash
npm run dev
```

Open the printed URL (Vite default is http://localhost:5173 unless you changed the port).

---

## 🗂️ Project Structure

```
src/
  assets/
  components/
    auth/
      AuthDialog.tsx
    layout/
      Header.tsx
      Sidebar.tsx
    movies/
      HeroBanner.tsx
      MovieCard.tsx
      MovieCardSkeleton.tsx
      MovieGrid.tsx
    navigation/
      Pagination.tsx
    ui/
      SearchBar.tsx
      LoadingSpinner.tsx
      ...shadcn components
  contexts/
    AuthContext.tsx
  hooks/
    useWatchlist.ts          # localStorage + Firestore sync
  lib/
    firebase.ts              # Firebase init (Auth + Firestore)
    types.ts                 # TMDB types (Movie, MoviesResponse, etc.)
  pages/
    Index.tsx                # Home (browse/search/sort)
    MovieDetail.tsx          # Details + trailer + cast/ratings/reviews tabs
    Watchlist.tsx            # User’s saved movies
    NotFound.tsx
  services/
    tmdb.ts                  # API client + helpers (getImageUrl, formatRuntime, ...)
  index.css                  # Tailwind theme & custom styles
  main.tsx                   # App entry (React Query + Auth providers)
```

---

## 🔌 Data & Caching

- `src/services/tmdb.ts` centralizes API calls (movies, details, credits, **videos**, **reviews**).
- **React Query** powers fetching & caching. Example:

```ts
const { data, isLoading } = useQuery({
  queryKey: ['movies', category, page, search],
  queryFn: fetchFn,
  placeholderData: (prev) => prev,   // keep previous page while next loads
  retry: 2,
});
```

---

## ⭐ Watchlist (Offline‑first)

- Logged out: items persist in **localStorage**.
- On login: local + cloud lists **merge** and update Firestore doc `watchlists/{uid}`:
  ```ts
  type WatchlistDoc = { ids: number[]; updatedAt: Timestamp };
  ```
- Hook API:

```ts
const { ids, has, add, remove, loading, saving, error } = useWatchlist();
```

---

## 🧭 Key Screens

- **Home** (`/`): edge‑to‑edge header (left: brand logos marquee, right: centered search + sort), sidebar categories, hero carousel, grid & pagination.
- **Details** (`/movie/:id`): backdrop + poster, runtime/genres/year, score badge, **trailer modal**, tabs: **Cast**, **Ratings**, **Reviews**.
- **Watchlist** (`/watchlist`): saved movies with **remove** and **back** button.

---

## 🧪 Scripts

```bash
npm run dev        # start Vite dev server
npm run build      # production build
npm run preview    # preview production build locally
npm run lint       # run eslint
```

---

## 📦 Deployment

- **Vercel**  
  - Build: `npm run build`
  - Output dir: `dist/`
  - Set the same **VITE_*** env vars in your hosting dashboard
  - Enable **SPA fallback** (all routes → `/index.html`) for React Router

---

## 🔧 Troubleshooting

- **React DOM types**: Use `createRoot` from `react-dom/client` (no default export).
- **React Query v5**: Replace old `keepPreviousData` with `placeholderData`.
- **Vite env vars**: Must be prefixed with `VITE_` (e.g., `VITE_TMDB_API_KEY`).
- **“Cannot find types for node / estree / json-schema”**: Ensure `@types/node` is installed and your editor uses the workspace TypeScript.
- **Firebase imports**: Use modern modular API from `firebase/*` (v9+ / v12).

---

## 🙏 Acknowledgements

- **TMDB** for the public movie data  
- **shadcn/ui**, **Radix**, **Tailwind** for the UI stack  
- Brand assets © their owners (Netflix, Prime Video, Disney+, Hulu, IMAX, Apple TV+, YouTube)

> This product uses the TMDB API but is not endorsed or certified by TMDB.

---

## 📄 License

MIT © 2025 Irene Njuguna

---

<!-- ## 📷 Screenshots (optional)

Place images in `/docs` and reference them here:

```
![Home](docs/home.png)
![Details](docs/details.png)
![Watchlist](docs/watchlist.png)
```