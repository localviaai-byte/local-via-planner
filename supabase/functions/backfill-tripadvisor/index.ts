import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApifyResult {
  locationId?: string;
  name?: string;
  url?: string;
  webUrl?: string;
  rankingPosition?: number;
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

async function searchTripAdvisor(
  placeName: string,
  cityName: string,
  apifyApiKey: string
): Promise<Record<string, unknown> | null> {
  const searchQuery = `${placeName} ${cityName}`;
  const actorUrl = 'https://api.apify.com/v2/acts/maxcopell~tripadvisor/run-sync-get-dataset-items';

  try {
    const response = await fetch(`${actorUrl}?token=${apifyApiKey}&timeout=30`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: searchQuery,
        maxItemsPerQuery: 3,
        language: 'it',
        currency: 'EUR',
      }),
    });

    if (!response.ok) return null;

    const results: ApifyResult[] = await response.json();
    if (!results || results.length === 0) return null;

    // Find best match
    const normalized = placeName.toLowerCase().trim();
    let best = results[0];
    for (const r of results) {
      if (r.name) {
        const rn = r.name.toLowerCase().trim();
        if (rn === normalized || rn.includes(normalized) || normalized.includes(rn)) {
          best = r;
          break;
        }
      }
    }

    let imageUrl = best.image;
    if (!imageUrl && best.thumbnail?.photo?.photoSizeDynamic?.urlTemplate) {
      imageUrl = best.thumbnail.photo.photoSizeDynamic.urlTemplate
        .replace('{width}', '800')
        .replace('{height}', '600');
    }

    return {
      tripadvisor_id: best.locationId || null,
      tripadvisor_ranking: best.rankingPosition || null,
      tripadvisor_ranking_category: best.rankingCategory || best.category?.name || null,
      tripadvisor_rating: best.rating || null,
      tripadvisor_reviews_count: best.numberOfReviews || best.reviewsCount || null,
      tripadvisor_price_level: best.priceLevel || best.priceRange || null,
      tripadvisor_url: best.webUrl || best.url || null,
      tripadvisor_image_url: imageUrl || null,
    };
  } catch (e) {
    console.error(`Error searching "${placeName}":`, e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apifyApiKey = Deno.env.get('APIFY_API_KEY');
    if (!apifyApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'APIFY_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { cityId } = await req.json();

    // Build query for places missing tripadvisor_url
    let query = supabase
      .from('places')
      .select('id, name, place_type, city_id, cities!places_city_id_fkey(name)')
      .is('tripadvisor_url', null)
      .neq('place_type', 'zone')
      .order('name');

    if (cityId) {
      query = query.eq('city_id', cityId);
    }

    const { data: places, error } = await query.limit(100);
    if (error) {
      console.error('Error fetching places:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!places || places.length === 0) {
      return new Response(
        JSON.stringify({ success: true, enriched: 0, total: 0, message: 'All places already enriched' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Backfilling ${places.length} places...`);

    // Process with background task for long-running work
    const startResponse = {
      success: true,
      total: places.length,
      message: `Processing ${places.length} places in background...`,
    };

    // Use waitUntil for background processing
    const backgroundWork = (async () => {
      let enriched = 0;
      let failed = 0;

      for (let i = 0; i < places.length; i++) {
        const place = places[i] as any;
        const cityName = place.cities?.name || 'Italia';

        console.log(`[${i + 1}/${places.length}] Enriching: ${place.name} (${cityName})`);

        const data = await searchTripAdvisor(place.name, cityName, apifyApiKey);

        if (data && data.tripadvisor_url) {
          const { error: updateError } = await supabase
            .from('places')
            .update({
              ...data,
              tripadvisor_enriched_at: new Date().toISOString(),
              // Also set photo if missing
              ...(data.tripadvisor_image_url ? { photo_url: data.tripadvisor_image_url } : {}),
            })
            .eq('id', place.id);

          if (updateError) {
            console.error(`Failed to update ${place.name}:`, updateError);
            failed++;
          } else {
            enriched++;
            console.log(`✓ ${place.name}: ${data.tripadvisor_url}`);
          }
        } else {
          console.log(`✗ ${place.name}: no result found`);
          failed++;
        }

        // Rate limit: wait 2s between calls
        if (i < places.length - 1) {
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      console.log(`Backfill complete: ${enriched} enriched, ${failed} failed out of ${places.length}`);
    })();

    // @ts-ignore - Deno EdgeRuntime
    if (typeof EdgeRuntime !== 'undefined') {
      EdgeRuntime.waitUntil(backgroundWork);
    } else {
      await backgroundWork;
    }

    return new Response(
      JSON.stringify(startResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Backfill error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
