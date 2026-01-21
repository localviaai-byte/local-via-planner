import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PlacePrefillRequest {
  placeName: string;
  placeType: string;
  cityName: string;
  cityRegion?: string;
  cityLatitude?: number;
  cityLongitude?: number;
}

interface PlacePrefillResponse {
  address: string | null;
  zone: string | null;
  cuisine_type: string | null;
  price_range: string | null;
  indoor_outdoor: string | null;
  best_times: string[];
  social_level: number | null;
  vibe_touristy_to_local: number | null;
  local_warning: string | null;
  suggested_one_liner: string | null;
  latitude: number | null;
  longitude: number | null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { placeName, placeType, cityName, cityRegion, cityLatitude, cityLongitude }: PlacePrefillRequest = await req.json();

    if (!placeName || !cityName) {
      return new Response(
        JSON.stringify({ error: "placeName e cityName sono richiesti" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Prefilling data for: ${placeName} (${placeType}) in ${cityName}`);

    const placeTypeLabels: Record<string, string> = {
      attraction: "attrazione/museo",
      restaurant: "ristorante",
      bar: "bar",
      club: "club/discoteca",
      experience: "esperienza",
      view: "punto panoramico",
      zone: "quartiere",
    };

    const typeLabel = placeTypeLabels[placeType] || placeType || "luogo";

    const systemPrompt = `Sei un esperto locale italiano che conosce perfettamente i luoghi di ${cityName}. 
Devi fornire informazioni accurate su luoghi specifici per aiutare i contributor locali a compilare un database turistico.
Rispondi SOLO con i dati richiesti, usando il tool "prefill_place_data".
Se non sei sicuro di un dato, lascialo null.
Usa il tuo giudizio basato su conoscenze generali e contesto.`;

    const userPrompt = `Cerca informazioni su "${placeName}", un ${typeLabel} a ${cityName}, Italia.
Fornisci i seguenti dati nel formato strutturato richiesto:
- Indirizzo (se conosciuto)
- Zona/quartiere della città
- Tipo di cucina (solo se ristorante)
- Fascia di prezzo (budget/moderate/expensive/luxury)
- Indoor/outdoor (indoor/outdoor/both)
- Orari migliori per visitare (morning/lunch/aperitivo/dinner/night/late_night)
- Livello sociale da 1 a 5 (1=tranquillo, 5=molto sociale)
- Quanto è turistico vs locale da 1 a 5 (1=molto turistico, 5=solo locals)
- Un avviso/consiglio locale importante (max 100 caratteri)
- Una frase ad effetto che catturi l'essenza del posto (max 100 caratteri)`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "prefill_place_data",
              description: "Pre-compila i dati di un luogo turistico",
              parameters: {
                type: "object",
                properties: {
                  address: {
                    type: "string",
                    description: "Indirizzo del posto (es: Via Roma 42)",
                    nullable: true,
                  },
                  zone: {
                    type: "string",
                    description: "Quartiere o zona della città (es: Centro Storico, Trastevere)",
                    nullable: true,
                  },
                  cuisine_type: {
                    type: "string",
                    description: "Tipo di cucina per ristoranti (es: pizza, pesce, tradizionale)",
                    nullable: true,
                  },
                  price_range: {
                    type: "string",
                    enum: ["budget", "moderate", "expensive", "luxury"],
                    description: "Fascia di prezzo",
                    nullable: true,
                  },
                  indoor_outdoor: {
                    type: "string",
                    enum: ["indoor", "outdoor", "both"],
                    description: "Se il posto è al chiuso, all'aperto, o entrambi",
                    nullable: true,
                  },
                  best_times: {
                    type: "array",
                    items: {
                      type: "string",
                      enum: ["morning", "lunch", "aperitivo", "dinner", "night", "late_night"],
                    },
                    description: "Orari migliori per visitare",
                  },
                  social_level: {
                    type: "number",
                    minimum: 1,
                    maximum: 5,
                    description: "Livello sociale (1=tranquillo, 5=molto sociale)",
                    nullable: true,
                  },
                  vibe_touristy_to_local: {
                    type: "number",
                    minimum: 1,
                    maximum: 5,
                    description: "Quanto è locale vs turistico (1=turistico, 5=solo locals)",
                    nullable: true,
                  },
                  local_warning: {
                    type: "string",
                    maxLength: 100,
                    description: "Consiglio/avviso locale importante",
                    nullable: true,
                  },
                  suggested_one_liner: {
                    type: "string",
                    maxLength: 100,
                    description: "Frase ad effetto che cattura l'essenza del posto",
                    nullable: true,
                  },
                },
                required: ["best_times"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "prefill_place_data" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite richieste raggiunto, riprova tra poco" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crediti AI esauriti" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data, null, 2));

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function?.name !== "prefill_place_data") {
      console.error("Unexpected response format:", data);
      return new Response(
        JSON.stringify({ error: "Formato risposta AI non valido" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let prefillData: PlacePrefillResponse;
    try {
      prefillData = JSON.parse(toolCall.function.arguments);
    } catch (parseError) {
      console.error("Error parsing tool arguments:", parseError);
      return new Response(
        JSON.stringify({ error: "Errore nel parsing dei dati AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Prefill data extracted:", prefillData);

    // Geocode the place using region-aware logic
    const MAPBOX_TOKEN = Deno.env.get("MAPBOX_TOKEN");
    if (MAPBOX_TOKEN && (prefillData.address || placeName)) {
      try {
        // Use the region-aware geocode-place function logic inline
        const searchQuery = prefillData.address 
          ? `${prefillData.address}, ${cityName}, Italia`
          : `${placeName}, ${cityName}, Italia`;

        console.log(`Geocoding: "${searchQuery}" (region: ${cityRegion || 'unknown'})`);

        // Italian regions with approximate bounding boxes
        const REGION_BOUNDS: Record<string, { minLat: number; maxLat: number; minLng: number; maxLng: number; center: { lat: number; lng: number } }> = {
          'campania': { minLat: 39.9, maxLat: 41.5, minLng: 13.7, maxLng: 15.8, center: { lat: 40.85, lng: 14.25 } },
          'lazio': { minLat: 41.0, maxLat: 42.9, minLng: 11.4, maxLng: 14.0, center: { lat: 41.9, lng: 12.5 } },
          'toscana': { minLat: 42.2, maxLat: 44.5, minLng: 9.7, maxLng: 12.4, center: { lat: 43.35, lng: 11.05 } },
          'lombardia': { minLat: 44.7, maxLat: 46.6, minLng: 8.5, maxLng: 11.4, center: { lat: 45.65, lng: 9.95 } },
          'veneto': { minLat: 44.8, maxLat: 47.1, minLng: 10.6, maxLng: 13.1, center: { lat: 45.45, lng: 11.85 } },
          'puglia': { minLat: 39.8, maxLat: 42.2, minLng: 15.0, maxLng: 18.5, center: { lat: 41.0, lng: 16.5 } },
          'sicilia': { minLat: 36.6, maxLat: 38.8, minLng: 12.4, maxLng: 15.7, center: { lat: 37.5, lng: 14.0 } },
        };
        const ITALY_BOUNDS = { minLat: 35.5, maxLat: 47.1, minLng: 6.6, maxLng: 18.5, center: { lat: 41.9, lng: 12.5 } };

        const normalizedRegion = cityRegion?.toLowerCase().trim() || '';
        const regionBounds = REGION_BOUNDS[normalizedRegion] || ITALY_BOUNDS;
        
        const proximityLng = cityLongitude || regionBounds.center.lng;
        const proximityLat = cityLatitude || regionBounds.center.lat;

        const geocodeUrl = new URL("https://api.mapbox.com/geocoding/v5/mapbox.places/" + encodeURIComponent(searchQuery) + ".json");
        geocodeUrl.searchParams.set("access_token", MAPBOX_TOKEN);
        geocodeUrl.searchParams.set("limit", "5");
        geocodeUrl.searchParams.set("types", "poi,address,place,locality");
        geocodeUrl.searchParams.set("country", "IT");
        geocodeUrl.searchParams.set("language", "it");
        geocodeUrl.searchParams.set("proximity", `${proximityLng},${proximityLat}`);

        const geocodeResponse = await fetch(geocodeUrl.toString());
        
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json();
          
          // Filter to region bounds
          const isInRegion = (feature: { center: number[] }): boolean => {
            const [lng, lat] = feature.center;
            return lat >= regionBounds.minLat && lat <= regionBounds.maxLat && 
                   lng >= regionBounds.minLng && lng <= regionBounds.maxLng;
          };
          
          const validFeatures = (geocodeData.features || []).filter(isInRegion);
          
          if (validFeatures.length > 0) {
            // Prefer result containing city name
            const cityNameLower = cityName.toLowerCase();
            const bestFeature = validFeatures.find((f: { place_name: string }) =>
              f.place_name.toLowerCase().includes(cityNameLower)
            ) || validFeatures[0];
            
            const [longitude, latitude] = bestFeature.center;
            prefillData.latitude = latitude;
            prefillData.longitude = longitude;
            console.log(`Geocoded coordinates: ${latitude}, ${longitude} (in ${normalizedRegion || 'italy'} region)`);
          } else {
            console.log(`No geocoding results in ${normalizedRegion || 'italy'} region`);
            prefillData.latitude = null;
            prefillData.longitude = null;
          }
        } else {
          console.error("Geocoding request failed:", geocodeResponse.status);
          prefillData.latitude = null;
          prefillData.longitude = null;
        }
      } catch (geocodeError) {
        console.error("Geocoding error:", geocodeError);
        prefillData.latitude = null;
        prefillData.longitude = null;
      }
    } else {
      prefillData.latitude = null;
      prefillData.longitude = null;
    }

    return new Response(JSON.stringify(prefillData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-prefill-place:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Errore sconosciuto" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
