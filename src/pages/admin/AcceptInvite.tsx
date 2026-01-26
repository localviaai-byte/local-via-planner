import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type InviteStatus = 'loading' | 'valid' | 'invalid' | 'expired' | 'accepted' | 'processing' | 'success';

interface InviteData {
  id: string;
  email: string;
  role: string;
  assigned_city_id: string | null;
  permissions: string[];
  expires_at: string;
}

export default function AcceptInvite() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<InviteStatus>('loading');
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch invite on mount
  useEffect(() => {
    if (!code) {
      setStatus('invalid');
      return;
    }
    
    fetchInvite();
  }, [code]);
  
  const fetchInvite = async () => {
    try {
      const { data, error } = await supabase
        .from('contributor_invites')
        .select('*')
        .eq('invite_code', code)
        .single();
      
      if (error || !data) {
        setStatus('invalid');
        return;
      }
      
      // Check if already accepted
      if (data.status === 'accepted') {
        setStatus('accepted');
        return;
      }
      
      // Check if expired
      if (new Date(data.expires_at) < new Date()) {
        setStatus('expired');
        return;
      }
      
      setInvite(data as InviteData);
      setStatus('valid');
    } catch (err) {
      console.error('Error fetching invite:', err);
      setStatus('invalid');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!invite) return;
    
    // Validation
    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Le password non coincidono');
      return;
    }
    
    setStatus('processing');
    
    try {
      // 1. Create user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invite.email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/contributor`,
          data: {
            invited_via: code,
          }
        }
      });
      
      if (signUpError) {
        // Check if user already exists
        if (signUpError.message.includes('already registered')) {
          setError('Questo indirizzo email è già registrato. Prova ad accedere.');
          setStatus('valid');
          return;
        }
        throw signUpError;
      }
      
      if (!authData.user) {
        throw new Error('Errore nella creazione dell\'account');
      }
      
      // 2. Assign role using security definer function (bypasses RLS)
      const { data: roleResult, error: roleError } = await supabase
        .rpc('assign_role_from_invite', {
          _user_id: authData.user.id,
          _invite_code: code
        });
      
      if (roleError) {
        console.error('Error assigning role:', roleError);
        // Don't throw - the user account was created, admin can fix role later
      }
      
      // 3. Log the activity (invite status is updated by the function)
      await supabase.from('activity_logs').insert({
        user_id: authData.user.id,
        user_email: invite.email,
        action_type: 'create',
        entity_type: 'contributor',
        entity_id: authData.user.id,
        details: {
          role: invite.role,
          invited_via: code,
          assigned_city_id: invite.assigned_city_id,
        }
      });
      
      setStatus('success');
      toast.success('Account creato con successo!');
      
      // Redirect to contributor dashboard after a short delay
      setTimeout(() => {
        navigate('/contributor');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error accepting invite:', err);
      setError(err.message || 'Si è verificato un errore');
      setStatus('valid');
    }
  };
  
  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
      </div>
    );
  }
  
  // Invalid/Expired states
  if (status === 'invalid' || status === 'expired' || status === 'accepted') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="font-display text-2xl font-semibold mb-2">
            {status === 'invalid' && 'Invito non valido'}
            {status === 'expired' && 'Invito scaduto'}
            {status === 'accepted' && 'Invito già utilizzato'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {status === 'invalid' && 'Questo link di invito non è valido o non esiste.'}
            {status === 'expired' && 'Questo invito è scaduto. Chiedi un nuovo invito all\'amministratore.'}
            {status === 'accepted' && 'Questo invito è già stato utilizzato. Se hai già un account, accedi.'}
          </p>
          <Button onClick={() => navigate('/admin/login')}>
            Vai al login
          </Button>
        </motion.div>
      </div>
    );
  }
  
  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-olive/10 flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-olive" />
          </div>
          <h1 className="font-display text-2xl font-semibold mb-2">
            Benvenuto in LocalVia!
          </h1>
          <p className="text-muted-foreground mb-6">
            Il tuo account è stato creato. Stai per essere reindirizzato...
          </p>
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-terracotta" />
        </motion.div>
      </div>
    );
  }
  
  // Valid invite - show form
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-terracotta/10 flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-terracotta" />
          </div>
          <h1 className="font-display text-2xl font-semibold mb-2">
            Unisciti a LocalVia
          </h1>
          <p className="text-muted-foreground">
            Sei stato invitato come <span className="font-medium text-foreground">{invite?.role === 'local_contributor' ? 'Local Contributor' : invite?.role}</span>
          </p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-2xl border">
          {/* Email (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={invite?.email || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              L'email è precompilata dall'invito
            </p>
          </div>
          
          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Crea password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimo 6 caratteri"
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Conferma password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ripeti la password"
              required
            />
          </div>
          
          {/* Error message */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
          
          {/* Submit */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={status === 'processing'}
          >
            {status === 'processing' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creazione account...
              </>
            ) : (
              'Crea il mio account'
            )}
          </Button>
        </form>
        
        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Hai già un account?{' '}
          <button
            onClick={() => navigate('/admin/login')}
            className="text-terracotta hover:underline"
          >
            Accedi
          </button>
        </p>
      </motion.div>
    </div>
  );
}
