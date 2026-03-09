import { useState } from 'react';
import { Plus, Plane, TrainFront, Bus, Ship, Trash2, ChevronDown, ChevronUp, Navigation, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useTransportHubs, useCreateTransportHub, useDeleteTransportHub, HUB_TYPE_OPTIONS, type HubType } from '@/hooks/useTransportHubs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface TransportHubsPanelProps {
  cityId: string;
  cityName: string;
}

const HUB_ICONS: Record<HubType, React.ReactNode> = {
  airport: <Plane className="w-4 h-4" />,
  train_station: <TrainFront className="w-4 h-4" />,
  bus_station: <Bus className="w-4 h-4" />,
  port: <Ship className="w-4 h-4" />,
};

export function TransportHubsPanel({ cityId, cityName }: TransportHubsPanelProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [form, setForm] = useState({
    hub_type: 'train_station' as HubType,
    name: '',
    code: '',
    latitude: '',
    longitude: '',
    distance_from_center_km: '',
    travel_time_to_center_minutes: '',
    transport_to_center: '',
    ncc_taxi_note: '',
    ncc_contact_url: '',
    notes: '',
  });

  const { data: hubs = [], isLoading } = useTransportHubs(cityId);
  const createHub = useCreateTransportHub();
  const deleteHub = useDeleteTransportHub();

  const resetForm = () => setForm({
    hub_type: 'train_station',
    name: '', code: '', latitude: '', longitude: '',
    distance_from_center_km: '', travel_time_to_center_minutes: '',
    transport_to_center: '', ncc_taxi_note: '', ncc_contact_url: '', notes: '',
  });

  const handleSubmit = async () => {
    if (!form.name || !user) {
      toast.error('Inserisci il nome dell\'hub');
      return;
    }
    try {
      await createHub.mutateAsync({
        city_id: cityId,
        hub_type: form.hub_type,
        name: form.name,
        code: form.code || null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        distance_from_center_km: form.distance_from_center_km ? parseFloat(form.distance_from_center_km) : null,
        travel_time_to_center_minutes: form.travel_time_to_center_minutes ? parseInt(form.travel_time_to_center_minutes) : null,
        transport_to_center: form.transport_to_center || null,
        ncc_taxi_note: form.ncc_taxi_note || null,
        ncc_contact_url: form.ncc_contact_url || null,
        notes: form.notes || null,
        created_by: user.id,
      });
      toast.success('Hub di trasporto aggiunto!');
      setShowAddDialog(false);
      resetForm();
    } catch (error: any) {
      toast.error(`Errore: ${error?.message || 'Errore sconosciuto'}`);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plane className="w-5 h-5" />
                Hub di Trasporto
                <Badge variant="secondary" className="ml-2">{hubs.length}</Badge>
              </CardTitle>
              {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Caricamento...</p>
            ) : hubs.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Plane className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nessun hub di trasporto</p>
                <p className="text-xs mt-1">Aggiungi aeroporti, stazioni e porti vicini</p>
              </div>
            ) : (
              <div className="space-y-3">
                {hubs.map((hub) => (
                  <div key={hub.id} className="flex items-start justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted mt-0.5">
                        {HUB_ICONS[hub.hub_type]}
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium flex items-center gap-2">
                          {hub.name}
                          {hub.code && <Badge variant="outline" className="text-[10px]">{hub.code}</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground flex flex-wrap gap-3">
                          {hub.distance_from_center_km && (
                            <span className="flex items-center gap-1">
                              <Navigation className="w-3 h-3" />
                              {hub.distance_from_center_km} km
                            </span>
                          )}
                          {hub.travel_time_to_center_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {hub.travel_time_to_center_minutes} min
                            </span>
                          )}
                        </div>
                        {hub.transport_to_center && (
                          <p className="text-xs text-muted-foreground">{hub.transport_to_center}</p>
                        )}
                        {hub.ncc_taxi_note && (
                          <p className="text-xs text-warning">🚕 {hub.ncc_taxi_note}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteHub.mutate({ id: hub.id, cityId })}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi Hub
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nuovo Hub di Trasporto — {cityName}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo *</Label>
                      <Select value={form.hub_type} onValueChange={(v) => setForm(p => ({ ...p, hub_type: v as HubType }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {HUB_TYPE_OPTIONS.map(o => (
                            <SelectItem key={o.id} value={o.id}>{o.icon} {o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Codice</Label>
                      <Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="es. NAP" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Nome *</Label>
                    <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="es. Aeroporto di Napoli Capodichino" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Latitudine</Label>
                      <Input type="number" step="any" value={form.latitude} onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))} placeholder="40.886" />
                    </div>
                    <div className="space-y-2">
                      <Label>Longitudine</Label>
                      <Input type="number" step="any" value={form.longitude} onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))} placeholder="14.290" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Distanza dal centro (km)</Label>
                      <Input type="number" value={form.distance_from_center_km} onChange={e => setForm(p => ({ ...p, distance_from_center_km: e.target.value }))} placeholder="7" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tempo al centro (min)</Label>
                      <Input type="number" value={form.travel_time_to_center_minutes} onChange={e => setForm(p => ({ ...p, travel_time_to_center_minutes: e.target.value }))} placeholder="25" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Come raggiungere il centro</Label>
                    <Input value={form.transport_to_center} onChange={e => setForm(p => ({ ...p, transport_to_center: e.target.value }))} placeholder="es. Alibus ogni 20 min, Metro L2" />
                  </div>
                  <div className="space-y-2">
                    <Label>🚕 Info NCC/Taxi</Label>
                    <Input value={form.ncc_taxi_note} onChange={e => setForm(p => ({ ...p, ncc_taxi_note: e.target.value }))} placeholder="es. NCC disponibili, prenotare in anticipo" />
                  </div>
                  <div className="space-y-2">
                    <Label>Link prenotazione NCC</Label>
                    <Input value={form.ncc_contact_url} onChange={e => setForm(p => ({ ...p, ncc_contact_url: e.target.value }))} placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Note</Label>
                    <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="es. Terminal 1 per voli nazionali" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">Annulla</Button>
                  <Button onClick={handleSubmit} disabled={createHub.isPending} className="flex-1">
                    {createHub.isPending ? 'Salvataggio...' : 'Salva Hub'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
