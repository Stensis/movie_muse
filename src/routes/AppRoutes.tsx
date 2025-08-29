import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import { MovieDetail } from "@/pages/MovieDetail";
import NotFound from "@/pages/NotFound";
import Watchlist from "@/pages/Watchlist";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/movie/:id" element={<MovieDetail />} />
      <Route path="/watchlist" element={<Watchlist />} />   
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};