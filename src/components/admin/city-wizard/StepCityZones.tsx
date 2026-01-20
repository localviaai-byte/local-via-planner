import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCityZones, useCreateZone, useDeleteZone } from '@/hooks/useCities';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const ZONE_VIBE_OPTIONS = [
  { id: 'local', label: 'Local' },
  { id: 'tourist', label: 'Turistico' },
  { id: 'nightlife', label: 'Nightlife' },
  { id: 'residential', label: 'Residenziale' },
  { id: 'artsy', label: 'Artistico' },
  { id: 'foodie', label: 'Foodie' },
  { id: 'historic', label: 'Storico' },
];

interface StepCityZonesProps {
  cityId: string | null;
  cityName: string;
}

export default function StepCityZones({ cityId, cityName }: StepCityZonesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: zones, isLoading } = useCityZones(cityId || undefined);
  const createZone = useCreateZone();
  const deleteZone = useDeleteZone();
  
  const [showForm, setShowForm] = useState(false);
  const [newZone, setNewZone] = useState({
    name: '',
    vibe: [] as string[],
    why_go: '',
    when_to_go: '',
  });
  
  const toggleVibe = (vibeId: string) => {
    setNewZone(prev => ({
      ...prev,
      vibe: prev.vibe.includes(vibeId)
        ? prev.vibe.filter(v => v !== vibeId)
        : [...prev.vibe, vibeId]
    }));
  };
  
  const handleAddZone = async () => {
    if (!cityId || !newZone.name.trim()) return;
    
    try {
      await createZone.mutateAsync({
        city_id: cityId,
        name: newZone.name,
        vibe: newZone.vibe,
        why_go: newZone.why_go || null,
        when_to_go: newZone.when_to_go || null,
        created_by: user!.id,
      });
      
      setNewZone({ name: '', vibe: [], why_go: '', when_to_go: '' });
      setShowForm(false);
      toast({ title: 'Zona aggiunta!' });
    } catch {
      toast({ title: 'Errore', variant: 'destructive' });
    }
  };
  
  const handleDeleteZone = async (zoneId: string) => {
    if (!cityId) return;
    
    try {
      await deleteZone.mutateAsync({ zoneId, cityId });
      toast({ title: 'Zona eliminata' });
    } catch {
      toast({ title: 'Errore', variant: 'destructive' });
    }
  };
  
  if (!cityId) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Prima salva la città per aggiungere le zone
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
          Quartieri di {cityName}
        </h2>
        <p className="text-muted-foreground">
          Le zone diventano filtri fondamentali per l'AI
        </p>
      </div>
      
      {/* Existing zones */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-24 rounded-xl skeleton-sand" />
          ))}
        </div>
      ) : zones && zones.length > 0 ? (
        <div className="space-y-3">
          {zones.map((zone) => (
            <Card key={zone.id} className="bg-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-terracotta" />
                      <h4 className="font-medium">{zone.name}</h4>
                    </div>
                    {zone.vibe && zone.vibe.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {zone.vibe.map(v => (
                          <span key={v} className="text-xs px-2 py-0.5 rounded-full bg-secondary">
                            {ZONE_VIBE_OPTIONS.find(o => o.id === v)?.label || v}
                          </span>
                        ))}
                      </div>
                    )}
                    {zone.why_go && (
                      <p className="text-sm text-muted-foreground">{zone.why_go}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteZone(zone.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Nessuna zona ancora</p>
        </div>
      )}
      
      {/* Add zone form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Nuova zona</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome zona *</Label>
                  <Input
                    value={newZone.name}
                    onChange={(e) => setNewZone(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Es: Centro Storico, Vomero..."
                    className="bg-background"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Vibe</Label>
                  <div className="flex flex-wrap gap-2">
                    {ZONE_VIBE_OPTIONS.map(vibe => (
                      <Button
                        key={vibe.id}
                        variant={newZone.vibe.includes(vibe.id) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleVibe(vibe.id)}
                      >
                        {vibe.label}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Perché andarci</Label>
                  <Textarea
                    value={newZone.why_go}
                    onChange={(e) => setNewZone(prev => ({ ...prev, why_go: e.target.value }))}
                    placeholder="Cosa c'è di speciale in questa zona?"
                    className="bg-background resize-none"
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Quando andarci</Label>
                  <Input
                    value={newZone.when_to_go}
                    onChange={(e) => setNewZone(prev => ({ ...prev, when_to_go: e.target.value }))}
                    placeholder="Es: Sera per l'aperitivo, mattina per il mercato..."
                    className="bg-background"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                    Annulla
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={handleAddZone}
                    disabled={!newZone.name.trim() || createZone.isPending}
                  >
                    {createZone.isPending ? 'Salvataggio...' : 'Aggiungi'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Add zone button */}
      {!showForm && (
        <Button 
          variant="outline" 
          className="w-full h-12"
          onClick={() => setShowForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Aggiungi zona
        </Button>
      )}
      
      {/* Skip note */}
      <p className="text-xs text-center text-muted-foreground">
        Le zone sono opzionali ma consigliate per città medio-grandi
      </p>
    </motion.div>
  );
}
