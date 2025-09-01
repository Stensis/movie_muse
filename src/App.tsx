import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppRoutes } from "@/routes/AppRoutes";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 2, refetchOnWindowFocus: false } },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <AppRoutes />
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
