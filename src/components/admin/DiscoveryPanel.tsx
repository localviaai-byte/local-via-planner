import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Wand2, Loader2, X, CheckCircle2, MapPin, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { 
  discoverPlaces, 
  getPendingSuggestions, 
  updateSuggestionStatus,
  getSuggestionStats,
  type SuggestedPlace 
} from '@/lib/api/discovery';
import { SuggestedPlaceCard } from './SuggestedPlaceCard';

interface DiscoveryPanelProps {
  cityId: string;
  cityName: string;
  region?: string;
  country?: string;
}

type DiscoveryStatus = 'idle' | 'loading' | 'searching' | 'processing' | 'done' | 'error';

const PLACE_TYPES = [
  { value: 'all', label: 'Tutti i tipi' },
  { value: 'attraction', label: 'Attrazioni' },
  { value: 'restaurant', label: 'Ristoranti' },
  { value: 'bar', label: 'Bar & Caffè' },
  { value: 'club', label: 'Club & Locali notturni' },
  { value: 'experience', label: 'Esperienze' },
  { value: 'view', label: 'Punti panoramici' },
  { value: 'zone', label: 'Zone/Quartieri' },
] as const;

const SEARCH_INTENSITY = [
  { value: 'light', label: 'Leggera (più veloce)', queries: 8 },
  { value: 'normal', label: 'Normale', queries: 15 },
  { value: 'deep', label: 'Profonda', queries: 25 },
  { value: 'exhaustive', label: 'Esaustiva (più lenta)', queries: 40 },
] as const;

export function DiscoveryPanel({ cityId, cityName, region, country }: DiscoveryPanelProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [status, setStatus] = useState<DiscoveryStatus>('loading');
  const [suggestions, setSuggestions] = useState<SuggestedPlace[]>([]);
  const [stats, setStats] = useState({ accepted: 0, rejected: 0 });
  const [savingPlace, setSavingPlace] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Filter settings
  const [selectedPlaceType, setSelectedPlaceType] = useState<string>('all');
  const [searchIntensity, setSearchIntensity] = useState<string>('normal');
  const [focusZone, setFocusZone] = useState<string>('');
  const [searchRadius, setSearchRadius] = useState<string>('city'); // city, zone, neighborhood

  // Load existing pending suggestions on mount
  useEffect(() => {
    async function loadExisting() {
      setStatus('loading');
      try {
        const [pending, existingStats] = await Promise.all([
          getPendingSuggestions(cityId),
          getSuggestionStats(cityId),
        ]);
        
        setSuggestions(pending);
        setStats(existingStats);
        
        // Auto-expand if there are pending suggestions
        if (pending.length > 0) {
          setIsExpanded(true);
        }
        
        setStatus('done');
      } catch (error) {
        console.error('Error loading suggestions:', error);
        setStatus('idle');
      }
    }
    
    loadExisting();
  }, [cityId]);

  const startDiscovery = async () => {
    setStatus('searching');
    setIsExpanded(true);
    setProgress(0);

    try {
      const intensityConfig = SEARCH_INTENSITY.find(i => i.value === searchIntensity);
      
      const result = await discoverPlaces(
        cityName, 
        cityId, 
        region || undefined, 
        country || undefined,
        {
          placeType: selectedPlaceType === 'all' ? undefined : selectedPlaceType,
          focusZone: focusZone.trim() || undefined,
          searchRadius,
          intensity: searchIntensity,
          maxQueries: intensityConfig?.queries || 15,
        },
        (jobProgress) => {
          setProgress(jobProgress);
          // Update status based on progress
          if (jobProgress < 50) {
            setStatus('searching');
          } else {
            setStatus('processing');
          }
        }
      );

      if (!result.success) {
        throw new Error(result.error || 'Discovery failed');
      }

      // Reload from DB to get IDs (includes deduplication)
      const pending = await getPendingSuggestions(cityId);
      setSuggestions(pending);
      const newStats = await getSuggestionStats(cityId);
      setStats(newStats);
      setStatus('done');
      setProgress(100);
      
      if (result.newCount !== undefined && result.newCount > 0) {
        toast.success(`Trovati ${result.newCount} nuovi luoghi da ${result.sourcesCount || 0} fonti!`);
      } else if (result.suggestions && result.suggestions.length > 0) {
        toast.success(`Trovati ${result.suggestions.length} luoghi da ${result.sourcesCount || 0} fonti!`);
      } else {
        toast.info(result.message || 'Nessun nuovo luogo trovato');
      }
    } catch (error) {
      console.error('Discovery error:', error);
      setStatus('error');
      toast.error(error instanceof Error ? error.message : 'Errore durante la ricerca');
    }
  };

  const handleAccept = async (place: SuggestedPlace) => {
    if (!user?.id) {
      toast.error('Devi essere autenticato');
      return;
    }

    if (!place.id) {
      toast.error('Suggerimento non valido');
      return;
    }

    setSavingPlace(place.name);

    try {
      // Create a draft place from the suggestion
      const { data: newPlace, error } = await supabase.from('places').insert({
        city_id: cityId,
        name: place.name,
        place_type: place.place_type,
        address: place.address || null,
        zone: place.zone || null,
        why_people_go: place.why_people_go || [],
        best_times: place.best_times || [],
        status: 'draft',
        created_by: user.id,
        local_one_liner: place.description || null,
        notes_internal: `Auto-discovered with ${Math.round(place.confidence * 100)}% confidence`,
      }).select('id').single();

      if (error) throw error;

      // Update suggestion status in DB
      await updateSuggestionStatus(place.id, 'accepted', newPlace?.id);

      setSuggestions(prev => prev.filter(p => p.id !== place.id));
      setStats(prev => ({ ...prev, accepted: prev.accepted + 1 }));
      queryClient.invalidateQueries({ queryKey: ['city-places', cityId] });
      toast.success(`"${place.name}" aggiunto come bozza`);
    } catch (error) {
      console.error('Error saving place:', error);
      toast.error('Errore nel salvataggio');
    } finally {
      setSavingPlace(null);
    }
  };

  const handleReject = async (place: SuggestedPlace) => {
    if (!place.id) return;

    try {
      await updateSuggestionStatus(place.id, 'rejected');
      setSuggestions(prev => prev.filter(p => p.id !== place.id));
      setStats(prev => ({ ...prev, rejected: prev.rejected + 1 }));
    } catch (error) {
      console.error('Error rejecting:', error);
      toast.error('Errore');
    }
  };

  const acceptAll = async () => {
    for (const place of suggestions) {
      await handleAccept(place);
    }
  };

  const remainingCount = suggestions.length;

  // Loading state
  if (status === 'loading') {
    return (
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Caricamento...
      </div>
    );
  }

  if (!isExpanded) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-4"
      >
        <Button
          variant="outline"
          className="w-full border-dashed border-2 border-gold/50 bg-gold/5 hover:bg-gold/10 text-gold"
          onClick={() => setIsExpanded(true)}
          disabled={status === 'searching' || status === 'processing'}
        >
          {status === 'searching' || status === 'processing' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Scoprendo luoghi...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              🔮 Auto-scopri luoghi per {cityName}
              {stats.accepted > 0 && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({stats.accepted} già aggiunti)
                </span>
              )}
            </>
          )}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mb-6"
    >
      <Card className="border-gold/30 bg-gradient-to-br from-gold/5 to-transparent">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-gold" />
              Auto-Discovery
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search filters */}
          {status !== 'searching' && status !== 'processing' && (
            <div className="space-y-3">
              {/* Filter toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between text-muted-foreground hover:text-foreground"
                onClick={() => setShowFilters(!showFilters)}
              >
                <span className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Opzioni di ricerca
                </span>
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 border-t border-border/50 pt-4"
                  >
                    {/* Place type filter */}
                    <div className="space-y-2">
                      <Label className="text-sm">Tipo di luogo</Label>
                      <Select value={selectedPlaceType} onValueChange={setSelectedPlaceType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {PLACE_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Focus zone input */}
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Zona specifica (opzionale)
                      </Label>
                      <Input
                        placeholder="es. Via Chiaia, Centro Storico, Lungomare..."
                        value={focusZone}
                        onChange={(e) => setFocusZone(e.target.value)}
                        className="bg-background/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        Concentra la ricerca su una via, quartiere o zona specifica
                      </p>
                    </div>

                    {/* Search radius */}
                    <div className="space-y-2">
                      <Label className="text-sm">Raggio di ricerca</Label>
                      <Select value={searchRadius} onValueChange={setSearchRadius}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="neighborhood">Quartiere (più preciso)</SelectItem>
                          <SelectItem value="zone">Zona</SelectItem>
                          <SelectItem value="city">Tutta la città</SelectItem>
                          <SelectItem value="area">Area metropolitana</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Search intensity */}
                    <div className="space-y-2">
                      <Label className="text-sm">Intensità ricerca</Label>
                      <Select value={searchIntensity} onValueChange={setSearchIntensity}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SEARCH_INTENSITY.map(intensity => (
                            <SelectItem key={intensity.value} value={intensity.value}>
                              {intensity.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Ricerche più profonde trovano più luoghi ma richiedono più tempo
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

          {/* Start button */}
              <Button
                className="w-full bg-gold hover:bg-gold/90 text-gold-foreground"
                onClick={startDiscovery}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Avvia ricerca
                {selectedPlaceType !== 'all' && (
                  <span className="ml-1 text-xs opacity-80">
                    ({PLACE_TYPES.find(t => t.value === selectedPlaceType)?.label})
                  </span>
                )}
              </Button>
            </div>
          )}

          {/* Status bar */}
          {status === 'searching' || status === 'processing' ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                {progress < 50 ? 'Cercando su web...' : 'Analizzando risultati con AI...'}
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {progress}% - I risultati già trovati in precedenza verranno ignorati
              </p>
            </div>
          ) : status === 'done' && (suggestions.length > 0 || stats.accepted > 0 || stats.rejected > 0) ? (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 inline mr-1 text-olive" />
                  {stats.accepted} accettati
                </span>
                <span className="text-muted-foreground">
                  {stats.rejected} scartati
                </span>
                <span className="font-medium">
                  {remainingCount} da valutare
                </span>
              </div>
              {remainingCount > 0 && (
                <Button size="sm" variant="outline" onClick={acceptAll}>
                  Accetta tutti
                </Button>
              )}
            </div>
          ) : null}

          {/* Suggestions list */}
          <AnimatePresence mode="popLayout">
            {suggestions.map((place) => (
              <SuggestedPlaceCard
                key={place.id || place.name}
                place={place}
                onAccept={() => handleAccept(place)}
                onReject={() => handleReject(place)}
                isLoading={savingPlace === place.name}
              />
            ))}
          </AnimatePresence>

          {/* Empty state */}
          {status === 'done' && remainingCount === 0 && (
            <div className="text-center py-8">
              {stats.accepted > 0 ? (
                <>
                  <CheckCircle2 className="w-12 h-12 mx-auto text-olive mb-3" />
                  <p className="text-lg font-medium">Tutto fatto!</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.accepted} luoghi aggiunti come bozze da completare
                  </p>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground">Nessun suggerimento rimasto</p>
                </>
              )}
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowFilters(true)}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Cerca ancora
              </Button>
            </div>
          )}

          {/* Retry on error */}
          {status === 'error' && (
            <div className="text-center py-6">
              <p className="text-destructive mb-4">Qualcosa è andato storto</p>
              <Button onClick={startDiscovery}>Riprova</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
