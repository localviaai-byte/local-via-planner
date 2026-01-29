import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import type { SuggestedPlace } from '@/lib/api/discovery';
import { toast } from 'sonner';

interface SuggestionsSectionProps {
  cityId: string;
  userId: string;
}

export function SuggestionsSection({ cityId, userId }: SuggestionsSectionProps) {
  const navigate = useNavigate();
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const { data: suggestions = [], isLoading, refetch } = useQuery({
    queryKey: ['pending-suggestions', cityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('place_suggestions')
        .select('*')
        .eq('city_id', cityId)
        .eq('status', 'pending')
        .order('confidence', { ascending: false });

      if (error) throw error;
      return (data || []) as (SuggestedPlace & { id: string; city_id: string })[];
    },
    enabled: !!cityId,
  });

  const handleClassify = async (suggestion: SuggestedPlace & { id: string; city_id: string }) => {
    setConvertingId(suggestion.id);
    
    try {
      // Create a draft place from the suggestion
      const { data: newPlace, error: insertError } = await supabase
        .from('places')
        .insert({
          city_id: suggestion.city_id,
          name: suggestion.name,
          place_type: suggestion.place_type as 'attraction' | 'bar' | 'restaurant' | 'club' | 'experience' | 'view',
          address: suggestion.address || null,
          zone: suggestion.zone || null,
          why_people_go: suggestion.why_people_go || [],
          best_times: suggestion.best_times || [],
          created_by: userId,
          status: 'draft',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update suggestion status to accepted
      const { error: updateError } = await supabase
        .from('place_suggestions')
        .update({ 
          status: 'accepted',
          accepted_place_id: newPlace.id 
        })
        .eq('id', suggestion.id);

      if (updateError) throw updateError;

      toast.success('Luogo creato! Ora puoi completare la classificazione.');
      
      // Navigate to edit the new place
      navigate(`/contributor/places/${newPlace.id}/edit`);
    } catch (error) {
      console.error('Error converting suggestion:', error);
      toast.error('Errore durante la conversione del suggerimento');
    } finally {
      setConvertingId(null);
    }
  };

  const getPlaceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      attraction: 'Attrazione',
      bar: 'Bar',
      restaurant: 'Ristorante',
      club: 'Club',
      view: 'Panorama',
      experience: 'Esperienza',
      zone: 'Zona',
    };
    return labels[type] || type;
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return <Badge className="bg-primary/20 text-primary border-primary/30">Alta affidabilità</Badge>;
    } else if (confidence >= 0.5) {
      return <Badge variant="outline" className="border-amber-500/50 text-amber-600">Media</Badge>;
    }
    return <Badge variant="secondary">Da verificare</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-display">Luoghi da classificare</CardTitle>
            </div>
            <Badge variant="secondary" className="font-mono">
              {suggestions.length}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Questi luoghi sono stati suggeriti dall'AI. Classificali per renderli disponibili!
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {suggestions.map((suggestion) => (
              <div 
                key={suggestion.id}
                className="p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-medium">{suggestion.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {getPlaceTypeLabel(suggestion.place_type)}
                      </Badge>
                      {getConfidenceBadge(suggestion.confidence)}
                    </div>
                    {suggestion.zone && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <MapPin className="w-3 h-3" />
                        <span>{suggestion.zone}</span>
                      </div>
                    )}
                    {suggestion.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {suggestion.description}
                      </p>
                    )}
                    {suggestion.best_times && suggestion.best_times.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{suggestion.best_times.join(', ')}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleClassify(suggestion)}
                    disabled={convertingId === suggestion.id}
                    className="shrink-0"
                  >
                    {convertingId === suggestion.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Classifica
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
