import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, LogOut, Copy, Check, ExternalLink, Building2,
  TrendingUp, MousePointerClick, DollarSign, Link2, Store,
  CreditCard, AlertCircle, Loader2, Sparkles, CheckCircle2,
  Pencil, Plus, Trash2, ImageIcon, Star, Home, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { usePartner } from '@/hooks/usePartner';
import { ReferralQRCode } from '@/components/ui/ReferralQRCode';
import { supabase } from '@/integrations/supabase/client';
import { ProfileSection } from '@/components/partner/ProfileSection';
import { PlaceDetailSheet } from '@/components/itinerary/PlaceDetailSheet';
import { toast } from 'sonner';

const PLANS = {
  earlyBird: {
    priceId: 'price_1T6rXVPMs1qzeFhtMS4CZeVo',
    productId: 'prod_U51aewtzTZ2IFp',
    name: 'Early Bird',
    price: 35,
    originalPrice: 99,
    features: [],
  },
  standard: {
    priceId: 'price_1T6pt6B6NXLO6CywIPxhCv8C',
    productId: 'prod_U4zs8N22uTIDGX',
    name: 'Standard',
    price: 99,
    features: [
      'Posizionamento garantito negli itinerari AI',
      'Dashboard dedicata con statistiche',
      'Supporto prioritario',
    ],
  },
};

export default function PartnerDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const { partner, stats, affiliateStats, recentClicks, conversions, linkedPlace, isLoading, updateProfile, refetch } = usePartner();
  const [copied, setCopied] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{ subscribed: boolean; subscription_end?: string; cancel_at_period_end?: boolean } | null>(null);
  
  // Place editing state
  const [placeEditMode, setPlaceEditMode] = useState(false);
  const [placeDescription, setPlaceDescription] = useState('');
  const [placePhotos, setPlacePhotos] = useState<Array<{ id: string; media_url: string; caption: string | null; sort_order: number }>>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [placeSaving, setPlaceSaving] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Check subscription on mount and after successful checkout
  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user]);

  useEffect(() => {
    if (searchParams.get('subscription') === 'success') {
      toast.success('Abbonamento attivato con successo! 🎉');
      // Re-check after a short delay to let Stripe process
      setTimeout(() => checkSubscription(), 2000);
    }
  }, [searchParams]);

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-partner-subscription');
      if (!error && data) {
        setSubscriptionStatus(data);
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
    }
  };

  const handleCheckout = async (priceId: string) => {
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-partner-checkout', {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err: any) {
      let errorMessage = "Errore nell'avvio del pagamento";

      if (err?.context) {
        try {
          const payload = await err.context.json();
          if (payload?.error) errorMessage = payload.error;
        } catch {
          // noop
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
      console.error(err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err: any) {
      toast.error('Errore nell\'apertura del portale di gestione');
      console.error(err);
    } finally {
      setPortalLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!partner?.referral_code) return;
    const link = `https://www.localvia.app/?ref=${partner.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copiato!');
    setTimeout(() => setCopied(false), 2000);
  };


  // Place editing functions
  const startPlaceEdit = async () => {
    if (!linkedPlace) return;
    setPlaceDescription(linkedPlace.local_one_liner || '');
    // Fetch photos
    const { data: photos } = await supabase
      .from('place_media')
      .select('*')
      .eq('place_id', linkedPlace.id)
      .order('sort_order');
    setPlacePhotos(photos || []);
    setPlaceEditMode(true);
  };

  const savePlaceChanges = async () => {
    if (!linkedPlace) return;
    setPlaceSaving(true);
    try {
      const { error } = await supabase
        .from('places')
        .update({ local_one_liner: placeDescription })
        .eq('id', linkedPlace.id);
      if (error) throw error;
      toast.success('Descrizione aggiornata!');
      setPlaceEditMode(false);
      refetch();
    } catch (err) {
      toast.error('Errore nel salvataggio');
    } finally {
      setPlaceSaving(false);
    }
  };

  const addPhoto = async () => {
    if (!linkedPlace || !newPhotoUrl.trim()) return;
    try {
      const nextOrder = placePhotos.length;
      const { data, error } = await supabase
        .from('place_media')
        .insert({
          place_id: linkedPlace.id,
          media_url: newPhotoUrl.trim(),
          sort_order: nextOrder,
          created_by: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      setPlacePhotos(prev => [...prev, data]);
      setNewPhotoUrl('');
      toast.success('Foto aggiunta');
    } catch (err) {
      toast.error('Errore nell\'aggiunta della foto');
    }
  };

  const uploadFiles = async (files: FileList | File[]) => {
    if (!linkedPlace || !user) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} non è un'immagine`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} supera il limite di 5MB`);
          continue;
        }
        const ext = file.name.split('.').pop();
        const path = `${user.id}/${linkedPlace.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('place-photos')
          .upload(path, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('place-photos')
          .getPublicUrl(path);

        const nextOrder = placePhotos.length;
        const { data, error } = await supabase
          .from('place_media')
          .insert({
            place_id: linkedPlace.id,
            media_url: publicUrl,
            sort_order: nextOrder,
            created_by: user.id,
          })
          .select()
          .single();
        if (error) throw error;
        setPlacePhotos(prev => [...prev, data]);
      }
      toast.success('Foto caricate!');
    } catch (err) {
      console.error(err);
      toast.error('Errore nel caricamento');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async (photoId: string) => {
    try {
      const { error } = await supabase
        .from('place_media')
        .delete()
        .eq('id', photoId);
      if (error) throw error;
      setPlacePhotos(prev => prev.filter(p => p.id !== photoId));
      toast.success('Foto rimossa');
    } catch (err) {
      toast.error('Errore nella rimozione');
    }
  };

  const setCoverPhoto = async (photoUrl: string) => {
    if (!linkedPlace) return;
    try {
      const { error } = await supabase
        .from('places')
        .update({ photo_url: photoUrl })
        .eq('id', linkedPlace.id);
      if (error) throw error;
      toast.success('Foto di copertina aggiornata');
      refetch();
    } catch (err) {
      toast.error('Errore nell\'aggiornamento');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <div className="grid grid-cols-2 gap-4"><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h1 className="font-display text-xl font-semibold mb-2">Profilo partner non trovato</h1>
        <p className="text-muted-foreground mb-4">Il tuo account non è ancora stato configurato come partner.</p>
        <Button variant="outline" onClick={handleSignOut}>Esci</Button>
      </div>
    );
  }

  const isReferral = partner.partner_type === 'referral';
  const isAffiliate = partner.partner_type === 'affiliate';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-terracotta" />
            <span className="font-display font-semibold">LocalVia</span>
            <Badge variant="outline" className="ml-2">
              {isReferral ? '🤝 Referral Partner' : '⭐ Affiliate Partner'}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <Home className="w-4 h-4 mr-1" />
              Home
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Esci
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <h1 className="font-display text-2xl font-semibold">
            Ciao, {partner.contact_name || partner.company_name}! 👋
          </h1>
          <p className="text-muted-foreground">
            {isReferral
              ? 'Condividi il tuo link e guadagna commissioni su ogni itinerario generato.'
              : 'La tua attività appare negli itinerari AI generati per i viaggiatori.'}
          </p>
        </motion.div>

        {/* Status Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-terracotta/10 to-terracotta/5 border-terracotta/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-terracotta/20 flex items-center justify-center">
                  {isReferral ? <Link2 className="w-6 h-6 text-terracotta" /> : <Store className="w-6 h-6 text-terracotta" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{partner.company_name}</p>
                  <div className="flex items-center gap-2">
                    <Badge className={partner.status === 'active' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}>
                      {partner.status === 'active' ? 'Attivo' : partner.status === 'pending' ? 'In attesa' : partner.status}
                    </Badge>
                    {isReferral && partner.referral_code && (
                      <span className="text-xs text-muted-foreground font-mono">REF: {partner.referral_code}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* REFERRAL: Referral Link + Stats */}
        {isReferral && partner.referral_code && (
          <>
            {/* Referral Link */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-display">Il tuo link referral</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={`https://www.localvia.app/?ref=${partner.referral_code}`}
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" size="icon" onClick={copyReferralLink}>
                      {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>

                  {/* Codice sconto prominente */}
                  <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Codice sconto per i tuoi ospiti</p>
                    <div className="flex items-center gap-3">
                      <span className="flex-1 text-2xl font-bold font-mono tracking-widest text-primary text-center bg-background rounded-lg py-2 border border-primary/20">
                        {partner.referral_code}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={() => {
                          navigator.clipboard.writeText(partner.referral_code!);
                          toast.success('Codice copiato!');
                        }}
                      >
                        <Copy className="w-4 h-4 mr-1.5" />
                        Copia
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      I tuoi ospiti inseriscono questo codice al checkout per ottenere uno <strong>sconto del {partner.discount_percent}%</strong> sulle esperienze.
                      Ad ogni utilizzo ti viene riconosciuta una <strong>commissione del {partner.commission_percent}%</strong> sul valore dell'ordine.
                    </p>
                  </div>

                  <Separator />
                  <p className="text-sm font-medium mb-2 text-center">QR Code del tuo link</p>
                  <ReferralQRCode
                    url={`https://www.localvia.app/?ref=${partner.referral_code}`}
                    label={partner.referral_code}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Stats Grid */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <MousePointerClick className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold">{stats.totalClicks}</p>
                  <p className="text-xs text-muted-foreground">Click totali</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold">{stats.totalConversions}</p>
                  <p className="text-xs text-muted-foreground">Conversioni</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                  <p className="text-2xl font-bold text-amber-600">€{(stats.pendingCommission / 100).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Da incassare</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-2xl font-bold text-primary">€{(stats.paidCommission / 100).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Incassato</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-display">Attività recente</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {recentClicks.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">
                      Nessun click ancora. Condividi il tuo link per iniziare!
                    </div>
                  ) : (
                    <div className="divide-y max-h-64 overflow-y-auto">
                      {recentClicks.slice(0, 10).map((click) => (
                        <div key={click.id} className="px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MousePointerClick className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">Click da {click.source_url || 'link diretto'}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(click.created_at).toLocaleDateString('it-IT')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        {/* AFFILIATE: Subscription & Linked Place */}
        {isAffiliate && (
          <>
            {/* Subscription Status */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Abbonamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                {(subscriptionStatus?.subscribed || partner.subscription_status === 'active') ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          {subscriptionStatus?.cancel_at_period_end ? (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">
                              ⏳ Abbonamento cancellato
                            </Badge>
                          ) : (
                            <Badge className="bg-primary text-primary-foreground">✅ Abbonamento attivo</Badge>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {subscriptionStatus?.cancel_at_period_end 
                              ? `Termina il ${(subscriptionStatus?.subscription_end || partner.subscription_ends_at)
                                  ? new Date(subscriptionStatus?.subscription_end || partner.subscription_ends_at!).toLocaleDateString('it-IT')
                                  : '—'}`
                              : `Rinnovo il ${(subscriptionStatus?.subscription_end || partner.subscription_ends_at)
                                  ? new Date(subscriptionStatus?.subscription_end || partner.subscription_ends_at!).toLocaleDateString('it-IT')
                                  : '—'}`
                            }
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleManageSubscription}
                          disabled={portalLoading}
                        >
                          {portalLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
                          Gestisci abbonamento
                        </Button>
                      </div>
                      
                      {subscriptionStatus?.cancel_at_period_end ? (
                        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-2">
                          <p className="text-sm font-medium text-amber-900">
                            Il tuo abbonamento è stato cancellato e non verrà rinnovato.
                          </p>
                          <p className="text-xs text-amber-700">
                            Continuerai ad apparire negli itinerari fino alla data di scadenza. Puoi riattivare l'abbonamento in qualsiasi momento.
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-xl bg-primary/5 border border-primary/15 p-4 space-y-3">
                          <p className="text-sm font-medium text-foreground">
                            🎉 Grazie per il tuo supporto! Stiamo lavorando per portare grandi risultati alla tua attività.
                          </p>
                          <p className="text-xs text-muted-foreground">
                            La tua attività viene proposta agli utenti che cercano esperienze compatibili con il tuo profilo nei nostri itinerari AI.
                          </p>
                        </div>
                      )}

                      {/* KPIs */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-xl bg-card border p-3 text-center">
                          <TrendingUp className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                          <p className="text-xl font-bold">{affiliateStats.planItemAppearances}</p>
                          <p className="text-[10px] text-muted-foreground">Visualizzazioni</p>
                          {affiliateStats.thisMonthAppearances > 0 && (
                            <p className="text-[10px] text-primary font-medium">+{affiliateStats.thisMonthAppearances} questo mese</p>
                          )}
                        </div>
                        <div className="rounded-xl bg-card border p-3 text-center">
                          <MapPin className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                          <p className="text-xl font-bold">{affiliateStats.distinctItineraries}</p>
                          <p className="text-[10px] text-muted-foreground">Itinerari con te</p>
                          {affiliateStats.thisMonthItineraries > 0 && (
                            <p className="text-[10px] text-primary font-medium">+{affiliateStats.thisMonthItineraries} questo mese</p>
                          )}
                        </div>
                        <div className="rounded-xl bg-card border p-3 text-center">
                          <MousePointerClick className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                          <p className="text-xl font-bold">—</p>
                          <p className="text-[10px] text-muted-foreground">Click al sito</p>
                          <p className="text-[10px] text-muted-foreground italic">Prossimamente</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Attiva l'abbonamento per apparire negli itinerari AI generati per i viaggiatori. 
                        L'abbonamento sostiene gli investimenti pubblicitari e lo sviluppo della piattaforma.
                      </p>

                      {/* Pricing Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Early Bird */}
                        <Card className="border-2 border-terracotta relative overflow-hidden">
                          <div className="absolute top-0 left-0 right-0 bg-terracotta text-white text-xs text-center py-1 font-medium">
                            🔥 Offerta lancio — posti limitati
                          </div>
                          <CardContent className="p-4 pt-8 space-y-3">
                            <div>
                              <h3 className="font-display font-semibold text-lg">{PLANS.earlyBird.name}</h3>
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold">€{PLANS.earlyBird.price}</span>
                                <span className="text-sm text-muted-foreground">/mese + IVA</span>
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-sm line-through text-muted-foreground">€{PLANS.earlyBird.originalPrice}/mese</span>
                                <Badge variant="secondary" className="text-xs">-{Math.round(100 - (PLANS.earlyBird.price / PLANS.earlyBird.originalPrice) * 100)}%</Badge>
                              </div>
                            </div>
                            <Button
                              className="w-full bg-terracotta hover:bg-terracotta/90"
                              onClick={() => handleCheckout(PLANS.earlyBird.priceId)}
                              disabled={checkoutLoading}
                            >
                              {checkoutLoading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Caricamento...</>
                              ) : (
                                <><Sparkles className="w-4 h-4 mr-2" />Attiva ora</>
                              )}
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Standard */}
                        <Card className="border opacity-60">
                          <CardContent className="p-4 space-y-3">
                            <div>
                              <h3 className="font-display font-semibold text-lg">{PLANS.standard.name}</h3>
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold">€{PLANS.standard.price}</span>
                                <span className="text-sm text-muted-foreground">/mese + IVA</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Prezzo standard</p>
                            </div>
                            <ul className="space-y-2">
                              {PLANS.standard.features.map((f, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                  <span>{f}</span>
                                </li>
                              ))}
                            </ul>
                            <Button variant="outline" className="w-full" disabled>
                              Disponibile a breve
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Linked Place */}
            {linkedPlace && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-display flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        La tua attività su LocalVia
                      </CardTitle>
                      {!placeEditMode && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
                            <Eye className="w-3.5 h-3.5 mr-1.5" />
                            Anteprima
                          </Button>
                          <Button variant="outline" size="sm" onClick={startPlaceEdit}>
                            <Pencil className="w-3.5 h-3.5 mr-1.5" />
                            Modifica
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {placeEditMode ? (
                      <div className="space-y-5">
                        {/* Place name (read-only) */}
                        <div>
                          <h3 className="font-medium text-lg">{linkedPlace.name}</h3>
                          <p className="text-sm text-muted-foreground">{linkedPlace.address}</p>
                        </div>

                        {/* Description editing */}
                        <div className="space-y-2">
                          <Label>Descrizione della tua attività</Label>
                          <Textarea
                            value={placeDescription}
                            onChange={e => setPlaceDescription(e.target.value)}
                            rows={4}
                            placeholder="Racconta cosa rende speciale la tua attività..."
                            maxLength={300}
                          />
                          <p className="text-xs text-muted-foreground text-right">{placeDescription.length}/300</p>
                        </div>

                        {/* Photo management */}
                        <div className="space-y-3">
                          <Label className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            Galleria foto
                          </Label>
                          
                          {/* Existing photos */}
                          {placePhotos.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                              {placePhotos.map(photo => (
                                <div key={photo.id} className="relative group rounded-lg overflow-hidden aspect-square">
                                  <img src={photo.media_url} alt="" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                                    <Button
                                      size="icon"
                                      variant="secondary"
                                      className="h-7 w-7"
                                      onClick={() => setCoverPhoto(photo.media_url)}
                                      title="Imposta come copertina"
                                    >
                                      <Star className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="destructive"
                                      className="h-7 w-7"
                                      onClick={() => removePhoto(photo.id)}
                                      title="Rimuovi"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                  {linkedPlace.photo_url === photo.media_url && (
                                    <div className="absolute top-1 left-1">
                                      <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">Copertina</Badge>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Nessuna foto aggiunta</p>
                          )}

                          {/* Drag & Drop / File upload zone */}
                          <div
                            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer ${
                              dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                            }`}
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={e => {
                              e.preventDefault();
                              setDragOver(false);
                              if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
                            }}
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.multiple = true;
                              input.onchange = () => { if (input.files?.length) uploadFiles(input.files); };
                              input.click();
                            }}
                          >
                            {uploading ? (
                              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-sm">Caricamento in corso...</span>
                              </div>
                            ) : (
                              <>
                                <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2" />
                                <p className="text-sm font-medium text-muted-foreground">
                                  Trascina le foto qui o clicca per selezionarle
                                </p>
                                <p className="text-xs text-muted-foreground/60 mt-1">JPG, PNG, WebP • Max 5MB</p>
                              </>
                            )}
                          </div>

                          {/* URL fallback */}
                          <div className="flex items-center gap-2">
                            <Input
                              value={newPhotoUrl}
                              onChange={e => setNewPhotoUrl(e.target.value)}
                              placeholder="Oppure incolla un URL (https://...)"
                              className="flex-1"
                            />
                            <Button variant="outline" size="sm" onClick={addPhoto} disabled={!newPhotoUrl.trim()}>
                              <Plus className="w-4 h-4 mr-1" />
                              Aggiungi
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Usa foto reali della tua attività. Passa il mouse su una foto per impostarla come copertina o rimuoverla.
                          </p>
                        </div>

                        {/* Save/Cancel */}
                        <div className="flex gap-2 pt-2">
                          <Button onClick={savePlaceChanges} disabled={placeSaving} className="bg-terracotta hover:bg-terracotta/90">
                            {placeSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Salva modifiche
                          </Button>
                          <Button variant="outline" onClick={() => setPlaceEditMode(false)}>Annulla</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-start gap-4">
                          {linkedPlace.photo_url && (
                            <img
                              src={linkedPlace.photo_url}
                              alt={linkedPlace.name}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium">{linkedPlace.name}</h3>
                            <p className="text-sm text-muted-foreground">{linkedPlace.address}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{linkedPlace.place_type}</Badge>
                              <Badge variant={linkedPlace.status === 'approved' ? 'default' : 'secondary'}>
                                {linkedPlace.status === 'approved' ? 'Visibile' : linkedPlace.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {linkedPlace.local_one_liner && (
                          <p className="text-sm text-muted-foreground italic">"{linkedPlace.local_one_liner}"</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}

            {/* Place Preview Sheet */}
            {linkedPlace && (
              <PlaceDetailSheet
                place={{
                  id: linkedPlace.id,
                  name: linkedPlace.name,
                  type: linkedPlace.place_type,
                  address: linkedPlace.address ?? null,
                  zone: linkedPlace.zone ?? null,
                  photo_url: linkedPlace.photo_url ?? null,
                  local_one_liner: linkedPlace.local_one_liner ?? null,
                  duration_minutes: linkedPlace.duration_minutes ?? null,
                  price_range: linkedPlace.price_range ?? null,
                  cuisine_type: linkedPlace.cuisine_type ?? null,
                  crowd_level: linkedPlace.crowd_level ?? null,
                  indoor_outdoor: linkedPlace.indoor_outdoor ?? null,
                  vibe_touristy_to_local: linkedPlace.vibe_touristy_to_local ?? null,
                  latitude: linkedPlace.latitude ?? null,
                  longitude: linkedPlace.longitude ?? null,
                }}
                isOpen={previewOpen}
                onClose={() => setPreviewOpen(false)}
              />
            )}

        {/* Profile Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <ProfileSection partner={partner} userEmail={partner.contact_email} updateProfile={updateProfile} />
        </motion.div>
      </main>
    </div>
  );
}
