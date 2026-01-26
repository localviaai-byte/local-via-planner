import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CityWizard from "./pages/admin/CityWizard";
import CityDetail from "./pages/admin/CityDetail";
import PlaceWizard from "./pages/admin/PlaceWizard";
import AcceptInvite from "./pages/admin/AcceptInvite";
import ContributorDashboard from "./pages/admin/ContributorDashboard";

const queryClient = new QueryClient();

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, role, signOut } = useAuth();
  const [pendingInviteCode, setPendingInviteCode] = useState<string | null>(null);
  const [inviteChecked, setInviteChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkInvite() {
      if (!user || role) {
        setPendingInviteCode(null);
        setInviteChecked(true);
        return;
      }

      try {
        const { data } = await supabase
          .from("contributor_invites")
          .select("invite_code, status, expires_at")
          .eq("email", user.email ?? "")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (cancelled) return;

        const isExpired = data?.expires_at ? new Date(data.expires_at) < new Date() : false;
        setPendingInviteCode(!isExpired ? data?.invite_code ?? null : null);
      } catch {
        if (!cancelled) setPendingInviteCode(null);
      } finally {
        if (!cancelled) setInviteChecked(true);
      }
    }

    setInviteChecked(false);
    checkInvite();

    return () => {
      cancelled = true;
    };
  }, [user?.id, role]);
  
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
        {inviteChecked && pendingInviteCode && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">
              Sembra che tu abbia un invito in sospeso: completalo per attivare il tuo ruolo.
            </p>
            <a
              href={`/admin/invite/${pendingInviteCode}`}
              className="underline text-primary"
            >
              Completa invito
            </a>
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          Contatta un amministratore per richiedere l'accesso.
        </p>
        <button
          type="button"
          className="mt-6 text-sm underline text-muted-foreground"
          onClick={() => signOut()}
        >
          Esci
        </button>
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
            
            {/* Contributor routes */}
            <Route
              path="/contributor"
              element={
                <ProtectedRoute>
                  <ContributorDashboard />
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
