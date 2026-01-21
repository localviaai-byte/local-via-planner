import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GeocodeRequest {
  placeName: string;
  address?: string;
  cityName: string;
  cityLatitude?: number;
  cityLongitude?: number;
  region?: string;
  country?: string;
  placeId?: string;
}

interface GeocodeResponse {
  latitude: number | null;
  longitude: number | null;
  formatted_address?: string;
  success: boolean;
  error?: string;
}

// Italian regions with approximate bounding boxes [minLat, maxLat, minLng, maxLng]
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

// Default bounds for Italy
const ITALY_BOUNDS = { minLat: 35.5, maxLat: 47.1, minLng: 6.6, maxLng: 18.5, center: { lat: 41.9, lng: 12.5 } };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      placeName, 
      address, 
      cityName, 
      cityLatitude,
      cityLongitude,
      region,
      country = "Italia", 
      placeId 
    }: GeocodeRequest = await req.json();

    if (!placeName || !cityName) {
      return new Response(
        JSON.stringify({ success: false, error: "placeName e cityName sono richiesti" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const MAPBOX_TOKEN = Deno.env.get("MAPBOX_TOKEN");
    if (!MAPBOX_TOKEN) {
      console.error("MAPBOX_TOKEN is not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Mapbox non configurato" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get region bounds for filtering - normalize region name
    const normalizedRegion = region?.toLowerCase().trim() || '';
    const regionBounds = REGION_BOUNDS[normalizedRegion] || ITALY_BOUNDS;
    
    // Determine proximity center - prefer city coords, then region center
    const proximityLng = cityLongitude || regionBounds.center.lng;
    const proximityLat = cityLatitude || regionBounds.center.lat;
    
    console.log(`Geocoding: "${placeName}" in ${cityName}, region: ${region || 'unknown'}`);
    console.log(`Using proximity: ${proximityLng}, ${proximityLat}`);
    console.log(`Region bounds: lat ${regionBounds.minLat}-${regionBounds.maxLat}, lng ${regionBounds.minLng}-${regionBounds.maxLng}`);

    // Filter function based on region bounds
    const isInRegion = (feature: { center: number[] }): boolean => {
      const [lng, lat] = feature.center;
      return lat >= regionBounds.minLat && lat <= regionBounds.maxLat && 
             lng >= regionBounds.minLng && lng <= regionBounds.maxLng;
    };

    const containsCityName = (featurePlaceName: string, targetCity: string): boolean => {
      return featurePlaceName.toLowerCase().includes(targetCity.toLowerCase());
    };

    // Build search query
    const searchQuery = address 
      ? `${address}, ${cityName}, ${country}`
      : `${placeName}, ${cityName}, ${country}`;

    const geocodeUrl = new URL("https://api.mapbox.com/geocoding/v5/mapbox.places/" + encodeURIComponent(searchQuery) + ".json");
    geocodeUrl.searchParams.set("access_token", MAPBOX_TOKEN);
    geocodeUrl.searchParams.set("limit", "5");
    geocodeUrl.searchParams.set("types", "poi,address,place,locality");
    geocodeUrl.searchParams.set("country", "IT");
    geocodeUrl.searchParams.set("language", "it");
    geocodeUrl.searchParams.set("proximity", `${proximityLng},${proximityLat}`);

    const geocodeResponse = await fetch(geocodeUrl.toString());
    
    if (!geocodeResponse.ok) {
      const errorText = await geocodeResponse.text();
      console.error("Mapbox geocoding error:", geocodeResponse.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: "Errore geocoding Mapbox" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geocodeData = await geocodeResponse.json();
    console.log("Mapbox response features count:", geocodeData.features?.length || 0);

    // Filter to valid regional results first
    let validFeatures = (geocodeData.features || []).filter(isInRegion);
    console.log(`Valid features in region ${normalizedRegion || 'italy'}: ${validFeatures.length}`);

    // Log all features for debugging
    (geocodeData.features || []).forEach((f: { place_name: string; center: number[] }, i: number) => {
      const inRegion = isInRegion(f);
      console.log(`  Feature ${i}: "${f.place_name}" at [${f.center[1].toFixed(4)}, ${f.center[0].toFixed(4)}] - in region: ${inRegion}`);
    });

    // Find best match
    let bestFeature = null;
    if (validFeatures.length > 0) {
      bestFeature = validFeatures.find((f: { place_name: string }) => 
        containsCityName(f.place_name, cityName)
      ) || validFeatures[0];
    }

    // Fallback search with region name if no results
    if (!bestFeature && region) {
      const fallbackQuery = `${placeName} ${cityName} ${region}`;
      console.log(`No valid results in region, trying fallback: "${fallbackQuery}"`);
      
      const fallbackUrl = new URL("https://api.mapbox.com/geocoding/v5/mapbox.places/" + encodeURIComponent(fallbackQuery) + ".json");
      fallbackUrl.searchParams.set("access_token", MAPBOX_TOKEN);
      fallbackUrl.searchParams.set("limit", "5");
      fallbackUrl.searchParams.set("country", "IT");
      fallbackUrl.searchParams.set("language", "it");
      fallbackUrl.searchParams.set("proximity", `${proximityLng},${proximityLat}`);

      const fallbackResponse = await fetch(fallbackUrl.toString());
      const fallbackData = await fallbackResponse.json();

      if (fallbackData.features && fallbackData.features.length > 0) {
        validFeatures = fallbackData.features.filter(isInRegion);
        console.log(`Fallback found ${validFeatures.length} valid features in region`);
        if (validFeatures.length > 0) {
          bestFeature = validFeatures.find((f: { place_name: string }) => 
            containsCityName(f.place_name, cityName)
          ) || validFeatures[0];
        }
      }
    }

    if (!bestFeature) {
      console.log("No coordinates found even with fallback");
      return new Response(
        JSON.stringify({ 
          success: true, 
          latitude: null, 
          longitude: null,
          error: "Coordinate non trovate nella regione specificata" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const [longitude, latitude] = bestFeature.center;
    const formatted_address = bestFeature.place_name;

    console.log(`Found coordinates: ${latitude}, ${longitude} for "${formatted_address}"`);

    // If placeId is provided, update the place directly in the database
    if (placeId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const { error: updateError } = await supabase
          .from("places")
          .update({ latitude, longitude })
          .eq("id", placeId);

        if (updateError) {
          console.error("Error updating place coordinates:", updateError);
        } else {
          console.log(`Updated place ${placeId} with coordinates`);
        }
      }
    }

    const response: GeocodeResponse = {
      success: true,
      latitude,
      longitude,
      formatted_address,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in geocode-place:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Errore sconosciuto" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
