import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Loader2, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function AcceptPartnerInvite() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (code) fetchInvite();
  }, [code]);

  useEffect(() => {
    if (user && invite && !accepting) {
      acceptInvite();
    }
  }, [user, invite]);

  const fetchInvite = async () => {
    const { data, error } = await supabase
      .from('partner_invites')
      .select('*')
      .eq('invite_code', code!)
      .eq('status', 'pending')
      .maybeSingle();

    if (error || !data) {
      setError('Invito non trovato o scaduto.');
    } else if (new Date(data.expires_at) < new Date()) {
      setError('Questo invito è scaduto.');
    } else {
      setInvite(data);
      setEmail(data.email);
    }
    setLoading(false);
  };

  const acceptInvite = async () => {
    if (!user || !code) return;
    setAccepting(true);
    try {
      const { data, error } = await supabase.rpc('assign_partner_from_invite', {
        _user_id: user.id,
        _invite_code: code,
      });
      if (error) throw error;
      if (!data) throw new Error('Invito non valido');
      toast.success('Benvenuto come partner!');
      // Force reload to pick up new role
      window.location.href = '/partner';
    } catch (err: any) {
      setError(err.message);
      setAccepting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Le password non coincidono');
      return;
    }
    if (password.length < 6) {
      toast.error('La password deve avere almeno 6 caratteri');
      return;
    }
    setAccepting(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `https://www.localvia.app/partner/invite/${code}` },
    });
    if (error) {
      toast.error(error.message);
      setAccepting(false);
    } else {
      toast.success('Registrazione completata! Controlla la tua email per confermare.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccepting(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setAccepting(false);
    } else if (data.user && invite) {
      // Directly call acceptInvite after successful login
      try {
        const { data: result, error: rpcError } = await supabase.rpc('assign_partner_from_invite', {
          _user_id: data.user.id,
          _invite_code: code!,
        });
        if (rpcError) throw rpcError;
        if (!result) throw new Error('Invito non valido');
        toast.success('Benvenuto come partner!');
        window.location.href = '/partner';
      } catch (err: any) {
        setError(err.message);
        setAccepting(false);
      }
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold mb-2">Errore</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>Torna alla home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accepting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-terracotta mx-auto" />
          <p className="text-muted-foreground">Attivazione in corso...</p>
        </div>
      </div>
    );
  }

  // User not logged in — show register/login form
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MapPin className="w-6 h-6 text-terracotta" />
              <span className="font-display text-xl font-semibold">LocalVia</span>
            </div>
            <h2 className="font-display text-lg font-semibold">Invito Partner</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sei stato invitato come <strong>{invite?.partner_type === 'referral' ? 'Referral' : 'Affiliate'} Partner</strong>
              {invite?.company_name && <> per <strong>{invite.company_name}</strong></>}.
            </p>
          </div>

          <form onSubmit={showRegister ? handleRegister : handleLogin} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {showRegister && (
              <div>
                <Label>Conferma Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pr-10"
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-destructive mt-1">Le password non coincidono</p>
                )}
              </div>
            )}
            <Button type="submit" className="w-full bg-terracotta hover:bg-terracotta/90">
              {showRegister ? 'Registrati e accetta' : 'Accedi e accetta'}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              className="text-sm text-muted-foreground underline hover:text-foreground"
              onClick={() => setShowRegister(!showRegister)}
            >
              {showRegister ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
