import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, LogOut, Copy, Check, ExternalLink, Building2,
  TrendingUp, MousePointerClick, DollarSign, Link2, Store,
  CreditCard, AlertCircle, Loader2, Sparkles, CheckCircle2
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
import { toast } from 'sonner';

const PLANS = {
  earlyBird: {
    priceId: 'price_1T4nJ5B6NXLO6Cyw5gMyotxK',
    productId: 'prod_U2t5qDLRw661sO',
    name: 'Early Bird',
    price: 35,
    originalPrice: 99,
    features: [],
  },
  standard: {
    priceId: 'price_1T4nHRB6NXLO6Cyww9X3JgzM',
    productId: 'prod_U2t3M7PmDxV5gO',
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
  const { partner, stats, recentClicks, conversions, linkedPlace, isLoading, updateProfile } = usePartner();
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{ subscribed: boolean; subscription_end?: string } | null>(null);
  const [formData, setFormData] = useState({ company_name: '', contact_name: '', contact_phone: '', website_url: '', description: '' });

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
      toast.error('Errore nell\'avvio del pagamento');
      console.error(err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const copyReferralLink = () => {
    if (!partner?.referral_code) return;
    const link = `https://www.localvia.app/?ref=${partner.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copiato!');
    setTimeout(() => setCopied(false), 2000);
  };

  const startEdit = () => {
    if (!partner) return;
    setFormData({
      company_name: partner.company_name || '',
      contact_name: partner.contact_name || '',
      contact_phone: partner.contact_phone || '',
      website_url: partner.website_url || '',
      description: partner.description || '',
    });
    setEditMode(true);
  };

  const saveProfile = async () => {
    const res = await updateProfile(formData);
    if (!res?.error) {
      toast.success('Profilo aggiornato');
      setEditMode(false);
    } else {
      toast.error('Errore nel salvataggio');
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
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Esci
          </Button>
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
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary text-primary-foreground">Attivo</Badge>
                        <span className="text-sm text-muted-foreground">
                          Rinnovo il {(subscriptionStatus?.subscription_end || partner.subscription_ends_at)
                            ? new Date(subscriptionStatus?.subscription_end || partner.subscription_ends_at!).toLocaleDateString('it-IT')
                            : '—'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        La tua attività viene proposta agli utenti che cercano esperienze compatibili con il tuo profilo.
                      </p>
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
                    <CardTitle className="text-lg font-display flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      La tua attività su LocalVia
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}

        {/* Profile Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-display">Profilo</CardTitle>
                {!editMode && (
                  <Button variant="outline" size="sm" onClick={startEdit}>Modifica</Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <Label>Nome azienda</Label>
                    <Input value={formData.company_name} onChange={e => setFormData(p => ({ ...p, company_name: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Referente</Label>
                    <Input value={formData.contact_name} onChange={e => setFormData(p => ({ ...p, contact_name: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Telefono</Label>
                    <Input value={formData.contact_phone} onChange={e => setFormData(p => ({ ...p, contact_phone: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Sito web</Label>
                    <Input value={formData.website_url} onChange={e => setFormData(p => ({ ...p, website_url: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Descrizione</Label>
                    <Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveProfile} className="bg-terracotta hover:bg-terracotta/90">Salva</Button>
                    <Button variant="outline" onClick={() => setEditMode(false)}>Annulla</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Azienda</span><span>{partner.company_name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Referente</span><span>{partner.contact_name || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{partner.contact_email}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Telefono</span><span>{partner.contact_phone || '—'}</span></div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sito web</span>
                    {partner.website_url ? (
                      <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="text-terracotta hover:underline flex items-center gap-1">
                        {partner.website_url.replace(/^https?:\/\//, '')} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : <span>—</span>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
