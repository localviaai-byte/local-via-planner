import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { PlaceFormData, BestTime } from '@/types/database';

interface AIPrefillData {
  address: string | null;
  zone: string | null;
  cuisine_type: string | null;
  price_range: 'budget' | 'moderate' | 'expensive' | 'luxury' | null;
  indoor_outdoor: 'indoor' | 'outdoor' | 'both' | null;
  best_times: BestTime[];
  social_level: number | null;
  vibe_touristy_to_local: number | null;
  local_warning: string | null;
  suggested_one_liner: string | null;
  latitude: number | null;
  longitude: number | null;
}

export function useAIPrefill() {
  const [isLoading, setIsLoading] = useState(false);

  const prefillPlace = async (
    placeName: string,
    placeType: string | null,
    cityName: string,
    cityRegion?: string | null,
    cityLatitude?: number | null,
    cityLongitude?: number | null
  ): Promise<Partial<PlaceFormData> | null> => {
    if (!placeName.trim() || !cityName.trim()) {
      toast.error('Inserisci prima il nome del posto');
      return null;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-prefill-place', {
        body: {
          placeName: placeName.trim(),
          placeType: placeType || 'attraction',
          cityName: cityName.trim(),
          cityRegion: cityRegion || undefined,
          cityLatitude: cityLatitude || undefined,
          cityLongitude: cityLongitude || undefined,
        },
      });

      if (error) {
        console.error('AI prefill error:', error);
        
        // Check for specific error codes
        if (error.message?.includes('429')) {
          toast.error('Limite richieste raggiunto, riprova tra poco');
        } else if (error.message?.includes('402')) {
          toast.error('Crediti AI esauriti');
        } else {
          toast.error('Errore nella ricerca AI');
        }
        return null;
      }

      if (data?.error) {
        toast.error(data.error);
        return null;
      }

      const prefillData = data as AIPrefillData;

      // Map AI response to form data format
      const updates: Partial<PlaceFormData> = {};

      if (prefillData.address) {
        updates.address = prefillData.address;
      }
      if (prefillData.zone) {
        updates.zone = prefillData.zone;
      }
      if (prefillData.cuisine_type) {
        updates.cuisine_type = prefillData.cuisine_type;
      }
      if (prefillData.price_range) {
        updates.price_range = prefillData.price_range;
      }
      if (prefillData.indoor_outdoor) {
        updates.indoor_outdoor = prefillData.indoor_outdoor;
      }
      if (prefillData.best_times?.length > 0) {
        updates.best_times = prefillData.best_times;
      }
      if (prefillData.social_level) {
        updates.social_level = prefillData.social_level;
      }
      if (prefillData.vibe_touristy_to_local) {
        updates.vibe_touristy_to_local = prefillData.vibe_touristy_to_local;
      }
      if (prefillData.local_warning) {
        updates.local_warning = prefillData.local_warning;
      }
      if (prefillData.suggested_one_liner) {
        updates.local_one_liner = prefillData.suggested_one_liner;
      }
      if (prefillData.latitude !== null && prefillData.latitude !== undefined) {
        updates.latitude = prefillData.latitude;
      }
      if (prefillData.longitude !== null && prefillData.longitude !== undefined) {
        updates.longitude = prefillData.longitude;
      }

      const fieldCount = Object.keys(updates).length;
      if (fieldCount > 0) {
        toast.success(`🤖 ${fieldCount} campi pre-compilati dall'AI`);
      } else {
        toast.info('Nessun dato trovato per questo posto');
      }

      return updates;
    } catch (err) {
      console.error('AI prefill exception:', err);
      toast.error('Errore nella connessione AI');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { prefillPlace, isLoading };
}
