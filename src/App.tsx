import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { PublicLayout } from "@/components/layout/PublicLayout";
import Index from "./pages/Index";
import GalleryDetail from "./pages/GalleryDetail";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminGalleries from "./pages/admin/AdminGalleries";
import AdminPhotos from "./pages/admin/AdminPhotos";
import AdminPackages from "./pages/admin/AdminPackages";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminContent from "./pages/admin/AdminContent";
import AdminSections from "./pages/admin/AdminSections";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminSEO from "./pages/admin/AdminSEO";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/galerija/:slug" element={<GalleryDetail />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="galleries" element={<AdminGalleries />} />
                  <Route path="photos" element={<AdminPhotos />} />
                  <Route path="packages" element={<AdminPackages />} />
                  <Route path="messages" element={<AdminMessages />} />
                  <Route path="testimonials" element={<AdminTestimonials />} />
                  <Route path="content" element={<AdminContent />} />
                  <Route path="sections" element={<AdminSections />} />
                  <Route path="seo" element={<AdminSEO />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
