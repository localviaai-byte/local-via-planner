import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_PHOTOS = 5;

// Extract image URLs from Firecrawl scrape result
function extractImageUrls(html: string, baseUrl: string): string[] {
  const urls: string[] = [];
  // Match img src attributes
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const url = match[1];
    if (isValidPhotoUrl(url)) {
      urls.push(url);
    }
  }
  // Also look for og:image and meta images
  const metaRegex = /content=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi;
  while ((match = metaRegex.exec(html)) !== null) {
    if (isValidPhotoUrl(match[1])) {
      urls.push(match[1]);
    }
  }
  return [...new Set(urls)]; // deduplicate
}

function isValidPhotoUrl(url: string): boolean {
  if (!url || url.length < 10) return false;
  // Must be absolute URL
  if (!url.startsWith('http')) return false;
  // Skip tiny icons, tracking pixels, etc.
  if (url.includes('1x1') || url.includes('pixel') || url.includes('tracking')) return false;
  if (url.includes('.svg') || url.includes('.gif') || url.includes('data:image')) return false;
  // Skip very small TripAdvisor thumbnails
  if (url.includes('photo-s') || url.includes('photo-f')) return false;
  // Prefer larger images
  const hasImageExt = /\.(jpg|jpeg|png|webp)/i.test(url);
  const isTAPhoto = url.includes('tripadvisor') || url.includes('media-cdn');
  return hasImageExt || isTAPhoto;
}

// Try to get photos from TripAdvisor page via Firecrawl
async function getPhotosFromTripAdvisor(
  tripadvisorUrl: string,
  firecrawlKey: string
): Promise<string[]> {
  try {
    // Scrape the TripAdvisor page for images
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: tripadvisorUrl,
        formats: ['html', 'links'],
        onlyMainContent: false,
        waitFor: 2000,
      }),
    });

    if (!response.ok) {
      console.error('Firecrawl scrape failed:', response.status);
      return [];
    }

    const data = await response.json();
    const html = data.data?.html || data.html || '';
    const links = data.data?.links || data.links || [];

    // Extract photo URLs from HTML
    let photos = extractImageUrls(html, tripadvisorUrl);

    // Also check links for photo page URLs
    const photoPageLinks = links.filter((l: string) => 
      l.includes('/photo') || l.includes('media-cdn') || l.includes('dynamic-media')
    );

    // Filter to get good quality TA photos
    photos = photos.filter(url => {
      // Prefer TripAdvisor CDN photos (large versions)
      const isLargeTA = url.includes('photo-o') || url.includes('photo-w') || url.includes('photo-l');
      const isMediaCdn = url.includes('media-cdn.tripadvisor') || url.includes('dynamic-media-cdn');
      const isGoodSize = !url.includes('_t.') && !url.includes('_s.') && !url.includes('_f.');
      return (isLargeTA || isMediaCdn || !url.includes('tripadvisor')) && isGoodSize;
    });

    return photos.slice(0, MAX_PHOTOS);
  } catch (e) {
    console.error('Error scraping TA page:', e);
    return [];
  }
}

// Fallback: search for photos via Firecrawl web search
async function searchPhotos(
  placeName: string,
  cityName: string,
  placeType: string,
  firecrawlKey: string
): Promise<string[]> {
  try {
    const query = `${placeName} ${cityName} ${placeType === 'restaurant' ? 'ristorante' : ''} foto`;

    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 5,
        scrapeOptions: { formats: ['html'] },
      }),
    });

    if (!response.ok) {
      console.error('Firecrawl search failed:', response.status);
      return [];
    }

    const data = await response.json();
    const results = data.data || [];
    const allPhotos: string[] = [];

    for (const result of results) {
      const html = result.html || '';
      const photos = extractImageUrls(html, result.url || '');
      allPhotos.push(...photos);
      if (allPhotos.length >= MAX_PHOTOS) break;
    }

    return [...new Set(allPhotos)].slice(0, MAX_PHOTOS);
  } catch (e) {
    console.error('Error searching photos:', e);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'FIRECRAWL_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { cityId, placeId } = await req.json();

    // Build query for places to enrich
    let query = supabase
      .from('places')
      .select('id, name, place_type, city_id, tripadvisor_url, photo_url, cities!places_city_id_fkey(name)')
      .neq('place_type', 'zone')
      .order('name');

    if (placeId) {
      query = query.eq('id', placeId);
    } else if (cityId) {
      query = query.eq('city_id', cityId);
    }

    const { data: places, error } = await query.limit(50);
    if (error) {
      console.error('Error fetching places:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!places || places.length === 0) {
      return new Response(
        JSON.stringify({ success: true, enriched: 0, message: 'No places to enrich' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter out places that already have 5+ media
    const { data: existingMedia } = await supabase
      .from('place_media')
      .select('place_id')
      .in('place_id', places.map(p => p.id));

    const mediaCount = new Map<string, number>();
    for (const m of (existingMedia || [])) {
      mediaCount.set(m.place_id, (mediaCount.get(m.place_id) || 0) + 1);
    }

    const placesToEnrich = places.filter(p => (mediaCount.get(p.id) || 0) < MAX_PHOTOS);

    console.log(`Enriching photos for ${placesToEnrich.length} places...`);

    const startResponse = {
      success: true,
      total: placesToEnrich.length,
      message: `Processing ${placesToEnrich.length} places in background...`,
    };

    const backgroundWork = (async () => {
      let enriched = 0;

      for (let i = 0; i < placesToEnrich.length; i++) {
        const place = placesToEnrich[i] as any;
        const cityName = place.cities?.name || 'Italia';
        const currentMediaCount = mediaCount.get(place.id) || 0;
        const needed = MAX_PHOTOS - currentMediaCount;

        console.log(`[${i + 1}/${placesToEnrich.length}] Photos for: ${place.name} (need ${needed})`);

        let photos: string[] = [];

        // Strategy 1: Scrape TripAdvisor page if we have URL
        if (place.tripadvisor_url) {
          photos = await getPhotosFromTripAdvisor(place.tripadvisor_url, firecrawlKey);
          console.log(`  TA scrape: found ${photos.length} photos`);
        }

        // Strategy 2: Firecrawl web search fallback
        if (photos.length < needed) {
          const searchPhotos2 = await searchPhotos(place.name, cityName, place.place_type, firecrawlKey);
          // Add non-duplicate photos
          const existingSet = new Set(photos);
          for (const p of searchPhotos2) {
            if (!existingSet.has(p) && photos.length < needed) {
              photos.push(p);
            }
          }
          console.log(`  Search fallback: total ${photos.length} photos`);
        }

        // Take only what we need
        photos = photos.slice(0, needed);

        if (photos.length > 0) {
          // Save to place_media
          const mediaRows = photos.map((url, idx) => ({
            place_id: place.id,
            media_url: url,
            sort_order: currentMediaCount + idx,
          }));

          const { error: insertError } = await supabase
            .from('place_media')
            .insert(mediaRows);

          if (insertError) {
            console.error(`  Error saving media for ${place.name}:`, insertError);
          } else {
            enriched++;
            console.log(`  ✓ Saved ${photos.length} photos for ${place.name}`);

            // Also update photo_url if place doesn't have one
            if (!place.photo_url && photos.length > 0) {
              await supabase
                .from('places')
                .update({ photo_url: photos[0] })
                .eq('id', place.id);
            }
          }
        } else {
          console.log(`  ✗ No photos found for ${place.name}`);
        }

        // Rate limit: 3s between places
        if (i < placesToEnrich.length - 1) {
          await new Promise(r => setTimeout(r, 3000));
        }
      }

      console.log(`Photo enrichment complete: ${enriched}/${placesToEnrich.length} enriched`);
    })();

    // @ts-ignore
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
    console.error('Photo enrichment error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
