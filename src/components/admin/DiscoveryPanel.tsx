import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Wand2, Loader2, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { discoverPlaces, type SuggestedPlace } from '@/lib/api/discovery';
import { SuggestedPlaceCard } from './SuggestedPlaceCard';

interface DiscoveryPanelProps {
  cityId: string;
  cityName: string;
  region?: string;
  country?: string;
}

type DiscoveryStatus = 'idle' | 'searching' | 'processing' | 'done' | 'error';

export function DiscoveryPanel({ cityId, cityName, region, country }: DiscoveryPanelProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [status, setStatus] = useState<DiscoveryStatus>('idle');
  const [suggestions, setSuggestions] = useState<SuggestedPlace[]>([]);
  const [accepted, setAccepted] = useState<string[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [savingPlace, setSavingPlace] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const startDiscovery = async () => {
    setStatus('searching');
    setSuggestions([]);
    setAccepted([]);
    setRejected([]);
    setIsExpanded(true);

    try {
      setStatus('processing');
      const result = await discoverPlaces(cityName, cityId, region || undefined, country || undefined);

      if (!result.success) {
        throw new Error(result.error || 'Discovery failed');
      }

      if (result.suggestions && result.suggestions.length > 0) {
        setSuggestions(result.suggestions);
        setStatus('done');
        toast.success(`Trovati ${result.suggestions.length} luoghi da ${result.sourcesCount || 0} fonti!`);
      } else {
        setStatus('done');
        toast.info(result.message || 'Nessun luogo trovato');
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

    setSavingPlace(place.name);

    try {
      // Create a draft place from the suggestion
      const { error } = await supabase.from('places').insert({
        city_id: cityId,
        name: place.name,
        place_type: place.place_type,
        address: place.address || null,
        zone: place.zone || null,
        why_people_go: place.why_people_go || [],
        best_times: place.best_times || [],
        status: 'draft',
        created_by: user.id,
        // Mark as needing completion
        local_one_liner: place.description || null,
        notes_internal: `Auto-discovered with ${Math.round(place.confidence * 100)}% confidence`,
      });

      if (error) throw error;

      setAccepted(prev => [...prev, place.name]);
      setSuggestions(prev => prev.filter(p => p.name !== place.name));
      queryClient.invalidateQueries({ queryKey: ['city-places', cityId] });
      toast.success(`"${place.name}" aggiunto come bozza`);
    } catch (error) {
      console.error('Error saving place:', error);
      toast.error('Errore nel salvataggio');
    } finally {
      setSavingPlace(null);
    }
  };

  const handleReject = (place: SuggestedPlace) => {
    setRejected(prev => [...prev, place.name]);
    setSuggestions(prev => prev.filter(p => p.name !== place.name));
  };

  const acceptAll = async () => {
    for (const place of suggestions) {
      await handleAccept(place);
    }
  };

  const remainingCount = suggestions.length;
  const totalProcessed = accepted.length + rejected.length;
  const totalFound = totalProcessed + remainingCount;

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
          onClick={startDiscovery}
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
          {/* Status bar */}
          {status === 'searching' || status === 'processing' ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                {status === 'searching' ? 'Cercando su web...' : 'Analizzando risultati con AI...'}
              </div>
              <Progress value={status === 'searching' ? 30 : 70} className="h-2" />
            </div>
          ) : status === 'done' && totalFound > 0 ? (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 inline mr-1 text-olive" />
                  {accepted.length} accettati
                </span>
                <span className="text-muted-foreground">
                  {rejected.length} scartati
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
                key={place.name}
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
              {accepted.length > 0 ? (
                <>
                  <CheckCircle2 className="w-12 h-12 mx-auto text-olive mb-3" />
                  <p className="text-lg font-medium">Tutto fatto!</p>
                  <p className="text-sm text-muted-foreground">
                    {accepted.length} luoghi aggiunti come bozze da completare
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
                onClick={startDiscovery}
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
