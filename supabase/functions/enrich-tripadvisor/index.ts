import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export interface TripAdvisorResult {
  tripadvisor_id?: string;
  tripadvisor_ranking?: number;
  tripadvisor_ranking_category?: string;
  tripadvisor_rating?: number;
  tripadvisor_reviews_count?: number;
  tripadvisor_price_level?: string;
  tripadvisor_url?: string;
  tripadvisor_image_url?: string;
}

interface ApifyResult {
  locationId?: string;
  name?: string;
  url?: string;
  webUrl?: string;
  rankingPosition?: number;
  rankingDenominator?: number;
  rankingCategory?: string;
  rating?: number;
  numberOfReviews?: number;
  reviewsCount?: number;
  priceLevel?: string;
  priceRange?: string;
  image?: string;
  thumbnail?: { photo?: { photoSizeDynamic?: { urlTemplate?: string } } };
  category?: { name?: string };
}

// Search TripAdvisor for a single place
export async function searchTripAdvisor(
  placeName: string,
  cityName: string,
  placeType: string,
  apifyApiKey: string
): Promise<TripAdvisorResult | null> {
  const searchQuery = `${placeName} ${cityName}`;
  
  console.log(`Searching TripAdvisor for: "${searchQuery}"`);

  // Use the correct actor: maxcopell/tripadvisor
  const actorUrl = 'https://api.apify.com/v2/acts/maxcopell~tripadvisor/run-sync-get-dataset-items';
  
  const actorInput = {
    query: searchQuery,
    maxItemsPerQuery: 3,
    language: 'it',
    currency: 'EUR',
  };

  try {
    const response = await fetch(`${actorUrl}?token=${apifyApiKey}&timeout=30`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actorInput),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Apify API error:', response.status, errorText);
      return null;
    }

    const results: ApifyResult[] = await response.json();
    
    if (!results || results.length === 0) {
      console.log('No TripAdvisor results found');
      return null;
    }

    // Find best match by name similarity
    const normalizedPlaceName = placeName.toLowerCase().trim();
    let bestMatch = results[0];
    
    for (const result of results) {
      if (result.name) {
        const normalizedResultName = result.name.toLowerCase().trim();
        if (normalizedResultName === normalizedPlaceName || 
            normalizedResultName.includes(normalizedPlaceName) ||
            normalizedPlaceName.includes(normalizedResultName)) {
          bestMatch = result;
          break;
        }
      }
    }

    console.log(`Best match: ${bestMatch.name} (rating: ${bestMatch.rating})`);

    // Get image URL
    let imageUrl: string | undefined = bestMatch.image;
    if (!imageUrl && bestMatch.thumbnail?.photo?.photoSizeDynamic?.urlTemplate) {
      imageUrl = bestMatch.thumbnail.photo.photoSizeDynamic.urlTemplate.replace('{width}', '800').replace('{height}', '600');
    }

    return {
      tripadvisor_id: bestMatch.locationId,
      tripadvisor_ranking: bestMatch.rankingPosition,
      tripadvisor_ranking_category: bestMatch.rankingCategory || bestMatch.category?.name,
      tripadvisor_rating: bestMatch.rating,
      tripadvisor_reviews_count: bestMatch.numberOfReviews || bestMatch.reviewsCount,
      tripadvisor_price_level: bestMatch.priceLevel || bestMatch.priceRange,
      tripadvisor_url: bestMatch.webUrl || bestMatch.url,
      tripadvisor_image_url: imageUrl,
    };
  } catch (error) {
    console.error('TripAdvisor search error:', error);
    return null;
  }
}

// Batch enrich multiple places
export async function batchEnrichTripAdvisor(
  places: Array<{ name: string; place_type: string }>,
  cityName: string,
  apifyApiKey: string
): Promise<Map<string, TripAdvisorResult>> {
  const results = new Map<string, TripAdvisorResult>();
  
  // Process in batches of 3 to avoid rate limits
  const batchSize = 3;
  for (let i = 0; i < places.length; i += batchSize) {
    const batch = places.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (place) => {
      // Skip zones - they don't have TripAdvisor pages
      if (place.place_type === 'zone') return null;
      
      const result = await searchTripAdvisor(place.name, cityName, place.place_type, apifyApiKey);
      if (result) {
        results.set(place.name, result);
      }
      return result;
    });
    
    await Promise.all(batchPromises);
    
    // Small delay between batches
    if (i + batchSize < places.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { placeName, cityName, placeType, placeId, batchPlaces } = await req.json();

    const apifyApiKey = Deno.env.get('APIFY_API_KEY');
    if (!apifyApiKey) {
      console.error('APIFY_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Apify API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Batch mode - enrich multiple places at once
    if (batchPlaces && Array.isArray(batchPlaces)) {
      console.log(`Batch enriching ${batchPlaces.length} places for ${cityName}`);
      
      const resultsMap = await batchEnrichTripAdvisor(batchPlaces, cityName, apifyApiKey);
      
      // Convert Map to object for JSON response
      const resultsObject: Record<string, TripAdvisorResult> = {};
      resultsMap.forEach((value, key) => {
        resultsObject[key] = value;
      });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          results: resultsObject,
          enrichedCount: resultsMap.size 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Single place mode
    if (!placeName || !cityName) {
      return new Response(
        JSON.stringify({ success: false, error: 'placeName and cityName are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const enrichedData = await searchTripAdvisor(placeName, cityName, placeType || 'attraction', apifyApiKey);

    if (!enrichedData) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: null,
          message: 'No TripAdvisor results found'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If placeId is provided, update the place directly
    if (placeId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const updateData = {
        ...enrichedData,
        tripadvisor_enriched_at: new Date().toISOString(),
        ...(enrichedData.tripadvisor_image_url ? { photo_url: enrichedData.tripadvisor_image_url } : {}),
      };

      const { error: updateError } = await supabase
        .from('places')
        .update(updateData)
        .eq('id', placeId);

      if (updateError) {
        console.error('Error updating place:', updateError);
      } else {
        console.log(`Updated place ${placeId} with TripAdvisor data`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: enrichedData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('TripAdvisor enrichment error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Enrichment failed' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
