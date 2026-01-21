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
}

interface GeocodeResult {
  placeId: string;
  placeName: string;
  success: boolean;
  latitude?: number;
  longitude?: number;
  error?: string;
}

// Geocode a single place
async function geocodePlace(
  place: Place,
  cityName: string,
  mapboxToken: string
): Promise<GeocodeResult> {
  try {
    const searchQuery = place.address 
      ? `${place.address}, ${cityName}, Italia`
      : `${place.name}, ${cityName}, Italia`;

    console.log(`Geocoding: "${searchQuery}"`);

    const geocodeUrl = new URL(
      "https://api.mapbox.com/geocoding/v5/mapbox.places/" + 
      encodeURIComponent(searchQuery) + ".json"
    );
    geocodeUrl.searchParams.set("access_token", mapboxToken);
    geocodeUrl.searchParams.set("limit", "5");
    geocodeUrl.searchParams.set("types", "poi,address,place,locality");
    geocodeUrl.searchParams.set("country", "IT");
    geocodeUrl.searchParams.set("language", "it");
    geocodeUrl.searchParams.set("proximity", "14.4869,40.7509");

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

    const cityNameLower = cityName.toLowerCase();
    
    // Filter features to only those in southern Italy (Campania area)
    const validFeatures = data.features.filter((f: { center: number[] }) => {
      const [lng, lat] = f.center;
      // Campania/Southern Italy bounding box
      return lat > 39.5 && lat < 41.5 && lng > 13 && lng < 16;
    });

    if (validFeatures.length === 0) {
      console.log(`No results in Campania area for ${place.name}`);
      return {
        placeId: place.id,
        placeName: place.name,
        success: false,
        error: "No valid location in target region",
      };
    }

    // Prefer result containing city name
    let bestFeature = validFeatures.find((f: { place_name: string }) =>
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

    const result = await geocodePlace(place, city.name, mapboxToken);
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
      .select("id, name, region")
      .in("id", cityIds);

    if (citiesError) {
      console.error("Error fetching cities:", citiesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch cities" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const citiesMap = new Map(cities?.map(c => [c.id, c]) || []);

    if (dryRun) {
      return new Response(
        JSON.stringify({
          message: "Dry run - no changes made",
          count: places.length,
          places: places.map(p => ({
            id: p.id,
            name: p.name,
            city: citiesMap.get(p.city_id)?.name || "Unknown",
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
