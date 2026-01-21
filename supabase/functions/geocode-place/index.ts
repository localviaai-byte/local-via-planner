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
  placeId?: string; // If provided, update the place directly
}

interface GeocodeResponse {
  latitude: number | null;
  longitude: number | null;
  formatted_address?: string;
  success: boolean;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight
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

    // Build search query - prioritize address if available, include more context
    let searchQuery: string;
    if (address) {
      searchQuery = `${address}, ${cityName}, ${country}`;
    } else {
      // For POI names, include the city name in the search
      searchQuery = `${placeName}, ${cityName}, ${country}`;
    }

    console.log(`Geocoding: "${searchQuery}"`);

    // Call Mapbox Geocoding API
    const geocodeUrl = new URL("https://api.mapbox.com/geocoding/v5/mapbox.places/" + encodeURIComponent(searchQuery) + ".json");
    geocodeUrl.searchParams.set("access_token", MAPBOX_TOKEN);
    geocodeUrl.searchParams.set("limit", "5"); // Get more results to filter
    geocodeUrl.searchParams.set("types", "poi,address,place,locality");
    geocodeUrl.searchParams.set("country", "IT"); // Limit to Italy
    geocodeUrl.searchParams.set("language", "it");
    
    // Add proximity bias towards the general area if we know it (use center of Italy as broad hint)
    geocodeUrl.searchParams.set("proximity", "14.4869,40.7509"); // Near Napoli/Pompei area by default

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

    // Helper to check if a result contains our city name
    const containsCityName = (placeName: string, targetCity: string): boolean => {
      const normalizedPlace = placeName.toLowerCase();
      const normalizedCity = targetCity.toLowerCase();
      return normalizedPlace.includes(normalizedCity);
    };

    // Find the best matching result (one that contains our city name)
    let bestFeature = null;
    if (geocodeData.features && geocodeData.features.length > 0) {
      // First, try to find a result that matches our city
      bestFeature = geocodeData.features.find((f: { place_name: string }) => 
        containsCityName(f.place_name, cityName)
      );
      
      // If no city match, use the first result but only if it's in southern Italy (rough check)
      if (!bestFeature) {
        const firstFeature = geocodeData.features[0];
        const [lng, lat] = firstFeature.center;
        // Check if it's in southern Italy (lat ~38-42, lng ~13-18 for Campania area)
        if (lat > 38 && lat < 42 && lng > 13 && lng < 18) {
          bestFeature = firstFeature;
        }
      }
    }

    if (!bestFeature) {
      // Try a more specific fallback search
      const fallbackQuery = `${placeName} ${cityName} Campania`;
      console.log(`No valid results, trying fallback: "${fallbackQuery}"`);
      
      const fallbackUrl = new URL("https://api.mapbox.com/geocoding/v5/mapbox.places/" + encodeURIComponent(fallbackQuery) + ".json");
      fallbackUrl.searchParams.set("access_token", MAPBOX_TOKEN);
      fallbackUrl.searchParams.set("limit", "5");
      fallbackUrl.searchParams.set("country", "IT");
      fallbackUrl.searchParams.set("language", "it");
      fallbackUrl.searchParams.set("proximity", "14.4869,40.7509");

      const fallbackResponse = await fetch(fallbackUrl.toString());
      const fallbackData = await fallbackResponse.json();

      if (fallbackData.features && fallbackData.features.length > 0) {
        bestFeature = fallbackData.features.find((f: { place_name: string }) => 
          containsCityName(f.place_name, cityName)
        ) || fallbackData.features[0];
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
