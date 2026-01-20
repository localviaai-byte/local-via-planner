import { supabase } from '@/integrations/supabase/client';

export interface SuggestedPlace {
  id?: string;
  name: string;
  place_type: 'attraction' | 'restaurant' | 'bar' | 'club' | 'experience' | 'view' | 'zone';
  address?: string;
  zone?: string;
  description?: string;
  why_people_go?: string[];
  best_times?: string[];
  confidence: number;
  status?: 'pending' | 'accepted' | 'rejected';
}

export interface DiscoveryResponse {
  success: boolean;
  suggestions?: SuggestedPlace[];
  sourcesCount?: number;
  error?: string;
  message?: string;
}

// Fetch existing pending suggestions from DB
export async function getPendingSuggestions(cityId: string): Promise<SuggestedPlace[]> {
  const { data, error } = await supabase
    .from('place_suggestions')
    .select('*')
    .eq('city_id', cityId)
    .eq('status', 'pending')
    .order('confidence', { ascending: false });

  if (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    place_type: row.place_type as SuggestedPlace['place_type'],
    address: row.address || undefined,
    zone: row.zone || undefined,
    description: row.description || undefined,
    why_people_go: row.why_people_go || [],
    best_times: row.best_times || [],
    confidence: Number(row.confidence),
    status: row.status as 'pending' | 'accepted' | 'rejected',
  }));
}

// Save suggestions to DB
export async function saveSuggestions(cityId: string, suggestions: SuggestedPlace[]): Promise<void> {
  const rows = suggestions.map(s => ({
    city_id: cityId,
    name: s.name,
    place_type: s.place_type,
    address: s.address || null,
    zone: s.zone || null,
    description: s.description || null,
    why_people_go: s.why_people_go || [],
    best_times: s.best_times || [],
    confidence: s.confidence,
    status: 'pending',
  }));

  const { error } = await supabase.from('place_suggestions').insert(rows);
  
  if (error) {
    console.error('Error saving suggestions:', error);
    throw error;
  }
}

// Update suggestion status
export async function updateSuggestionStatus(
  suggestionId: string, 
  status: 'accepted' | 'rejected',
  acceptedPlaceId?: string
): Promise<void> {
  const update: Record<string, unknown> = { status };
  if (acceptedPlaceId) {
    update.accepted_place_id = acceptedPlaceId;
  }

  const { error } = await supabase
    .from('place_suggestions')
    .update(update)
    .eq('id', suggestionId);

  if (error) {
    console.error('Error updating suggestion:', error);
    throw error;
  }
}

// Get stats for a city (how many accepted/rejected)
export async function getSuggestionStats(cityId: string): Promise<{ accepted: number; rejected: number }> {
  const { data, error } = await supabase
    .from('place_suggestions')
    .select('status')
    .eq('city_id', cityId);

  if (error) {
    console.error('Error fetching stats:', error);
    return { accepted: 0, rejected: 0 };
  }

  return {
    accepted: data.filter(d => d.status === 'accepted').length,
    rejected: data.filter(d => d.status === 'rejected').length,
  };
}

// Run discovery and save results to DB
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

  const response = data as DiscoveryResponse;

  // Save suggestions to DB if any found
  if (response.success && response.suggestions && response.suggestions.length > 0) {
    try {
      await saveSuggestions(cityId, response.suggestions);
    } catch (saveError) {
      console.error('Error persisting suggestions:', saveError);
      // Continue anyway - we have the data in memory
    }
  }

  return response;
}
