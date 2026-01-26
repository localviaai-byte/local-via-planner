import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, AlertCircle, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';

type ViewMode = 'login' | 'forgot-password';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  const { user, isLoading, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      navigate('/admin', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        setError(error.message);
        setIsSubmitting(false);
      }
      // Don't navigate here - let useEffect handle it when auth state updates
    } catch (err) {
      setError('Si è verificato un errore. Riprova.');
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setResetEmailSent(true);
      }
    } catch (err) {
      setError('Si è verificato un errore. Riprova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="loading-text">Caricamento...</div>
      </div>
    );
  }

  // Forgot Password View
  if (viewMode === 'forgot-password') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-semibold text-foreground">
              Recupera Password
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Inserisci la tua email per ricevere il link di reset
            </p>
          </div>

          {/* Form */}
          <div className="card-editorial p-6">
            {resetEmailSent ? (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-2">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-foreground">
                  Abbiamo inviato un'email a <strong>{email}</strong> con le istruzioni per reimpostare la password.
                </p>
                <p className="text-xs text-muted-foreground">
                  Controlla anche la cartella spam se non trovi l'email.
                </p>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => {
                    setViewMode('login');
                    setResetEmailSent(false);
                    setEmail('');
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Torna al login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Invio in corso...' : 'Invia link di reset'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setViewMode('login');
                    setError(null);
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Torna al login
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            LocalVia
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Area Contributors
          </p>
        </div>

        {/* Form */}
        <div className="card-editorial p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-background pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    Resta connesso
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('forgot-password');
                    setError(null);
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Password dimenticata?
                </button>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? 'Caricamento...' 
                : isSignUp 
                  ? 'Registrati' 
                  : 'Accedi'
              }
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSignUp 
                ? 'Hai già un account? Accedi' 
                : 'Non hai un account? Registrati'
              }
            </button>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6">
          Accesso riservato ai contributor LocalVia
        </p>
      </motion.div>
    </div>
  );
}
