import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Place {
  id: string;
  name: string;
  address: string | null;
  zone: string | null;
  city_id: string;
}

interface City {
  id: string;
  name: string;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface GeocodeResult {
  placeId: string;
  placeName: string;
  success: boolean;
  latitude?: number;
  longitude?: number;
  error?: string;
}

// Italian regions with approximate bounding boxes
const REGION_BOUNDS: Record<string, { minLat: number; maxLat: number; minLng: number; maxLng: number; center: { lat: number; lng: number } }> = {
  'campania': { minLat: 39.9, maxLat: 41.5, minLng: 13.7, maxLng: 15.8, center: { lat: 40.85, lng: 14.25 } },
  'lazio': { minLat: 41.0, maxLat: 42.9, minLng: 11.4, maxLng: 14.0, center: { lat: 41.9, lng: 12.5 } },
  'toscana': { minLat: 42.2, maxLat: 44.5, minLng: 9.7, maxLng: 12.4, center: { lat: 43.35, lng: 11.05 } },
  'lombardia': { minLat: 44.7, maxLat: 46.6, minLng: 8.5, maxLng: 11.4, center: { lat: 45.65, lng: 9.95 } },
  'veneto': { minLat: 44.8, maxLat: 47.1, minLng: 10.6, maxLng: 13.1, center: { lat: 45.45, lng: 11.85 } },
  'emilia-romagna': { minLat: 43.7, maxLat: 45.1, minLng: 9.2, maxLng: 12.8, center: { lat: 44.5, lng: 11.0 } },
  'piemonte': { minLat: 44.0, maxLat: 46.5, minLng: 6.6, maxLng: 9.2, center: { lat: 45.05, lng: 7.9 } },
  'puglia': { minLat: 39.8, maxLat: 42.2, minLng: 15.0, maxLng: 18.5, center: { lat: 41.0, lng: 16.5 } },
  'sicilia': { minLat: 36.6, maxLat: 38.8, minLng: 12.4, maxLng: 15.7, center: { lat: 37.5, lng: 14.0 } },
  'sardegna': { minLat: 38.8, maxLat: 41.3, minLng: 8.1, maxLng: 9.8, center: { lat: 40.0, lng: 9.0 } },
  'calabria': { minLat: 37.9, maxLat: 40.2, minLng: 15.6, maxLng: 17.2, center: { lat: 38.9, lng: 16.3 } },
  'liguria': { minLat: 43.7, maxLat: 44.7, minLng: 7.5, maxLng: 10.1, center: { lat: 44.3, lng: 8.8 } },
  'marche': { minLat: 42.7, maxLat: 43.9, minLng: 12.1, maxLng: 13.9, center: { lat: 43.3, lng: 13.0 } },
  'abruzzo': { minLat: 41.7, maxLat: 42.9, minLng: 13.0, maxLng: 14.8, center: { lat: 42.35, lng: 13.9 } },
  'friuli-venezia giulia': { minLat: 45.6, maxLat: 46.7, minLng: 12.3, maxLng: 13.9, center: { lat: 46.1, lng: 13.2 } },
  'trentino-alto adige': { minLat: 45.7, maxLat: 47.1, minLng: 10.4, maxLng: 12.5, center: { lat: 46.4, lng: 11.4 } },
  'umbria': { minLat: 42.4, maxLat: 43.6, minLng: 12.1, maxLng: 13.3, center: { lat: 42.9, lng: 12.6 } },
  'basilicata': { minLat: 39.9, maxLat: 41.1, minLng: 15.3, maxLng: 16.9, center: { lat: 40.5, lng: 16.0 } },
  'molise': { minLat: 41.3, maxLat: 42.1, minLng: 13.9, maxLng: 15.2, center: { lat: 41.7, lng: 14.6 } },
  "valle d'aosta": { minLat: 45.5, maxLat: 46.0, minLng: 6.8, maxLng: 7.9, center: { lat: 45.74, lng: 7.32 } },
};

const ITALY_BOUNDS = { minLat: 35.5, maxLat: 47.1, minLng: 6.6, maxLng: 18.5, center: { lat: 41.9, lng: 12.5 } };

// Geocode a single place using region-aware logic
async function geocodePlace(
  place: Place,
  city: City,
  mapboxToken: string
): Promise<GeocodeResult> {
  try {
    const normalizedRegion = city.region?.toLowerCase().trim() || '';
    const regionBounds = REGION_BOUNDS[normalizedRegion] || ITALY_BOUNDS;
    
    // Use city coordinates if available, otherwise region center
    const proximityLng = city.longitude || regionBounds.center.lng;
    const proximityLat = city.latitude || regionBounds.center.lat;

    const searchQuery = place.address 
      ? `${place.address}, ${city.name}, Italia`
      : `${place.name}, ${city.name}, Italia`;

    console.log(`Geocoding: "${searchQuery}" (region: ${city.region || 'unknown'})`);

    const geocodeUrl = new URL(
      "https://api.mapbox.com/geocoding/v5/mapbox.places/" + 
      encodeURIComponent(searchQuery) + ".json"
    );
    geocodeUrl.searchParams.set("access_token", mapboxToken);
    geocodeUrl.searchParams.set("limit", "5");
    geocodeUrl.searchParams.set("types", "poi,address,place,locality");
    geocodeUrl.searchParams.set("country", "IT");
    geocodeUrl.searchParams.set("language", "it");
    geocodeUrl.searchParams.set("proximity", `${proximityLng},${proximityLat}`);

    const response = await fetch(geocodeUrl.toString());
    
    if (!response.ok) {
      return {
        placeId: place.id,
        placeName: place.name,
        success: false,
        error: `Mapbox error: ${response.status}`,
      };
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return {
        placeId: place.id,
        placeName: place.name,
        success: false,
        error: "No results found",
      };
    }

    // Filter features to only those within the region bounds
    const isInRegion = (feature: { center: number[] }): boolean => {
      const [lng, lat] = feature.center;
      return lat >= regionBounds.minLat && lat <= regionBounds.maxLat && 
             lng >= regionBounds.minLng && lng <= regionBounds.maxLng;
    };

    let validFeatures = data.features.filter(isInRegion);
    
    // Log for debugging
    data.features.forEach((f: { place_name: string; center: number[] }, i: number) => {
      const inRegion = isInRegion(f);
      console.log(`  Result ${i}: "${f.place_name}" [${f.center[1].toFixed(4)}, ${f.center[0].toFixed(4)}] in-region: ${inRegion}`);
    });

    if (validFeatures.length === 0) {
      // Try fallback with region name
      if (city.region) {
        const fallbackQuery = `${place.name} ${city.name} ${city.region}`;
        console.log(`No results in region, trying fallback: "${fallbackQuery}"`);
        
        const fallbackUrl = new URL(
          "https://api.mapbox.com/geocoding/v5/mapbox.places/" + 
          encodeURIComponent(fallbackQuery) + ".json"
        );
        fallbackUrl.searchParams.set("access_token", mapboxToken);
        fallbackUrl.searchParams.set("limit", "5");
        fallbackUrl.searchParams.set("country", "IT");
        fallbackUrl.searchParams.set("language", "it");
        fallbackUrl.searchParams.set("proximity", `${proximityLng},${proximityLat}`);
        
        const fallbackResponse = await fetch(fallbackUrl.toString());
        const fallbackData = await fallbackResponse.json();
        
        if (fallbackData.features) {
          validFeatures = fallbackData.features.filter(isInRegion);
        }
      }
      
      if (validFeatures.length === 0) {
        console.log(`No results in ${normalizedRegion || 'italy'} region for ${place.name}`);
        return {
          placeId: place.id,
          placeName: place.name,
          success: false,
          error: `No valid location in ${city.region || 'target'} region`,
        };
      }
    }

    // Prefer result containing city name
    const cityNameLower = city.name.toLowerCase();
    const bestFeature = validFeatures.find((f: { place_name: string }) =>
      f.place_name.toLowerCase().includes(cityNameLower)
    ) || validFeatures[0];

    const [longitude, latitude] = bestFeature.center;

    return {
      placeId: place.id,
      placeName: place.name,
      success: true,
      latitude,
      longitude,
    };
  } catch (error) {
    return {
      placeId: place.id,
      placeName: place.name,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Background task to process all places
async function processBatch(
  places: Place[],
  citiesMap: Map<string, City>,
  supabaseUrl: string,
  supabaseKey: string,
  mapboxToken: string
): Promise<{ results: GeocodeResult[]; successCount: number; failCount: number }> {
  console.log(`Starting batch geocoding for ${places.length} places`);
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  const results: GeocodeResult[] = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < places.length; i++) {
    const place = places[i];
    const city = citiesMap.get(place.city_id);
    
    if (!city) {
      results.push({
        placeId: place.id,
        placeName: place.name,
        success: false,
        error: "City not found",
      });
      failCount++;
      continue;
    }

    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const result = await geocodePlace(place, city, mapboxToken);
    results.push(result);

    if (result.success && result.latitude && result.longitude) {
      const { error: updateError } = await supabase
        .from("places")
        .update({
          latitude: result.latitude,
          longitude: result.longitude,
        })
        .eq("id", place.id);

      if (updateError) {
        console.error(`Failed to update place ${place.id}:`, updateError);
        result.success = false;
        result.error = "Database update failed";
        failCount++;
      } else {
        console.log(`✓ Updated ${place.name}: ${result.latitude}, ${result.longitude}`);
        successCount++;
      }
    } else {
      failCount++;
      console.log(`✗ Failed ${place.name}: ${result.error}`);
    }

    if ((i + 1) % 10 === 0) {
      console.log(`Progress: ${i + 1}/${places.length} (${successCount} success, ${failCount} failed)`);
    }
  }

  console.log(`Batch complete: ${successCount} geocoded, ${failCount} failed out of ${places.length}`);
  return { results, successCount, failCount };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MAPBOX_TOKEN = Deno.env.get("MAPBOX_TOKEN");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!MAPBOX_TOKEN) {
      return new Response(
        JSON.stringify({ error: "MAPBOX_TOKEN not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Supabase credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json().catch(() => ({}));
    const { cityId, dryRun = false, limit = 100 } = body;

    let query = supabase
      .from("places")
      .select("id, name, address, zone, city_id")
      .or("latitude.is.null,longitude.is.null")
      .limit(Math.min(limit, 500));

    if (cityId) {
      query = query.eq("city_id", cityId);
    }

    const { data: places, error: placesError } = await query;

    if (placesError) {
      console.error("Error fetching places:", placesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch places" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!places || places.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "No places need geocoding",
          count: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${places.length} places without coordinates`);

    const cityIds = [...new Set(places.map(p => p.city_id))];
    const { data: cities, error: citiesError } = await supabase
      .from("cities")
      .select("id, name, region, latitude, longitude")
      .in("id", cityIds);

    if (citiesError) {
      console.error("Error fetching cities:", citiesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch cities" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const citiesMap = new Map(cities?.map(c => [c.id, c as City]) || []);

    if (dryRun) {
      return new Response(
        JSON.stringify({
          message: "Dry run - no changes made",
          count: places.length,
          places: places.map(p => ({
            id: p.id,
            name: p.name,
            city: citiesMap.get(p.city_id)?.name || "Unknown",
            region: citiesMap.get(p.city_id)?.region || "Unknown",
          })),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (places.length <= 10) {
      const { results, successCount, failCount } = await processBatch(
        places as Place[],
        citiesMap,
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY,
        MAPBOX_TOKEN
      );

      return new Response(
        JSON.stringify({
          message: "Batch geocoding complete",
          total: places.length,
          success: successCount,
          failed: failCount,
          results,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // @ts-ignore - EdgeRuntime is available in Supabase
    EdgeRuntime.waitUntil(
      processBatch(
        places as Place[], 
        citiesMap, 
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY,
        MAPBOX_TOKEN
      )
    );

    return new Response(
      JSON.stringify({
        message: "Batch geocoding started in background",
        total: places.length,
        status: "processing",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in batch-geocode-places:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
