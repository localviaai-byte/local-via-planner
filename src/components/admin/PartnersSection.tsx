import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Link2, Store, Mail, Calendar, Copy, Search,
  ChevronDown, ChevronRight, ExternalLink, Pencil, Ban, CheckCircle2,
  MapPin, TrendingUp, MousePointerClick, DollarSign, Eye, Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Partner = Tables<'partners'>;
type PartnerInvite = Tables<'partner_invites'>;

interface PlaceOption {
  id: string;
  name: string;
  place_type: string;
  zone: string | null;
  city_id: string;
}

export function PartnersSection() {
  const { user } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [invites, setInvites] = useState<PartnerInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [detailPartner, setDetailPartner] = useState<Partner | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'referral' | 'affiliate'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Invite form
  const [invEmail, setInvEmail] = useState('');
  const [invType, setInvType] = useState<'referral' | 'affiliate'>('referral');
  const [invCompany, setInvCompany] = useState('');
  const [invCityId, setInvCityId] = useState('');
  const [invLinkedPlaceId, setInvLinkedPlaceId] = useState('');
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [places, setPlaces] = useState<PlaceOption[]>([]);
  const [placeSearch, setPlaceSearch] = useState('');
  const [sending, setSending] = useState(false);

  // Referral stats for detail view
  const [detailClicks, setDetailClicks] = useState(0);
  const [detailConversions, setDetailConversions] = useState(0);
  const [detailCommission, setDetailCommission] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  // Load places when city is selected for affiliate invite
  useEffect(() => {
    if (invType === 'affiliate' && invCityId) {
      fetchPlaces(invCityId);
    }
  }, [invCityId, invType]);

  const fetchData = async () => {
    const [partnersRes, invitesRes, citiesRes] = await Promise.all([
      supabase.from('partners').select('*').order('created_at', { ascending: false }),
      supabase.from('partner_invites').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('cities').select('id, name').order('name'),
    ]);
    setPartners(partnersRes.data || []);
    setInvites(invitesRes.data || []);
    setCities(citiesRes.data || []);
    setIsLoading(false);
  };

  const fetchPlaces = async (cityId: string) => {
    const { data } = await supabase
      .from('places')
      .select('id, name, place_type, zone, city_id')
      .eq('city_id', cityId)
      .order('name');
    setPlaces(data || []);
  };

  const filteredPlaces = useMemo(() => {
    if (!placeSearch) return places;
    const q = placeSearch.toLowerCase();
    return places.filter(p => p.name.toLowerCase().includes(q) || p.place_type.toLowerCase().includes(q));
  }, [places, placeSearch]);

  const filteredPartners = useMemo(() => {
    let filtered = partners;
    if (filterType !== 'all') filtered = filtered.filter(p => p.partner_type === filterType);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.company_name.toLowerCase().includes(q) ||
        p.contact_email.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [partners, filterType, searchQuery]);

  const sendInvite = async () => {
    if (!user || !invEmail || !invCompany) return;
    setSending(true);
    try {
      const code = crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { error } = await supabase.from('partner_invites').insert({
        email: invEmail,
        partner_type: invType,
        company_name: invCompany,
        city_id: invCityId || null,
        linked_place_id: invType === 'affiliate' ? (invLinkedPlaceId || null) : null,
        invite_code: code,
        created_by: user.id,
        expires_at: expiresAt.toISOString(),
      });

      if (error) throw error;

      const inviteUrl = `https://www.localvia.app/partner/invite/${code}`;
      await navigator.clipboard.writeText(inviteUrl);
      toast.success('Invito creato! Link copiato negli appunti.');
      setInviteOpen(false);
      resetInviteForm();
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Errore nella creazione dell\'invito');
    } finally {
      setSending(false);
    }
  };

  const resetInviteForm = () => {
    setInvEmail('');
    setInvCompany('');
    setInvCityId('');
    setInvLinkedPlaceId('');
    setPlaceSearch('');
    setInvType('referral');
  };

  const openPartnerDetail = async (partner: Partner) => {
    setDetailPartner(partner);
    setDetailOpen(true);

    // Fetch stats
    if (partner.partner_type === 'referral') {
      const [clicksRes, convsRes] = await Promise.all([
        supabase.from('referral_clicks').select('id', { count: 'exact', head: true }).eq('partner_id', partner.id),
        supabase.from('referral_conversions').select('id, commission_cents, status').eq('partner_id', partner.id),
      ]);
      setDetailClicks(clicksRes.count || 0);
      const convs = convsRes.data || [];
      setDetailConversions(convs.length);
      setDetailCommission(convs.reduce((s, c) => s + (c.commission_cents || 0), 0));
    }
  };

  const updatePartnerStatus = async (partnerId: string, status: 'active' | 'suspended') => {
    const { error } = await supabase
      .from('partners')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', partnerId);
    if (error) {
      toast.error('Errore nell\'aggiornamento');
    } else {
      toast.success(status === 'active' ? 'Partner attivato' : 'Partner sospeso');
      setDetailPartner(prev => prev ? { ...prev, status } : null);
      fetchData();
    }
  };

  const linkPlaceToPartner = async (partnerId: string, placeId: string | null) => {
    const { error } = await supabase
      .from('partners')
      .update({ linked_place_id: placeId, updated_at: new Date().toISOString() })
      .eq('id', partnerId);
    if (error) {
      toast.error('Errore nel collegamento');
    } else {
      toast.success(placeId ? 'Attività collegata!' : 'Collegamento rimosso');
      setDetailPartner(prev => prev ? { ...prev, linked_place_id: placeId } : null);
      fetchData();
    }
  };

  const deletePartner = async (partnerId: string) => {
    const p = partners.find(x => x.id === partnerId);
    if (p) {
      const roleType = p.partner_type === 'referral' ? 'referral_partner' : 'affiliate_partner';
      await supabase.from('user_roles').delete().eq('user_id', p.user_id).eq('role', roleType as any);
    }
    const { error } = await supabase.from('partners').delete().eq('id', partnerId);
    if (error) {
      toast.error('Errore nell\'eliminazione');
    } else {
      toast.success('Partner eliminato');
      setDetailOpen(false);
      setDetailPartner(null);
      fetchData();
    }
  };

  const copyInviteLink = async (code: string) => {
    const url = `https://www.localvia.app/partner/invite/${code}`;
    await navigator.clipboard.writeText(url);
    toast.success('Link copiato!');
  };

  const deleteInvite = async (id: string) => {
    const { error } = await supabase.from('partner_invites').delete().eq('id', id);
    if (!error) {
      toast.success('Invito eliminato');
      fetchData();
    }
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>;
  }

  const referralCount = partners.filter(p => p.partner_type === 'referral').length;
  const affiliateCount = partners.filter(p => p.partner_type === 'affiliate').length;
  const activeCount = partners.filter(p => p.status === 'active').length;
  const pendingInvites = invites.filter(i => i.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">Partner</h2>
          <p className="text-sm text-muted-foreground">{partners.length} partner · {pendingInvites.length} inviti in attesa</p>
        </div>
        <Sheet open={inviteOpen} onOpenChange={(v) => { setInviteOpen(v); if (!v) resetInviteForm(); }}>
          <SheetTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Invita Partner
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="font-display">Invita un nuovo partner</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              {/* Type */}
              <div>
                <Label>Tipo partner</Label>
                <Select value={invType} onValueChange={(v) => { setInvType(v as 'referral' | 'affiliate'); setInvLinkedPlaceId(''); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="referral">🤝 Referral (hotel, guide, NCC, tour op.)</SelectItem>
                    <SelectItem value="affiliate">⭐ Affiliate (ristoranti, attrazioni, attività)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {invType === 'referral'
                    ? 'Guadagna commissioni su ogni piano generato dal suo link.'
                    : 'Paga un abbonamento mensile per apparire negli itinerari AI.'}
                </p>
              </div>

              <Separator />

              {/* Contact */}
              <div>
                <Label>Email</Label>
                <Input type="email" value={invEmail} onChange={e => setInvEmail(e.target.value)} placeholder="partner@email.com" />
              </div>
              <div>
                <Label>Nome azienda</Label>
                <Input value={invCompany} onChange={e => setInvCompany(e.target.value)} placeholder={invType === 'referral' ? 'Hotel Vesuvio' : 'Trattoria da Mario'} />
              </div>

              {/* City */}
              <div>
                <Label>Città {invType === 'affiliate' ? '' : '(opzionale)'}</Label>
                <Select value={invCityId} onValueChange={setInvCityId}>
                  <SelectTrigger><SelectValue placeholder="Seleziona città" /></SelectTrigger>
                  <SelectContent>
                    {cities.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Linked Place — only for affiliate */}
              {invType === 'affiliate' && invCityId && (
                <div>
                  <Label className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Collega attività/ristorante
                  </Label>
                  <p className="text-[11px] text-muted-foreground mb-2">
                    Seleziona il luogo già presente in piattaforma da collegare a questo partner.
                  </p>
                  <Input
                    placeholder="Cerca per nome..."
                    value={placeSearch}
                    onChange={e => setPlaceSearch(e.target.value)}
                    className="mb-2"
                  />
                  <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
                    {filteredPlaces.length === 0 ? (
                      <p className="p-3 text-xs text-muted-foreground text-center">
                        {places.length === 0 ? 'Nessun luogo in questa città' : 'Nessun risultato'}
                      </p>
                    ) : (
                      filteredPlaces.map(place => (
                        <button
                          key={place.id}
                          onClick={() => setInvLinkedPlaceId(place.id === invLinkedPlaceId ? '' : place.id)}
                          className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-muted/50 transition-colors ${
                            invLinkedPlaceId === place.id ? 'bg-primary/10' : ''
                          }`}
                        >
                          <div>
                            <p className="font-medium">{place.name}</p>
                            <p className="text-[10px] text-muted-foreground">{place.place_type}{place.zone ? ` · ${place.zone}` : ''}</p>
                          </div>
                          {invLinkedPlaceId === place.id && (
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                  {invLinkedPlaceId && (
                    <p className="text-xs text-primary mt-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {places.find(p => p.id === invLinkedPlaceId)?.name} collegato
                    </p>
                  )}
                </div>
              )}

              <Button
                onClick={sendInvite}
                disabled={sending || !invEmail || !invCompany || (invType === 'affiliate' && !invCityId)}
                className="w-full"
              >
                {sending ? 'Invio...' : 'Crea invito e copia link'}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Referral', value: referralCount, icon: Link2 },
          { label: 'Affiliate', value: affiliateCount, icon: Store },
          { label: 'Attivi', value: activeCount, icon: CheckCircle2 },
          { label: 'Inviti in attesa', value: pendingInvites.length, icon: Mail },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <s.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xl font-bold leading-tight">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs: Partners / Invites */}
      <Tabs defaultValue="partners">
        <TabsList className="w-full">
          <TabsTrigger value="partners" className="flex-1">Partner ({partners.length})</TabsTrigger>
          <TabsTrigger value="invites" className="flex-1">Inviti ({invites.length})</TabsTrigger>
        </TabsList>

        {/* ── PARTNERS TAB ── */}
        <TabsContent value="partners" className="mt-4 space-y-4">
          {/* Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca partner..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="affiliate">Affiliate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredPartners.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground text-sm">
                {searchQuery ? 'Nessun partner trovato' : 'Nessun partner ancora. Invia il primo invito!'}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredPartners.map(p => (
                <Card
                  key={p.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => openPartnerDetail(p)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          p.partner_type === 'referral' ? 'bg-accent/20' : 'bg-primary/10'
                        }`}>
                          {p.partner_type === 'referral'
                            ? <Link2 className="w-5 h-5 text-accent-foreground" />
                            : <Store className="w-5 h-5 text-primary" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{p.company_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{p.contact_email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className="text-[10px]">
                          {p.partner_type === 'referral' ? 'Referral' : 'Affiliate'}
                        </Badge>
                        <Badge className={
                          p.status === 'active' ? 'bg-accent text-accent-foreground' :
                          p.status === 'suspended' ? 'bg-destructive/20 text-destructive' :
                          'bg-muted text-muted-foreground'
                        }>
                          {p.status === 'active' ? 'Attivo' : p.status === 'suspended' ? 'Sospeso' : 'In attesa'}
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    {/* Quick info row */}
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground">
                      {p.referral_code && (
                        <span className="font-mono">REF: {p.referral_code}</span>
                      )}
                      {p.linked_place_id && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Attività collegata</span>
                      )}
                      {p.commission_percent && p.partner_type === 'referral' && (
                        <span>{p.commission_percent}% commissione</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── INVITES TAB ── */}
        <TabsContent value="invites" className="mt-4">
          {invites.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground text-sm">
                Nessun invito creato
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {invites.map(inv => (
                <Card key={inv.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          inv.status === 'pending' ? 'bg-gold/20' :
                          inv.status === 'accepted' ? 'bg-accent/20' : 'bg-muted'
                        }`}>
                          <Mail className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{inv.email}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {inv.company_name || '—'} · {inv.partner_type === 'referral' ? 'Referral' : 'Affiliate'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={
                          inv.status === 'pending' ? 'bg-gold/20 text-foreground' :
                          inv.status === 'accepted' ? 'bg-accent text-accent-foreground' :
                          'bg-muted text-muted-foreground'
                        }>
                          {inv.status === 'pending' ? 'In attesa' : inv.status === 'accepted' ? 'Accettato' : inv.status}
                        </Badge>
                        {inv.status === 'pending' && (
                          <>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); copyInviteLink(inv.invite_code); }}>
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); deleteInvite(inv.id); }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Scade {new Date(inv.expires_at).toLocaleDateString('it-IT')}
                      {inv.linked_place_id && <span className="ml-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> Luogo collegato</span>}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── PARTNER DETAIL SHEET ── */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          {detailPartner && (
            <PartnerDetailContent
              partner={detailPartner}
              clicks={detailClicks}
              conversions={detailConversions}
              commission={detailCommission}
              cities={cities}
              onUpdateStatus={updatePartnerStatus}
              onLinkPlace={linkPlaceToPartner}
              onDelete={deletePartner}
              onClose={() => setDetailOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Partner Detail Content ─────────────────────────────────────
function PartnerDetailContent({
  partner,
  clicks,
  conversions,
  commission,
  cities,
  onUpdateStatus,
  onLinkPlace,
  onDelete,
  onClose,
}: {
  partner: Partner;
  clicks: number;
  conversions: number;
  commission: number;
  cities: { id: string; name: string }[];
  onUpdateStatus: (id: string, status: 'active' | 'suspended') => void;
  onLinkPlace: (id: string, placeId: string | null) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const [places, setPlaces] = useState<PlaceOption[]>([]);
  const [placeSearch, setPlaceSearch] = useState('');
  const [linkedPlaceName, setLinkedPlaceName] = useState<string | null>(null);
  const [showPlacePicker, setShowPlacePicker] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    // Fetch linked place name
    if (partner.linked_place_id) {
      supabase.from('places').select('name').eq('id', partner.linked_place_id).maybeSingle()
        .then(({ data }) => setLinkedPlaceName(data?.name || null));
    }
    // Fetch places for city
    if (partner.city_id) {
      supabase.from('places')
        .select('id, name, place_type, zone, city_id')
        .eq('city_id', partner.city_id)
        .order('name')
        .then(({ data }) => setPlaces(data || []));
    }
  }, [partner.linked_place_id, partner.city_id]);

  const filteredPlaces = useMemo(() => {
    if (!placeSearch) return places;
    const q = placeSearch.toLowerCase();
    return places.filter(p => p.name.toLowerCase().includes(q));
  }, [places, placeSearch]);

  const cityName = cities.find(c => c.id === partner.city_id)?.name;

  return (
    <div className="space-y-6">
      <SheetHeader>
        <SheetTitle className="font-display flex items-center gap-2">
          {partner.partner_type === 'referral'
            ? <Link2 className="w-5 h-5 text-accent-foreground" />
            : <Store className="w-5 h-5 text-primary" />}
          {partner.company_name}
        </SheetTitle>
      </SheetHeader>

      {/* Status & Type */}
      <div className="flex items-center gap-2">
        <Badge variant="outline">{partner.partner_type === 'referral' ? 'Referral' : 'Affiliate'}</Badge>
        <Badge className={
          partner.status === 'active' ? 'bg-accent text-accent-foreground' :
          partner.status === 'suspended' ? 'bg-destructive/20 text-destructive' :
          'bg-muted text-muted-foreground'
        }>
          {partner.status === 'active' ? 'Attivo' : partner.status === 'suspended' ? 'Sospeso' : 'In attesa'}
        </Badge>
      </div>

      {/* Info */}
      <Card>
        <CardContent className="p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{partner.contact_email}</span>
          </div>
          {partner.contact_name && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contatto</span>
              <span>{partner.contact_name}</span>
            </div>
          )}
          {cityName && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Città</span>
              <span>{cityName}</span>
            </div>
          )}
          {partner.referral_code && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Codice referral</span>
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{partner.referral_code}</span>
            </div>
          )}
          {partner.commission_percent != null && partner.partner_type === 'referral' && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Commissione</span>
              <span>{partner.commission_percent}%</span>
            </div>
          )}
          {partner.discount_percent != null && partner.partner_type === 'referral' && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sconto utente</span>
              <span>{partner.discount_percent}%</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral Stats */}
      {partner.partner_type === 'referral' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold">{clicks}</p>
                <p className="text-[10px] text-muted-foreground">Click</p>
              </div>
              <div>
                <p className="text-lg font-bold">{conversions}</p>
                <p className="text-[10px] text-muted-foreground">Conversioni</p>
              </div>
              <div>
                <p className="text-lg font-bold">€{(commission / 100).toFixed(2)}</p>
                <p className="text-[10px] text-muted-foreground">Commissioni</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Linked Place — Affiliate */}
      {partner.partner_type === 'affiliate' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Attività collegata
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {partner.linked_place_id && linkedPlaceName ? (
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{linkedPlaceName}</span>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setShowPlacePicker(true)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">Nessuna attività collegata</p>
                <Button size="sm" variant="outline" onClick={() => setShowPlacePicker(true)}>
                  <MapPin className="w-3.5 h-3.5 mr-1.5" />
                  Collega attività
                </Button>
              </div>
            )}

            {/* Place Picker */}
            <AnimatePresence>
              {showPlacePicker && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 overflow-hidden"
                >
                  <Input
                    placeholder="Cerca attività..."
                    value={placeSearch}
                    onChange={e => setPlaceSearch(e.target.value)}
                    className="mb-2"
                  />
                  <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
                    {/* Unlink option */}
                    {partner.linked_place_id && (
                      <button
                        onClick={() => { onLinkPlace(partner.id, null); setShowPlacePicker(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        Rimuovi collegamento
                      </button>
                    )}
                    {filteredPlaces.map(place => (
                      <button
                        key={place.id}
                        onClick={() => { onLinkPlace(partner.id, place.id); setShowPlacePicker(false); setLinkedPlaceName(place.name); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors ${
                          partner.linked_place_id === place.id ? 'bg-primary/10' : ''
                        }`}
                      >
                        <p className="font-medium">{place.name}</p>
                        <p className="text-[10px] text-muted-foreground">{place.place_type}{place.zone ? ` · ${place.zone}` : ''}</p>
                      </button>
                    ))}
                    {filteredPlaces.length === 0 && (
                      <p className="p-3 text-xs text-muted-foreground text-center">Nessun risultato</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Subscription — Affiliate */}
      {partner.partner_type === 'affiliate' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Abbonamento
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stato</span>
              <Badge variant="outline">{partner.subscription_status || 'Non attivo'}</Badge>
            </div>
            {partner.subscription_started_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inizio</span>
                <span>{new Date(partner.subscription_started_at).toLocaleDateString('it-IT')}</span>
              </div>
            )}
            {partner.subscription_ends_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scadenza</span>
                <span>{new Date(partner.subscription_ends_at).toLocaleDateString('it-IT')}</span>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground pt-2">
              Gestione abbonamento Stripe disponibile dopo integrazione.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="space-y-2 pt-2">
        {partner.status === 'active' ? (
          <Button
            variant="outline"
            className="w-full text-destructive hover:bg-destructive/10"
            onClick={() => onUpdateStatus(partner.id, 'suspended')}
          >
            <Ban className="w-4 h-4 mr-2" />
            Sospendi partner
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={() => onUpdateStatus(partner.id, 'active')}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Attiva partner
          </Button>
        )}

        {!confirmDelete ? (
          <Button
            variant="ghost"
            className="w-full text-destructive hover:bg-destructive/10"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Elimina partner
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => onDelete(partner.id)}
            >
              Conferma eliminazione
            </Button>
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(false)}
            >
              Annulla
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
