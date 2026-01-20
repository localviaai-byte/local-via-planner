import { supabase } from '@/integrations/supabase/client';

export interface SuggestedPlace {
  name: string;
  place_type: 'attraction' | 'restaurant' | 'bar' | 'club' | 'experience' | 'view' | 'zone';
  address?: string;
  zone?: string;
  description?: string;
  why_people_go?: string[];
  best_times?: string[];
  confidence: number;
}

export interface DiscoveryResponse {
  success: boolean;
  suggestions?: SuggestedPlace[];
  sourcesCount?: number;
  error?: string;
  message?: string;
}

export async function discoverPlaces(
  cityName: string, 
  cityId: string,
  region?: string,
  country?: string
): Promise<DiscoveryResponse> {
  const { data, error } = await supabase.functions.invoke('discover-places', {
    body: { cityName, cityId, region, country },
  });

  if (error) {
    console.error('Discovery error:', error);
    return { success: false, error: error.message };
  }

  return data as DiscoveryResponse;
}
