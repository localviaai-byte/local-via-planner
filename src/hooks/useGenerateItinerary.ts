import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { TripPreferences } from '@/lib/mockData';

export interface ItineraryPlace {
  id: string;
  name: string;
  type: string;
  zone: string | null;
  address: string | null;
  local_one_liner: string | null;
  duration_minutes: number | null;
  price_range: string | null;
  cuisine_type: string | null;
  photo_url: string | null;
  indoor_outdoor: string | null;
  crowd_level: string | null;
  vibe_touristy_to_local: number | null;
}

export interface ProductSuggestion {
  id: string;
  title: string;
  short_pitch: string;
  price_cents: number;
  duration_minutes: number | null;
  product_type?: string;
  meeting_point?: string | null;
  description?: string | null;
}

export interface GeneratedSlot {
  id: string;
  type: 'activity' | 'meal' | 'break' | 'transfer';
  startTime: string;
  endTime: string;
  place?: ItineraryPlace;
  reason: string;
  alternatives?: { id: string; name: string; type: string }[];
  notes?: string;
  walkingMinutes?: number;
  productSuggestions?: ProductSuggestion[];
}

export interface GeneratedDay {
  dayNumber: number;
  date: string;
  slots: GeneratedSlot[];
  summary: string;
}

export interface GeneratedItinerary {
  itinerary: GeneratedDay[];
  city: {
    id: string;
    name: string;
    region: string | null;
  };
  meta: {
    placesUsed: number;
    productsAvailable: number;
  };
}

export function useGenerateItinerary() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (preferences: TripPreferences): Promise<GeneratedItinerary | null> => {
    if (!preferences.city) {
      toast.error('Seleziona prima una città');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-itinerary', {
        body: { preferences },
      });

      if (fnError) {
        console.error('Generate itinerary error:', fnError);
        
        if (fnError.message?.includes('429')) {
          toast.error('Limite richieste raggiunto, riprova tra poco');
          setError('rate_limit');
        } else if (fnError.message?.includes('402')) {
          toast.error('Crediti AI esauriti');
          setError('credits');
        } else {
          toast.error('Errore nella generazione dell\'itinerario');
          setError('unknown');
        }
        return null;
      }

      if (data?.error) {
        toast.error(data.error);
        if (data.message) {
          console.warn(data.message);
        }
        setError(data.error);
        return null;
      }

      const result = data as GeneratedItinerary;
      
      const totalSlots = result.itinerary.reduce((acc, day) => acc + day.slots.length, 0);
      toast.success(`🎯 Itinerario creato: ${result.itinerary.length} giorni, ${totalSlots} slot`);

      return result;
    } catch (err) {
      console.error('Generate itinerary exception:', err);
      toast.error('Errore nella connessione');
      setError('connection');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { generate, isLoading, error };
}
