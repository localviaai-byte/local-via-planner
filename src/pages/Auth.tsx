import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, AlertCircle, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';

type ViewMode = 'auth' | 'forgot-password';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('auth');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const { user, isLoading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect destination from query params
  const redirectTo = new URLSearchParams(location.search).get('redirect') || '/';

  useEffect(() => {
    if (user && !isLoading) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, isLoading, navigate, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
          setIsSubmitting(false);
        } else {
          setSignUpSuccess(true);
          setIsSubmitting(false);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
          setIsSubmitting(false);
        }
      }
    } catch {
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
        redirectTo: `https://www.localvia.app/reset-password`,
      });
      if (error) setError(error.message);
      else setResetEmailSent(true);
    } catch {
      setError('Si è verificato un errore. Riprova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="loading-text">Caricamento...</div>
      </div>
    );
  }

  // Sign up success
  if (signUpSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/20 mb-4">
            <CheckCircle className="w-7 h-7 text-accent" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-foreground mb-2">Controlla la tua email</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Abbiamo inviato un link di conferma a <strong>{email}</strong>. Clicca sul link per attivare il tuo account.
          </p>
          <Button variant="outline" onClick={() => { setSignUpSuccess(false); setIsSignUp(false); }}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna al login
          </Button>
        </motion.div>
      </div>
    );
  }

  // Forgot password view
  if (viewMode === 'forgot-password') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Recupera Password</h1>
            <p className="text-sm text-muted-foreground mt-1">Inserisci la tua email per ricevere il link di reset</p>
          </div>

          <div className="card-editorial p-6">
            {resetEmailSent ? (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-2">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-foreground">
                  Abbiamo inviato un'email a <strong>{email}</strong> con le istruzioni per reimpostare la password.
                </p>
                <Button variant="outline" className="w-full mt-4" onClick={() => { setViewMode('auth'); setResetEmailSent(false); setEmail(''); }}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Torna al login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input id="reset-email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-background" />
                </div>
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Invio in corso...' : 'Invia link di reset'}
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => { setViewMode('auth'); setError(null); }}>
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Local<span className="text-primary">Via</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {isSignUp ? 'Crea il tuo account per salvare i tuoi itinerari' : 'Accedi per sbloccare l\'itinerario completo'}
          </p>
        </div>

        {/* Toggle tabs */}
        <div className="flex mb-6 bg-muted rounded-xl p-1">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(null); }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              !isSignUp ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground'
            }`}
          >
            Accedi
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(null); }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              isSignUp ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground'
            }`}
          >
            Registrati
          </button>
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
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { setViewMode('forgot-password'); setError(null); }}
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

            <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
              {isSubmitting ? 'Caricamento...' : isSignUp ? 'Crea account' : 'Accedi'}
            </Button>
          </form>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Torna alla home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
