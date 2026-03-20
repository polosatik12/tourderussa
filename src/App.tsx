import React, { Suspense, lazy } from "react";
import { suzdalRegistration, igoraRegistration, pushkinRegistration, moscowRegistration } from "./data/eventRegistrationData";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import CookieBanner from "./components/CookieBanner";

// Eagerly load only the homepage
import IndexPrototype6 from "./pages/IndexPrototype6";

// Retry wrapper for lazy imports (handles stale chunks after redeploy)
function lazyRetry(factory: () => Promise<any>) {
  return lazy(() =>
    factory().catch(() => {
      // Force reload on stale chunk error
      window.location.reload();
      return factory();
    })
  );
}

// Lazy-load everything else
const Reglament = lazyRetry(() => import("./pages/Reglament"));
const Partners = lazyRetry(() => import("./pages/Partners"));
const Contact = lazyRetry(() => import("./pages/Contact"));
const CorporateLiga = lazyRetry(() => import("./pages/CorporateLiga"));
const Calendar = lazyRetry(() => import("./pages/Calendar"));
const Auth = lazyRetry(() => import("./pages/Auth"));
const Dashboard = lazyRetry(() => import("./pages/Dashboard"));
const Profile = lazyRetry(() => import("./pages/Dashboard/Profile"));
const Participations = lazyRetry(() => import("./pages/Dashboard/Participations"));
const Documents = lazyRetry(() => import("./pages/Dashboard/Documents"));
const HealthCertificate = lazyRetry(() => import("./pages/Dashboard/HealthCertificate"));
const Insurance = lazyRetry(() => import("./pages/Dashboard/Insurance"));
const Payments = lazyRetry(() => import("./pages/Dashboard/Payments"));
const Cart = lazyRetry(() => import("./pages/Dashboard/Cart"));
const NotFound = lazyRetry(() => import("./pages/NotFound"));
const Suzdal = lazyRetry(() => import("./pages/Events/Suzdal"));
const Igora = lazyRetry(() => import("./pages/Events/Igora"));
const Pushkin = lazyRetry(() => import("./pages/Events/Pushkin"));
const Moscow = lazyRetry(() => import("./pages/Events/Moscow"));
const EventRegistration = lazyRetry(() => import("./pages/Events/EventRegistration"));
const NewsPage = lazyRetry(() => import("./pages/News"));
const NewsArticle = lazyRetry(() => import("./pages/News/NewsArticle"));
const Results = lazyRetry(() => import("./pages/Results"));
const ChuchaWorld = lazyRetry(() => import("./pages/ChuchaWorld"));
const MediaPage = lazyRetry(() => import("./pages/Media"));
const MediaPhotoGallery = lazyRetry(() => import("./pages/Media/MediaPhotoGallery"));
const MediaVideoGallery = lazyRetry(() => import("./pages/Media/MediaVideoGallery"));
const ProtectedRoute = lazyRetry(() => import("./components/auth/ProtectedRoute"));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
            <Route path="/" element={<IndexPrototype6 />} />
            <Route path="/reglament" element={<Reglament />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/corporate" element={<CorporateLiga />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:slug" element={<NewsArticle />} />
            <Route path="/events/suzdal" element={<Suzdal />} />
            <Route path="/events/igora" element={<Igora />} />
            <Route path="/events/pushkin" element={<Pushkin />} />
            <Route path="/events/moscow" element={<Moscow />} />
            <Route path="/results" element={<Results />} />
            <Route path="/chucha-world" element={<ChuchaWorld />} />
            <Route path="/media" element={<MediaPage />} />
            <Route path="/media/photo/:eventSlug" element={<MediaPhotoGallery />} />
            <Route path="/media/video/:eventSlug" element={<MediaVideoGallery />} />
            <Route path="/events/suzdal/registration" element={<EventRegistration {...suzdalRegistration} />} />
            <Route path="/events/igora/registration" element={<EventRegistration {...igoraRegistration} />} />
            <Route path="/events/pushkin/registration" element={<EventRegistration {...pushkinRegistration} />} />
            <Route path="/events/moscow/registration" element={<EventRegistration {...moscowRegistration} />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/dashboard/participations" element={<ProtectedRoute><Participations /></ProtectedRoute>} />
            <Route path="/dashboard/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            <Route path="/dashboard/health" element={<ProtectedRoute><HealthCertificate /></ProtectedRoute>} />
            <Route path="/dashboard/insurance" element={<ProtectedRoute><Insurance /></ProtectedRoute>} />
            <Route path="/dashboard/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
            <Route path="/dashboard/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <CookieBanner />
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
