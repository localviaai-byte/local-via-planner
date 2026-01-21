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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { placeName, address, cityName, country = "Italia", placeId }: GeocodeRequest = await req.json();

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

    // Build search query
    const searchQuery = address 
      ? `${address}, ${cityName}, ${country}`
      : `${placeName}, ${cityName}, ${country}`;

    console.log(`Geocoding: "${searchQuery}"`);

    const geocodeUrl = new URL("https://api.mapbox.com/geocoding/v5/mapbox.places/" + encodeURIComponent(searchQuery) + ".json");
    geocodeUrl.searchParams.set("access_token", MAPBOX_TOKEN);
    geocodeUrl.searchParams.set("limit", "5");
    geocodeUrl.searchParams.set("types", "poi,address,place,locality");
    geocodeUrl.searchParams.set("country", "IT");
    geocodeUrl.searchParams.set("language", "it");
    geocodeUrl.searchParams.set("proximity", "14.4869,40.7509");

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

    // Filter features to only those in Campania/Southern Italy region
    const isInCampaniaRegion = (feature: { center: number[] }): boolean => {
      const [lng, lat] = feature.center;
      return lat > 39.5 && lat < 41.5 && lng > 13 && lng < 16;
    };

    const containsCityName = (featurePlaceName: string, targetCity: string): boolean => {
      return featurePlaceName.toLowerCase().includes(targetCity.toLowerCase());
    };

    // Filter to valid regional results first
    let validFeatures = (geocodeData.features || []).filter(isInCampaniaRegion);
    console.log(`Valid features in region: ${validFeatures.length}`);

    // Find best match
    let bestFeature = null;
    if (validFeatures.length > 0) {
      bestFeature = validFeatures.find((f: { place_name: string }) => 
        containsCityName(f.place_name, cityName)
      ) || validFeatures[0];
    }

    // Fallback search if no results
    if (!bestFeature) {
      const fallbackQuery = `${placeName} ${cityName} Campania`;
      console.log(`No valid results in region, trying fallback: "${fallbackQuery}"`);
      
      const fallbackUrl = new URL("https://api.mapbox.com/geocoding/v5/mapbox.places/" + encodeURIComponent(fallbackQuery) + ".json");
      fallbackUrl.searchParams.set("access_token", MAPBOX_TOKEN);
      fallbackUrl.searchParams.set("limit", "5");
      fallbackUrl.searchParams.set("country", "IT");
      fallbackUrl.searchParams.set("language", "it");
      fallbackUrl.searchParams.set("proximity", "14.4869,40.7509");

      const fallbackResponse = await fetch(fallbackUrl.toString());
      const fallbackData = await fallbackResponse.json();

      if (fallbackData.features && fallbackData.features.length > 0) {
        validFeatures = fallbackData.features.filter(isInCampaniaRegion);
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
          error: "Coordinate non trovate" 
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
