import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Save, Trash2, MapPin, Plus, 
  Building2, AlertTriangle, ChevronDown, ChevronUp, Edit2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  useCity, 
  useCityZones, 
  useUpdateCity, 
  useCreateZone, 
  useDeleteZone,
  useDeleteCity,
  useUpdateZone
} from '@/hooks/useCities';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  CITY_TAG_OPTIONS, 
  CITY_WALKABILITY_OPTIONS, 
  CITY_RHYTHM_OPTIONS,
  BEST_TIME_OF_DAY_OPTIONS,
  VIBE_LABEL_OPTIONS,
  TIME_BUCKET_OPTIONS,
  type CityTag, 
  type CityWalkability, 
  type CityRhythm,
  type BestTimeOfDay,
  type CityZone,
  type VibeLabel,
  type TimeBucket
} from '@/types/database';

const ZONE_VIBE_OPTIONS = [
  { id: 'local', label: 'Local' },
  { id: 'tourist', label: 'Turistico' },
  { id: 'nightlife', label: 'Nightlife' },
  { id: 'residential', label: 'Residenziale' },
  { id: 'artsy', label: 'Artistico' },
  { id: 'foodie', label: 'Foodie' },
  { id: 'historic', label: 'Storico' },
];

interface ZoneFormState {
  name: string;
  description: string;
  vibe: string[];
  vibe_primary: VibeLabel | null;
  vibe_secondary: VibeLabel | null;
  best_time: TimeBucket | null;
  touristy_score: number | null;
  safety_note: string;
  local_tip: string;
  why_go: string;
  when_to_go: string;
}

const DEFAULT_ZONE_FORM: ZoneFormState = {
  name: '',
  description: '',
  vibe: [],
  vibe_primary: null,
  vibe_secondary: null,
  best_time: null,
  touristy_score: null,
  safety_note: '',
  local_tip: '',
  why_go: '',
  when_to_go: '',
};

export default function CityEdit() {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const { data: city, isLoading: cityLoading } = useCity(cityId);
  const { data: zones, isLoading: zonesLoading } = useCityZones(cityId);
  const updateCity = useUpdateCity();
  const deleteCity = useDeleteCity();
  const createZone = useCreateZone();
  const updateZone = useUpdateZone();
  const deleteZone = useDeleteZone();
  
  // City form state
  const [cityForm, setCityForm] = useState({
    name: '',
    region: '',
    country: 'Italia',
    description: '',
    tags: [] as CityTag[],
    walkable: null as CityWalkability | null,
    rhythm: null as CityRhythm | null,
    best_times: [] as BestTimeOfDay[],
    tourist_errors: '',
    local_warning: '',
  });
  
  // Zone form state
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [zoneForm, setZoneForm] = useState<ZoneFormState>(DEFAULT_ZONE_FORM);
  const [expandedZone, setExpandedZone] = useState<string | null>(null);
  
  // Load city data into form
  useEffect(() => {
    if (city) {
      setCityForm({
        name: city.name,
        region: city.region || '',
        country: city.country,
        description: city.description || '',
        tags: city.tags || [],
        walkable: city.walkable,
        rhythm: city.rhythm,
        best_times: city.best_times || [],
        tourist_errors: city.tourist_errors || '',
        local_warning: city.local_warning || '',
      });
    }
  }, [city]);
  
  const handleSaveCity = async () => {
    if (!cityId) return;
    
    try {
      await updateCity.mutateAsync({
        cityId,
        updates: {
          name: cityForm.name,
          region: cityForm.region || null,
          country: cityForm.country,
          description: cityForm.description || null,
          tags: cityForm.tags,
          walkable: cityForm.walkable,
          rhythm: cityForm.rhythm,
          best_times: cityForm.best_times,
          tourist_errors: cityForm.tourist_errors || null,
          local_warning: cityForm.local_warning || null,
        }
      });
      toast({ title: 'Città aggiornata!' });
    } catch {
      toast({ title: 'Errore', description: 'Impossibile salvare le modifiche', variant: 'destructive' });
    }
  };
  
  const handleDeleteCity = async () => {
    if (!cityId) return;
    
    try {
      await deleteCity.mutateAsync(cityId);
      toast({ title: 'Città eliminata' });
      navigate('/admin/cities');
    } catch {
      toast({ title: 'Errore', description: 'Impossibile eliminare la città', variant: 'destructive' });
    }
  };
  
  const toggleTag = (tagId: CityTag) => {
    setCityForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId]
    }));
  };
  
  const toggleBestTime = (timeId: BestTimeOfDay) => {
    setCityForm(prev => ({
      ...prev,
      best_times: prev.best_times.includes(timeId)
        ? prev.best_times.filter(t => t !== timeId)
        : [...prev.best_times, timeId]
    }));
  };
  
  // Zone handlers
  const handleStartEditZone = (zone: CityZone) => {
    setEditingZoneId(zone.id);
    setZoneForm({
      name: zone.name,
      description: zone.description || '',
      vibe: zone.vibe || [],
      vibe_primary: zone.vibe_primary,
      vibe_secondary: zone.vibe_secondary,
      best_time: zone.best_time,
      touristy_score: zone.touristy_score,
      safety_note: zone.safety_note || '',
      local_tip: zone.local_tip || '',
      why_go: zone.why_go || '',
      when_to_go: zone.when_to_go || '',
    });
    setShowZoneForm(true);
  };
  
  const handleSaveZone = async () => {
    if (!cityId || !zoneForm.name.trim()) return;
    
    try {
      if (editingZoneId) {
        await updateZone.mutateAsync({
          zoneId: editingZoneId,
          updates: {
            name: zoneForm.name,
            description: zoneForm.description || null,
            vibe: zoneForm.vibe.length > 0 ? zoneForm.vibe : null,
            vibe_primary: zoneForm.vibe_primary,
            vibe_secondary: zoneForm.vibe_secondary,
            best_time: zoneForm.best_time,
            touristy_score: zoneForm.touristy_score,
            safety_note: zoneForm.safety_note || null,
            local_tip: zoneForm.local_tip || null,
            why_go: zoneForm.why_go || null,
            when_to_go: zoneForm.when_to_go || null,
          }
        });
        toast({ title: 'Zona aggiornata!' });
      } else {
        await createZone.mutateAsync({
          city_id: cityId,
          name: zoneForm.name,
          description: zoneForm.description || null,
          vibe: zoneForm.vibe.length > 0 ? zoneForm.vibe : null,
          vibe_primary: zoneForm.vibe_primary || undefined,
          vibe_secondary: zoneForm.vibe_secondary || undefined,
          best_time: zoneForm.best_time || undefined,
          touristy_score: zoneForm.touristy_score || undefined,
          safety_note: zoneForm.safety_note || undefined,
          local_tip: zoneForm.local_tip || undefined,
          why_go: zoneForm.why_go || null,
          when_to_go: zoneForm.when_to_go || null,
          created_by: user!.id,
        });
        toast({ title: 'Zona aggiunta!' });
      }
      
      resetZoneForm();
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
  
  const resetZoneForm = () => {
    setZoneForm(DEFAULT_ZONE_FORM);
    setShowZoneForm(false);
    setEditingZoneId(null);
  };
  
  const toggleZoneVibe = (vibeId: string) => {
    setZoneForm(prev => ({
      ...prev,
      vibe: prev.vibe.includes(vibeId)
        ? prev.vibe.filter(v => v !== vibeId)
        : [...prev.vibe, vibeId]
    }));
  };
  
  if (cityLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="h-12 rounded-xl skeleton-sand mb-4" />
        <div className="h-64 rounded-xl skeleton-sand" />
      </div>
    );
  }
  
  if (!city) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Città non trovata</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b">
        <div className="px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/cities/${cityId}`)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-terracotta" />
              <h1 className="font-display text-lg font-semibold">Modifica città</h1>
            </div>
          </div>
        </div>
      </header>
      
      <main className="p-4 space-y-6">
        {/* City Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informazioni base</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome città *</Label>
              <Input
                value={cityForm.name}
                onChange={(e) => setCityForm(prev => ({ ...prev, name: e.target.value }))}
                className="bg-background"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Regione</Label>
                <Input
                  value={cityForm.region}
                  onChange={(e) => setCityForm(prev => ({ ...prev, region: e.target.value }))}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Paese</Label>
                <Input
                  value={cityForm.country}
                  onChange={(e) => setCityForm(prev => ({ ...prev, country: e.target.value }))}
                  className="bg-background"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Descrizione</Label>
              <Textarea
                value={cityForm.description}
                onChange={(e) => setCityForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Una breve descrizione della città..."
                className="bg-background resize-none"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Caratteristiche</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tag città</Label>
              <div className="flex flex-wrap gap-2">
                {CITY_TAG_OPTIONS.map(tag => (
                  <Button
                    key={tag.id}
                    variant={cityForm.tags.includes(tag.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.icon} {tag.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Walkability</Label>
              <div className="flex flex-wrap gap-2">
                {CITY_WALKABILITY_OPTIONS.map(opt => (
                  <Button
                    key={opt.id}
                    variant={cityForm.walkable === opt.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCityForm(prev => ({ ...prev, walkable: opt.id }))}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Ritmo</Label>
              <div className="flex flex-wrap gap-2">
                {CITY_RHYTHM_OPTIONS.map(opt => (
                  <Button
                    key={opt.id}
                    variant={cityForm.rhythm === opt.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCityForm(prev => ({ ...prev, rhythm: opt.id }))}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Momenti migliori</Label>
              <div className="flex flex-wrap gap-2">
                {BEST_TIME_OF_DAY_OPTIONS.map(opt => (
                  <Button
                    key={opt.id}
                    variant={cityForm.best_times.includes(opt.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleBestTime(opt.id)}
                  >
                    {opt.icon} {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Warnings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-gold" />
              Avvisi locals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Errori tipici dei turisti</Label>
              <Textarea
                value={cityForm.tourist_errors}
                onChange={(e) => setCityForm(prev => ({ ...prev, tourist_errors: e.target.value }))}
                placeholder="Cosa sbagliano spesso i turisti?"
                className="bg-background resize-none"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Avviso locale</Label>
              <Textarea
                value={cityForm.local_warning}
                onChange={(e) => setCityForm(prev => ({ ...prev, local_warning: e.target.value }))}
                placeholder="Cosa dovrebbe sapere chi visita?"
                className="bg-background resize-none"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
        
        <Separator />
        
        {/* Zones / Quartieri */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-terracotta" />
              Zone / Quartieri
            </h2>
            {!showZoneForm && (
              <Button size="sm" onClick={() => setShowZoneForm(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Aggiungi
              </Button>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Le zone sono fondamentali per organizzare le attrazioni e ottimizzare gli itinerari AI.
          </p>
          
          {/* Zone list */}
          {zonesLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-20 rounded-xl skeleton-sand" />)}
            </div>
          ) : zones && zones.length > 0 ? (
            <div className="space-y-3">
              {zones.map((zone) => (
                <Card key={zone.id} className="bg-card">
                  <CardContent className="p-4">
                    <div 
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => setExpandedZone(expandedZone === zone.id ? null : zone.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-terracotta" />
                          <h4 className="font-medium">{zone.name}</h4>
                          {zone.vibe_primary && (
                            <Badge variant="secondary" className="text-xs">
                              {VIBE_LABEL_OPTIONS.find(v => v.id === zone.vibe_primary)?.label}
                            </Badge>
                          )}
                        </div>
                        {zone.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{zone.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEditZone(zone);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminare "{zone.name}"?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Le attrazioni associate a questa zona perderanno il riferimento.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annulla</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDeleteZone(zone.id)}
                              >
                                Elimina
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        {expandedZone === zone.id ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {expandedZone === zone.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t space-y-2 text-sm"
                        >
                          {zone.vibe && zone.vibe.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {zone.vibe.map(v => (
                                <Badge key={v} variant="outline" className="text-xs">
                                  {ZONE_VIBE_OPTIONS.find(o => o.id === v)?.label || v}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {zone.why_go && <p><strong>Perché:</strong> {zone.why_go}</p>}
                          {zone.when_to_go && <p><strong>Quando:</strong> {zone.when_to_go}</p>}
                          {zone.local_tip && <p><strong>Tip:</strong> {zone.local_tip}</p>}
                          {zone.touristy_score && (
                            <p><strong>Turisticità:</strong> {zone.touristy_score}/5</p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nessuna zona ancora</p>
              <p className="text-xs mt-1">Aggiungi quartieri per organizzare meglio i contenuti</p>
            </div>
          )}
          
          {/* Zone form */}
          <AnimatePresence>
            {showZoneForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      {editingZoneId ? 'Modifica zona' : 'Nuova zona'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nome zona *</Label>
                      <Input
                        value={zoneForm.name}
                        onChange={(e) => setZoneForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Es: Centro Storico, Vomero..."
                        className="bg-background"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Descrizione</Label>
                      <Textarea
                        value={zoneForm.description}
                        onChange={(e) => setZoneForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Cosa caratterizza questa zona?"
                        className="bg-background resize-none"
                        rows={2}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Vibe generale</Label>
                      <div className="flex flex-wrap gap-2">
                        {ZONE_VIBE_OPTIONS.map(vibe => (
                          <Button
                            key={vibe.id}
                            variant={zoneForm.vibe.includes(vibe.id) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleZoneVibe(vibe.id)}
                          >
                            {vibe.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Vibe primaria</Label>
                        <div className="flex flex-wrap gap-1">
                          {VIBE_LABEL_OPTIONS.map(opt => (
                            <Button
                              key={opt.id}
                              variant={zoneForm.vibe_primary === opt.id ? 'default' : 'outline'}
                              size="sm"
                              className="text-xs px-2 py-1 h-auto"
                              onClick={() => setZoneForm(prev => ({ 
                                ...prev, 
                                vibe_primary: prev.vibe_primary === opt.id ? null : opt.id 
                              }))}
                            >
                              {opt.icon}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Best time</Label>
                        <div className="flex flex-wrap gap-1">
                          {TIME_BUCKET_OPTIONS.slice(0, 4).map(opt => (
                            <Button
                              key={opt.id}
                              variant={zoneForm.best_time === opt.id ? 'default' : 'outline'}
                              size="sm"
                              className="text-xs px-2 py-1 h-auto"
                              onClick={() => setZoneForm(prev => ({ 
                                ...prev, 
                                best_time: prev.best_time === opt.id ? null : opt.id 
                              }))}
                            >
                              {opt.icon}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Turisticità (1-5)</Label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(score => (
                          <Button
                            key={score}
                            variant={zoneForm.touristy_score === score ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setZoneForm(prev => ({ 
                              ...prev, 
                              touristy_score: prev.touristy_score === score ? null : score 
                            }))}
                          >
                            {score}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Perché andarci</Label>
                      <Textarea
                        value={zoneForm.why_go}
                        onChange={(e) => setZoneForm(prev => ({ ...prev, why_go: e.target.value }))}
                        placeholder="Cosa c'è di speciale in questa zona?"
                        className="bg-background resize-none"
                        rows={2}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Quando andarci</Label>
                      <Input
                        value={zoneForm.when_to_go}
                        onChange={(e) => setZoneForm(prev => ({ ...prev, when_to_go: e.target.value }))}
                        placeholder="Es: Sera per l'aperitivo..."
                        className="bg-background"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Local tip</Label>
                      <Input
                        value={zoneForm.local_tip}
                        onChange={(e) => setZoneForm(prev => ({ ...prev, local_tip: e.target.value }))}
                        placeholder="Un consiglio da local..."
                        className="bg-background"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={resetZoneForm}>
                        Annulla
                      </Button>
                      <Button 
                        className="flex-1" 
                        onClick={handleSaveZone}
                        disabled={!zoneForm.name.trim() || createZone.isPending || updateZone.isPending}
                      >
                        {createZone.isPending || updateZone.isPending ? 'Salvataggio...' : 'Salva'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <Separator />
        
        {/* Danger zone */}
        {isAdmin && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-lg text-destructive flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Zona pericolosa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                L'eliminazione è irreversibile. Tutti i contenuti associati perderanno il riferimento alla città.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Elimina città
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Eliminare "{city.name}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Questa azione è irreversibile. Tutte le zone e i riferimenti andranno persi.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={handleDeleteCity}
                    >
                      Elimina definitivamente
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        )}
      </main>
      
      {/* Save button */}
      <footer className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-sm border-t p-4">
        <Button 
          className="w-full"
          onClick={handleSaveCity}
          disabled={!cityForm.name.trim() || updateCity.isPending}
        >
          {updateCity.isPending ? (
            'Salvataggio...'
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salva modifiche
            </>
          )}
        </Button>
      </footer>
    </div>
  );
}
