import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CityWizard from "./pages/admin/CityWizard";
import CityDetail from "./pages/admin/CityDetail";
import PlaceWizard from "./pages/admin/PlaceWizard";
import AcceptInvite from "./pages/admin/AcceptInvite";

const queryClient = new QueryClient();

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, role } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="loading-text">Caricamento...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // Check if user has any role
  if (!role) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <h1 className="font-display text-xl font-semibold mb-2">Accesso non autorizzato</h1>
        <p className="text-muted-foreground mb-4">
          Non hai i permessi per accedere a questa area.
        </p>
        <p className="text-sm text-muted-foreground">
          Contatta un amministratore per richiedere l'accesso.
        </p>
      </div>
    );
  }
  
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/invite/:code" element={<AcceptInvite />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cities/new"
              element={
                <ProtectedRoute>
                  <CityWizard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cities/:cityId"
              element={
                <ProtectedRoute>
                  <CityDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cities/:cityId/places/new"
              element={
                <ProtectedRoute>
                  <PlaceWizard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/places/:id/edit"
              element={
                <ProtectedRoute>
                  <PlaceWizard />
                </ProtectedRoute>
              }
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
