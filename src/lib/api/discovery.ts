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
  // TripAdvisor enrichment
  tripadvisor_id?: string;
  tripadvisor_ranking?: number;
  tripadvisor_ranking_category?: string;
  tripadvisor_rating?: number;
  tripadvisor_reviews_count?: number;
  tripadvisor_price_level?: string;
  tripadvisor_url?: string;
  tripadvisor_image_url?: string;
}

export interface TripAdvisorData {
  tripadvisor_id?: string;
  tripadvisor_ranking?: number;
  tripadvisor_ranking_category?: string;
  tripadvisor_rating?: number;
  tripadvisor_reviews_count?: number;
  tripadvisor_price_level?: string;
  tripadvisor_url?: string;
  tripadvisor_image_url?: string;
}

export interface DiscoveryOptions {
  placeType?: string;
  focusZone?: string;
  searchRadius?: string; // 'neighborhood' | 'zone' | 'city' | 'area'
  intensity?: string; // 'light' | 'normal' | 'deep' | 'exhaustive'
  maxQueries?: number;
}

export interface DiscoveryResponse {
  success: boolean;
  suggestions?: SuggestedPlace[];
  sourcesCount?: number;
  newCount?: number;
  skippedCount?: number;
  error?: string;
  message?: string;
  jobId?: string;
}

export interface DiscoveryJob {
  id: string;
  city_id: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  options: DiscoveryOptions | null;
  result: {
    suggestions?: SuggestedPlace[];
    sourcesCount?: number;
    message?: string;
  } | null;
  error: string | null;
  created_at: string;
  updated_at: string;
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

// Save suggestions to DB (with deduplication)
export async function saveSuggestions(cityId: string, suggestions: SuggestedPlace[]): Promise<{ saved: number; skipped: number }> {
  // Get all existing suggestions for this city (any status)
  const { data: existing } = await supabase
    .from('place_suggestions')
    .select('name')
    .eq('city_id', cityId);

  const existingNames = new Set((existing || []).map(e => e.name.toLowerCase().trim()));

  // Also check existing places in the places table
  const { data: existingPlaces } = await supabase
    .from('places')
    .select('name')
    .eq('city_id', cityId);

  const existingPlaceNames = new Set((existingPlaces || []).map(p => p.name.toLowerCase().trim()));

  // Filter out duplicates
  const newSuggestions = suggestions.filter(s => {
    const normalizedName = s.name.toLowerCase().trim();
    return !existingNames.has(normalizedName) && !existingPlaceNames.has(normalizedName);
  });

  if (newSuggestions.length === 0) {
    return { saved: 0, skipped: suggestions.length };
  }

  const rows = newSuggestions.map(s => ({
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

  return { saved: newSuggestions.length, skipped: suggestions.length - newSuggestions.length };
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

// Enrich a place with TripAdvisor data
export async function enrichWithTripAdvisor(
  placeName: string,
  cityName: string,
  placeType: string,
  placeId?: string
): Promise<{ success: boolean; data?: TripAdvisorData; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('enrich-tripadvisor', {
      body: { placeName, cityName, placeType, placeId },
    });

    if (error) {
      console.error('TripAdvisor enrichment error:', error);
      return { success: false, error: error.message };
    }

    return data;
  } catch (e) {
    console.error('TripAdvisor enrichment failed:', e);
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
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

// Get discovery job status
export async function getDiscoveryJob(jobId: string): Promise<DiscoveryJob | null> {
  const { data, error } = await supabase
    .from('discovery_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) {
    console.error('Error fetching job:', error);
    return null;
  }

  return data as DiscoveryJob;
}

// Poll for job completion
export async function pollDiscoveryJob(
  jobId: string, 
  onProgress?: (progress: number) => void,
  maxWaitMs: number = 180000 // 3 minutes max
): Promise<DiscoveryJob> {
  const startTime = Date.now();
  const pollInterval = 2000; // 2 seconds

  while (Date.now() - startTime < maxWaitMs) {
    const job = await getDiscoveryJob(jobId);
    
    if (!job) {
      throw new Error('Job not found');
    }

    if (onProgress) {
      onProgress(job.progress);
    }

    if (job.status === 'completed' || job.status === 'failed') {
      return job;
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Job timed out');
}

// Run discovery and save results to DB
export async function discoverPlaces(
  cityName: string, 
  cityId: string,
  region?: string,
  country?: string,
  options?: DiscoveryOptions,
  onProgress?: (progress: number) => void
): Promise<DiscoveryResponse> {
  // Start the discovery job
  const { data, error } = await supabase.functions.invoke('discover-places', {
    body: { 
      cityName, 
      cityId, 
      region, 
      country,
      options: {
        placeType: options?.placeType,
        focusZone: options?.focusZone,
        searchRadius: options?.searchRadius || 'city',
        intensity: options?.intensity || 'normal',
        maxQueries: options?.maxQueries || 15,
      }
    },
  });

  if (error) {
    console.error('Discovery error:', error);
    return { success: false, error: error.message };
  }

  const response = data as { success: boolean; jobId?: string; error?: string };

  if (!response.success || !response.jobId) {
    return { success: false, error: response.error || 'Failed to start discovery' };
  }

  // Poll for completion
  try {
    const job = await pollDiscoveryJob(response.jobId, onProgress);

    if (job.status === 'failed') {
      return { success: false, error: job.error || 'Discovery failed' };
    }

    const result = job.result || { suggestions: [] };
    const suggestions = result.suggestions || [];

    // Save suggestions to DB if any found (with deduplication)
    if (suggestions.length > 0) {
      try {
        const { saved, skipped } = await saveSuggestions(cityId, suggestions);
        return {
          success: true,
          suggestions,
          sourcesCount: result.sourcesCount,
          newCount: saved,
          skippedCount: skipped,
          message: saved === 0 && skipped > 0 
            ? `Tutti i ${skipped} luoghi trovati erano già presenti` 
            : undefined,
        };
      } catch (saveError) {
        console.error('Error persisting suggestions:', saveError);
        // Return suggestions anyway
        return {
          success: true,
          suggestions,
          sourcesCount: result.sourcesCount,
        };
      }
    }

    return {
      success: true,
      suggestions: [],
      message: result.message || 'Nessun risultato trovato',
    };

  } catch (pollError) {
    console.error('Polling error:', pollError);
    return { 
      success: false, 
      error: pollError instanceof Error ? pollError.message : 'Polling failed' 
    };
  }
}
