import { useState } from 'react';
import { KeyRound, Loader2, ExternalLink, Pencil, Save, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Partner = Tables<'partners'>;

interface ProfileSectionProps {
  partner: Partner;
  userEmail: string;
  updateProfile: (updates: Partial<Partner>) => Promise<{ error: any } | undefined>;
}

export function ProfileSection({ partner, userEmail, updateProfile }: ProfileSectionProps) {
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    contact_phone: '',
    website_url: '',
    description: '',
    billing_company_name: '',
    billing_vat_number: '',
    billing_address: '',
    billing_sdi_code: '',
    billing_pec: '',
  });

  const startEdit = () => {
    setFormData({
      company_name: partner.company_name || '',
      contact_name: partner.contact_name || '',
      contact_phone: partner.contact_phone || '',
      website_url: partner.website_url || '',
      description: partner.description || '',
      billing_company_name: (partner as any).billing_company_name || '',
      billing_vat_number: (partner as any).billing_vat_number || '',
      billing_address: (partner as any).billing_address || '',
      billing_sdi_code: (partner as any).billing_sdi_code || '',
      billing_pec: (partner as any).billing_pec || '',
    });
    setEditMode(true);
  };

  const saveProfile = async () => {
    setSaving(true);
    const res = await updateProfile(formData as any);
    setSaving(false);
    if (!res?.error) {
      toast.success('Profilo aggiornato');
      setEditMode(false);
    } else {
      toast.error('Errore nel salvataggio');
    }
  };

  const changePassword = async () => {
    if (newPassword.length < 6) {
      toast.error('La password deve avere almeno 6 caratteri');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Le password non coincidono');
      return;
    }
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password aggiornata con successo');
      setPasswordMode(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Errore nel cambio password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const billingCompanyName = (partner as any).billing_company_name;
  const billingVatNumber = (partner as any).billing_vat_number;
  const billingAddress = (partner as any).billing_address;
  const billingSdiCode = (partner as any).billing_sdi_code;
  const billingPec = (partner as any).billing_pec;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display">Profilo & Account</CardTitle>
          {!editMode && (
            <Button variant="outline" size="sm" onClick={startEdit}>
              <Pencil className="w-3.5 h-3.5 mr-1.5" />
              Modifica
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {editMode ? (
          <div className="space-y-5">
            {/* Contact info */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Informazioni contatto</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <Input value={formData.website_url} onChange={e => setFormData(p => ({ ...p, website_url: e.target.value }))} placeholder="https://..." />
                </div>
              </div>
              <div>
                <Label>Descrizione</Label>
                <Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} />
              </div>
            </div>

            <Separator />

            {/* Billing info */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Dati di fatturazione
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Ragione sociale</Label>
                  <Input value={formData.billing_company_name} onChange={e => setFormData(p => ({ ...p, billing_company_name: e.target.value }))} placeholder="Ragione sociale per fattura" />
                </div>
                <div>
                  <Label>Partita IVA</Label>
                  <Input value={formData.billing_vat_number} onChange={e => setFormData(p => ({ ...p, billing_vat_number: e.target.value }))} placeholder="IT12345678901" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Indirizzo di fatturazione</Label>
                  <Input value={formData.billing_address} onChange={e => setFormData(p => ({ ...p, billing_address: e.target.value }))} placeholder="Via, CAP, Città, Provincia" />
                </div>
                <div>
                  <Label>Codice SDI</Label>
                  <Input value={formData.billing_sdi_code} onChange={e => setFormData(p => ({ ...p, billing_sdi_code: e.target.value }))} placeholder="Codice destinatario (7 caratteri)" maxLength={7} />
                </div>
                <div>
                  <Label>PEC</Label>
                  <Input value={formData.billing_pec} onChange={e => setFormData(p => ({ ...p, billing_pec: e.target.value }))} placeholder="fatturazione@pec.it" />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={saveProfile} disabled={saving} className="bg-terracotta hover:bg-terracotta/90">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salva
              </Button>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                <X className="w-4 h-4 mr-1" />
                Annulla
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Read-only contact info */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Azienda</span><span>{partner.company_name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Referente</span><span>{partner.contact_name || '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{userEmail}</span></div>
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

            {/* Billing info read-only */}
            {(billingCompanyName || billingVatNumber) && (
              <>
                <Separator />
                <div className="space-y-3 text-sm">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Fatturazione
                  </h4>
                  {billingCompanyName && <div className="flex justify-between"><span className="text-muted-foreground">Ragione sociale</span><span>{billingCompanyName}</span></div>}
                  {billingVatNumber && <div className="flex justify-between"><span className="text-muted-foreground">P.IVA</span><span>{billingVatNumber}</span></div>}
                  {billingAddress && <div className="flex justify-between"><span className="text-muted-foreground">Indirizzo</span><span className="text-right max-w-[60%]">{billingAddress}</span></div>}
                  {billingSdiCode && <div className="flex justify-between"><span className="text-muted-foreground">Codice SDI</span><span>{billingSdiCode}</span></div>}
                  {billingPec && <div className="flex justify-between"><span className="text-muted-foreground">PEC</span><span>{billingPec}</span></div>}
                </div>
              </>
            )}

            <Separator />

            {/* Password change */}
            <div>
              {passwordMode ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <KeyRound className="w-4 h-4" /> Cambia password
                  </h4>
                  <div>
                    <Label>Nuova password</Label>
                    <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimo 6 caratteri" />
                  </div>
                  <div>
                    <Label>Conferma password</Label>
                    <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Ripeti la password" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={changePassword} disabled={passwordLoading} className="bg-terracotta hover:bg-terracotta/90">
                      {passwordLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Aggiorna password
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setPasswordMode(false); setNewPassword(''); setConfirmPassword(''); }}>
                      Annulla
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setPasswordMode(true)}>
                  <KeyRound className="w-4 h-4 mr-2" />
                  Cambia password
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
