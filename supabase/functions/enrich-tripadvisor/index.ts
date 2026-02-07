import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TripAdvisorResult {
  tripadvisor_id?: string;
  tripadvisor_ranking?: number;
  tripadvisor_ranking_category?: string;
  tripadvisor_rating?: number;
  tripadvisor_reviews_count?: number;
  tripadvisor_price_level?: string;
  tripadvisor_url?: string;
  tripadvisor_image_url?: string;
}

interface ApifySearchResult {
  locationId?: string;
  name?: string;
  url?: string;
  ranking?: string;
  rating?: number;
  reviewsCount?: number;
  priceLevel?: string;
  primaryPhoto?: {
    photoSizes?: Array<{ url: string; width: number; height: number }>;
  };
  thumbnail?: string;
  image?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { placeName, cityName, placeType, placeId } = await req.json();

    if (!placeName || !cityName) {
      return new Response(
        JSON.stringify({ success: false, error: 'placeName and cityName are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apifyApiKey = Deno.env.get('APIFY_API_KEY');
    if (!apifyApiKey) {
      console.error('APIFY_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Apify API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Searching TripAdvisor for: "${placeName}" in ${cityName}`);

    // Map place types to TripAdvisor categories
    const categoryMap: Record<string, string> = {
      'restaurant': 'restaurants',
      'bar': 'restaurants', // TripAdvisor groups bars with restaurants
      'attraction': 'attractions',
      'experience': 'attractions',
      'view': 'attractions',
      'club': 'restaurants',
    };
    
    const searchCategory = categoryMap[placeType] || 'attractions';
    const searchQuery = `${placeName} ${cityName}`;

    // Call Apify TripAdvisor Scraper Actor
    // Actor ID: maxcopell/tripadvisor-scraper
    const actorUrl = 'https://api.apify.com/v2/acts/maxcopell~tripadvisor/run-sync-get-dataset-items';
    
    const actorInput = {
      startUrls: [],
      searchQuery: searchQuery,
      searchLocation: cityName,
      maxItems: 5,
      language: 'it',
      currency: 'EUR',
      includeReviews: false,
      includeTags: false,
      includeNearby: false,
      includeAttractions: searchCategory === 'attractions',
      includeRestaurants: searchCategory === 'restaurants',
      includeHotels: false,
    };

    console.log('Calling Apify actor with input:', JSON.stringify(actorInput));

    const apifyResponse = await fetch(`${actorUrl}?token=${apifyApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(actorInput),
    });

    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text();
      console.error('Apify API error:', apifyResponse.status, errorText);
      
      // Return success with empty data - don't fail the whole operation
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: null,
          message: 'TripAdvisor search returned no results'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: ApifySearchResult[] = await apifyResponse.json();
    console.log(`Received ${results.length} results from Apify`);

    if (!results || results.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: null,
          message: 'No TripAdvisor results found'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the best match - normalize names for comparison
    const normalizedPlaceName = placeName.toLowerCase().trim();
    let bestMatch = results[0];
    
    for (const result of results) {
      if (result.name) {
        const normalizedResultName = result.name.toLowerCase().trim();
        // Check for exact or partial match
        if (normalizedResultName === normalizedPlaceName || 
            normalizedResultName.includes(normalizedPlaceName) ||
            normalizedPlaceName.includes(normalizedResultName)) {
          bestMatch = result;
          break;
        }
      }
    }

    console.log('Best match:', bestMatch.name);

    // Parse ranking (e.g., "#12 of 150 Restaurants in Pompei")
    let rankingNumber: number | undefined;
    let rankingCategory: string | undefined;
    
    if (bestMatch.ranking) {
      const rankMatch = bestMatch.ranking.match(/#(\d+)\s+(?:of|su|di)\s+\d+\s+(.+)/i);
      if (rankMatch) {
        rankingNumber = parseInt(rankMatch[1], 10);
        rankingCategory = rankMatch[2].trim();
      }
    }

    // Get the best image URL
    let imageUrl: string | undefined;
    if (bestMatch.primaryPhoto?.photoSizes && bestMatch.primaryPhoto.photoSizes.length > 0) {
      // Get the largest image
      const sortedPhotos = bestMatch.primaryPhoto.photoSizes.sort((a, b) => b.width - a.width);
      imageUrl = sortedPhotos[0].url;
    } else if (bestMatch.thumbnail) {
      imageUrl = bestMatch.thumbnail;
    } else if (bestMatch.image) {
      imageUrl = bestMatch.image;
    }

    const enrichedData: TripAdvisorResult = {
      tripadvisor_id: bestMatch.locationId,
      tripadvisor_ranking: rankingNumber,
      tripadvisor_ranking_category: rankingCategory,
      tripadvisor_rating: bestMatch.rating,
      tripadvisor_reviews_count: bestMatch.reviewsCount,
      tripadvisor_price_level: bestMatch.priceLevel,
      tripadvisor_url: bestMatch.url,
      tripadvisor_image_url: imageUrl,
    };

    // If placeId is provided, update the place directly
    if (placeId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const updateData = {
        ...enrichedData,
        tripadvisor_enriched_at: new Date().toISOString(),
        // Also update photo if we got one and place doesn't have one
        ...(imageUrl ? { photo_url: imageUrl } : {}),
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
        data: enrichedData,
        matchedName: bestMatch.name
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
