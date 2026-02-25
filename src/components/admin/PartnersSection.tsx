import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Link2, Store, Mail, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Partner = Tables<'partners'>;
type PartnerInvite = Tables<'partner_invites'>;

export function PartnersSection() {
  const { user } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [invites, setInvites] = useState<PartnerInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);

  // Invite form
  const [invEmail, setInvEmail] = useState('');
  const [invType, setInvType] = useState<'referral' | 'affiliate'>('referral');
  const [invCompany, setInvCompany] = useState('');
  const [invCityId, setInvCityId] = useState('');
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [partnersRes, invitesRes, citiesRes] = await Promise.all([
      supabase.from('partners').select('*').order('created_at', { ascending: false }),
      supabase.from('partner_invites').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('cities').select('id, name').order('name'),
    ]);
    setPartners(partnersRes.data || []);
    setInvites(invitesRes.data || []);
    setCities(citiesRes.data || []);
    setIsLoading(false);
  };

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
        invite_code: code,
        created_by: user.id,
        expires_at: expiresAt.toISOString(),
      });

      if (error) throw error;

      const inviteUrl = `${window.location.origin}/partner/invite/${code}`;
      await navigator.clipboard.writeText(inviteUrl);
      toast.success('Invito creato! Link copiato negli appunti.');
      setInviteOpen(false);
      setInvEmail('');
      setInvCompany('');
      setInvCityId('');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Errore nella creazione dell\'invito');
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">Partner</h2>
          <p className="text-sm text-muted-foreground">{partners.length} partner attivi</p>
        </div>
        <Sheet open={inviteOpen} onOpenChange={setInviteOpen}>
          <SheetTrigger asChild>
            <Button className="bg-terracotta hover:bg-terracotta/90">
              <Plus className="w-4 h-4 mr-2" />
              Invita Partner
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Invita un nuovo partner</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <div>
                <Label>Tipo partner</Label>
                <Select value={invType} onValueChange={(v) => setInvType(v as 'referral' | 'affiliate')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="referral">🤝 Referral (hotel, guide, NCC)</SelectItem>
                    <SelectItem value="affiliate">⭐ Affiliate (ristoranti, attrazioni)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={invEmail} onChange={e => setInvEmail(e.target.value)} placeholder="partner@email.com" />
              </div>
              <div>
                <Label>Nome azienda</Label>
                <Input value={invCompany} onChange={e => setInvCompany(e.target.value)} placeholder="Hotel Vesuvio" />
              </div>
              <div>
                <Label>Città (opzionale)</Label>
                <Select value={invCityId} onValueChange={setInvCityId}>
                  <SelectTrigger><SelectValue placeholder="Seleziona città" /></SelectTrigger>
                  <SelectContent>
                    {cities.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={sendInvite} disabled={sending || !invEmail || !invCompany} className="w-full bg-terracotta hover:bg-terracotta/90">
                {sending ? 'Invio...' : 'Crea invito e copia link'}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{partners.filter(p => p.partner_type === 'referral').length}</p>
            <p className="text-xs text-muted-foreground">Referral</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{partners.filter(p => p.partner_type === 'affiliate').length}</p>
            <p className="text-xs text-muted-foreground">Affiliate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{partners.filter(p => p.status === 'active').length}</p>
            <p className="text-xs text-muted-foreground">Attivi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{invites.filter(i => i.status === 'pending').length}</p>
            <p className="text-xs text-muted-foreground">Inviti in attesa</p>
          </CardContent>
        </Card>
      </div>

      {/* Partners List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display">Partner registrati</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {partners.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              Nessun partner ancora. Invia il primo invito!
            </div>
          ) : (
            <div className="divide-y">
              {partners.map(p => (
                <div key={p.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      {p.partner_type === 'referral' ? <Link2 className="w-5 h-5 text-muted-foreground" /> : <Store className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{p.company_name}</p>
                      <p className="text-xs text-muted-foreground">{p.contact_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{p.partner_type === 'referral' ? 'Referral' : 'Affiliate'}</Badge>
                    <Badge className={p.status === 'active' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}>
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {invites.filter(i => i.status === 'pending').length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display">Inviti in sospeso</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {invites.filter(i => i.status === 'pending').map(inv => (
                <div key={inv.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{inv.email}</p>
                      <p className="text-xs text-muted-foreground">{inv.company_name || '—'} • {inv.partner_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    Scade {new Date(inv.expires_at).toLocaleDateString('it-IT')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
