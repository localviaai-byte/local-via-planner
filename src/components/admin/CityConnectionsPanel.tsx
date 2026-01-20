import { useState, useMemo } from 'react';
import { Plus, Train, Car, Bus, Ship, Footprints, Shuffle, Clock, AlertTriangle, Lightbulb, MapPin, ChevronDown, ChevronUp, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCityConnections, useCreateConnection, useDeleteConnection } from '@/hooks/useCityConnections';
import { useCitiesWithStats } from '@/hooks/useCities';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  CityConnection, 
  CONNECTION_TYPE_OPTIONS, 
  TRANSPORT_MODE_OPTIONS,
  TIME_BUCKET_OPTIONS,
  DAY_WORTH_OPTIONS,
  FRICTION_LABELS,
  RELIABILITY_LABELS,
  DEFAULT_CONNECTION_FORM_DATA,
  type CityConnectionFormData,
  type TransportMode,
  type ConnectionType,
  type TimeBucket,
  type DayWorthType
} from '@/types/database';

interface CityConnectionsPanelProps {
  cityId: string;
  cityName: string;
}

const TRANSPORT_ICONS: Record<TransportMode, React.ReactNode> = {
  train: <Train className="w-4 h-4" />,
  car: <Car className="w-4 h-4" />,
  bus: <Bus className="w-4 h-4" />,
  ferry: <Ship className="w-4 h-4" />,
  walk: <Footprints className="w-4 h-4" />,
  mixed: <Shuffle className="w-4 h-4" />,
};

const CONNECTION_COLORS: Record<ConnectionType, string> = {
  day_trip: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  metro: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  nearby_city: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  multi_city: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

export function CityConnectionsPanel({ cityId, cityName }: CityConnectionsPanelProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState<CityConnectionFormData>(DEFAULT_CONNECTION_FORM_DATA);
  
  const { data: connections = [], isLoading } = useCityConnections(cityId);
  const { data: allCities = [] } = useCitiesWithStats();
  const createConnection = useCreateConnection();
  const deleteConnection = useDeleteConnection();
  
  // Filter out the current city from the list
  const availableCities = allCities.filter(c => c.id !== cityId);
  
  // Validation warnings
  const validationWarnings = useMemo(() => {
    const warnings: string[] = [];
    
    if (formData.typical_min_minutes && formData.typical_max_minutes) {
      if (formData.typical_min_minutes > formData.typical_max_minutes) {
        warnings.push('❌ Il tempo minimo non può essere maggiore del tempo massimo');
      }
    }
    
    if (formData.friction_score >= 4 && formData.connection_type === 'day_trip') {
      warnings.push('⚠️ Day-trip con friction alta: assicurati che ne valga la pena');
    }
    
    if (formData.typical_min_minutes && formData.typical_min_minutes >= 90 && formData.connection_type === 'day_trip') {
      warnings.push('💡 Con 90+ min di viaggio, considera "Multi-città" invece di "Day-trip"');
    }
    
    return warnings;
  }, [formData]);
  
  const hasBlockingError = validationWarnings.some(w => w.startsWith('❌'));
  
  const handleSubmit = async () => {
    if (!formData.city_id_to || !user) {
      toast.error('Seleziona una città di destinazione');
      return;
    }
    
    if (hasBlockingError) {
      toast.error('Correggi gli errori prima di salvare');
      return;
    }
    
    try {
      await createConnection.mutateAsync({
        cityIdFrom: cityId,
        formData,
        userId: user.id,
      });
      toast.success('Connessione creata!');
      setShowAddDialog(false);
      setFormData(DEFAULT_CONNECTION_FORM_DATA);
    } catch (error) {
      toast.error('Errore nella creazione della connessione');
    }
  };
  
  const handleDelete = async (connection: CityConnection) => {
    try {
      await deleteConnection.mutateAsync({
        connectionId: connection.id,
        cityIdFrom: cityId,
      });
      toast.success('Connessione rimossa');
    } catch (error) {
      toast.error('Errore nella rimozione');
    }
  };
  
  const formatTime = (min: number | null, max: number | null) => {
    if (!min) return '—';
    if (!max || min === max) return `${min} min`;
    return `${min}–${max} min`;
  };
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Città Collegate
                <Badge variant="secondary" className="ml-2">{connections.length}</Badge>
              </CardTitle>
              {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-muted-foreground text-sm">Caricamento...</div>
            ) : connections.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nessuna connessione definita</p>
                <p className="text-xs mt-1">Aggiungi città raggiungibili per day-trip o gite</p>
              </div>
            ) : (
              <div className="space-y-3">
                {connections.map((conn) => (
                  <div 
                    key={conn.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                        {TRANSPORT_ICONS[conn.primary_mode]}
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {conn.to_city?.name || 'Città'}
                          <Badge className={CONNECTION_COLORS[conn.connection_type]} variant="secondary">
                            {CONNECTION_TYPE_OPTIONS.find(o => o.id === conn.connection_type)?.label}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {formatTime(conn.typical_min_minutes, conn.typical_max_minutes)}
                          {conn.local_tip && (
                            <span className="flex items-center gap-1 text-amber-600">
                              <Lightbulb className="w-3 h-3" />
                              Tip
                            </span>
                          )}
                          {conn.warning && (
                            <span className="flex items-center gap-1 text-red-600">
                              <AlertTriangle className="w-3 h-3" />
                              Warning
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(conn)}
                      className="text-muted-foreground hover:text-destructive"
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
                  Aggiungi Connessione
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nuova Connessione da {cityName}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  {/* Target City */}
                  <div className="space-y-2">
                    <Label>Città di destinazione *</Label>
                    <Select
                      value={formData.city_id_to}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, city_id_to: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona città..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCities.map(city => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.name} {city.region && `(${city.region})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Connection Type & Transport */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo connessione</Label>
                      <Select
                        value={formData.connection_type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, connection_type: value as ConnectionType }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONNECTION_TYPE_OPTIONS.map(opt => (
                            <SelectItem key={opt.id} value={opt.id}>
                              {opt.icon} {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Mezzo principale</Label>
                      <Select
                        value={formData.primary_mode}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, primary_mode: value as TransportMode }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TRANSPORT_MODE_OPTIONS.map(opt => (
                            <SelectItem key={opt.id} value={opt.id}>
                              {opt.icon} {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Travel Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tempo minimo (porta-a-porta)</Label>
                      <Input
                        type="number"
                        value={formData.typical_min_minutes || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          typical_min_minutes: e.target.value ? parseInt(e.target.value) : null 
                        }))}
                        placeholder="es. 30"
                      />
                      <p className="text-xs text-muted-foreground">Includi attese, cambi, spostamenti</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Tempo massimo (porta-a-porta)</Label>
                      <Input
                        type="number"
                        value={formData.typical_max_minutes || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          typical_max_minutes: e.target.value ? parseInt(e.target.value) : null 
                        }))}
                        placeholder="es. 45"
                      />
                      <p className="text-xs text-muted-foreground">Nel caso peggiore realistico</p>
                    </div>
                  </div>
                  
                  {/* Day Worth - NEW */}
                  <div className="space-y-2">
                    <Label>Questa connessione...</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {DAY_WORTH_OPTIONS.map(opt => (
                        <Button
                          key={opt.id}
                          type="button"
                          variant={formData.day_worth === opt.id ? 'default' : 'outline'}
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            day_worth: prev.day_worth === opt.id ? null : opt.id as DayWorthType 
                          }))}
                          className="h-auto py-3 flex flex-col items-center text-center"
                        >
                          <span className="text-lg">{opt.icon}</span>
                          <span className="text-xs font-medium">{opt.label}</span>
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Aiuta il planner a capire quanto tempo dedicare</p>
                  </div>
                  
                  {/* Reliability & Friction */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Affidabilità ({formData.reliability_score}/5)</Label>
                      <Slider
                        value={[formData.reliability_score]}
                        onValueChange={([value]) => setFormData(prev => ({ ...prev, reliability_score: value }))}
                        min={1}
                        max={5}
                        step={1}
                      />
                      <p className="text-xs text-muted-foreground font-medium">
                        {RELIABILITY_LABELS[formData.reliability_score]}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Friction ({formData.friction_score}/5)</Label>
                      <Slider
                        value={[formData.friction_score]}
                        onValueChange={([value]) => setFormData(prev => ({ ...prev, friction_score: value }))}
                        min={1}
                        max={5}
                        step={1}
                      />
                      <p className="text-xs text-muted-foreground font-medium">
                        {FRICTION_LABELS[formData.friction_score]}
                      </p>
                    </div>
                  </div>
                  
                  {/* Best Times */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Quando conviene davvero</Label>
                      <span className="text-xs text-muted-foreground">(opzionale)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Partenza consigliata</p>
                        <div className="flex flex-wrap gap-1">
                          {TIME_BUCKET_OPTIONS.slice(0, 4).map(opt => (
                            <Button
                              key={opt.id}
                              type="button"
                              size="sm"
                              variant={formData.best_departure_time.includes(opt.id as TimeBucket) ? 'default' : 'outline'}
                              onClick={() => {
                                const current = formData.best_departure_time;
                                const updated = current.includes(opt.id as TimeBucket)
                                  ? current.filter(t => t !== opt.id)
                                  : [...current, opt.id as TimeBucket];
                                setFormData(prev => ({ ...prev, best_departure_time: updated }));
                              }}
                              title={opt.label}
                            >
                              {opt.icon}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Rientro consigliato</p>
                        <div className="flex flex-wrap gap-1">
                          {TIME_BUCKET_OPTIONS.slice(3).map(opt => (
                            <Button
                              key={opt.id}
                              type="button"
                              size="sm"
                              variant={formData.best_return_time.includes(opt.id as TimeBucket) ? 'default' : 'outline'}
                              onClick={() => {
                                const current = formData.best_return_time;
                                const updated = current.includes(opt.id as TimeBucket)
                                  ? current.filter(t => t !== opt.id)
                                  : [...current, opt.id as TimeBucket];
                                setFormData(prev => ({ ...prev, best_return_time: updated }));
                              }}
                              title={opt.label}
                            >
                              {opt.icon}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Notes */}
                  <div className="space-y-2">
                    <Label>Nota costi</Label>
                    <Input
                      value={formData.cost_note}
                      onChange={(e) => setFormData(prev => ({ ...prev, cost_note: e.target.value }))}
                      placeholder="es. Treno economico, parking caro in centro"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Local tip 💡</Label>
                    <Textarea
                      value={formData.local_tip}
                      onChange={(e) => setFormData(prev => ({ ...prev, local_tip: e.target.value }))}
                      placeholder="es. Parti entro le 9:30 per evitare i gruppi organizzati"
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Warning ⚠️</Label>
                    <Textarea
                      value={formData.warning}
                      onChange={(e) => setFormData(prev => ({ ...prev, warning: e.target.value }))}
                      placeholder="es. Weekend: traffico intenso, evita ore 10-12"
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Nota stagionalità</Label>
                    <Input
                      value={formData.seasonality_note}
                      onChange={(e) => setFormData(prev => ({ ...prev, seasonality_note: e.target.value }))}
                      placeholder="es. Estate: navette sostitutive"
                    />
                  </div>
                  
                  {/* Validation Warnings */}
                  {validationWarnings.length > 0 && (
                    <div className="space-y-2">
                      {validationWarnings.map((warning, i) => (
                        <Alert key={i} variant={warning.startsWith('❌') ? 'destructive' : 'default'} className="py-2">
                          <Info className="h-4 w-4" />
                          <AlertDescription className="text-sm">{warning}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                    Annulla
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={createConnection.isPending || hasBlockingError} 
                    className="flex-1"
                  >
                    {createConnection.isPending ? 'Salvataggio...' : 'Salva Connessione'}
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
