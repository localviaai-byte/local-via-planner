import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type TravelPeriodType = 'none' | 'season' | 'month' | 'dates';
type Season = 'spring' | 'summer' | 'autumn' | 'winter';

interface TravelPeriod {
  type: TravelPeriodType;
  season?: Season;
  month?: number; // 0-11
  dates?: { start: string; end: string }; // ISO strings
}

interface TripPreferences {
  city: string;
  nearbyAreas: boolean;
  maxTravelMinutes: number;
  numDays: number;
  travelPeriod?: TravelPeriod;
  travelers: { adults: number; children: number; seniors: number };
  travelWith: string;
  interests: string[];
  topInterests: string[];
  rhythm: number;
  startTime: string;
  lunchStyle: string;
  // New structured food preferences
  foodPrimary: string[];
  foodSecondary: string[];
  atmospherePreferences: string[];
  foodBudget: 'budget' | 'moderate' | 'expensive' | 'luxury';
  dietaryRestrictions: string[];
  // Legacy
  cuisinePreferences: string[];
  budget: number;
  activityStyle: string;
  guidedTours: 'autonomous' | 'guided' | 'unknown';
  walkingTolerance: string;
  accommodation: { zone: string } | null;
  transport: string;
  constraints: string[];
  wishes: string;
  avoid: string[];
}

interface ItinerarySlot {
  id: string;
  type: "activity" | "meal" | "break" | "transfer";
  startTime: string;
  endTime: string;
  place?: {
    id: string;
    name: string;
    type: string;
    zone: string | null;
    address: string | null;
    local_one_liner: string | null;
    duration_minutes: number | null;
    price_range: string | null;
    cuisine_type: string | null;
    photo_url: string | null;
    indoor_outdoor: string | null;
    crowd_level: string | null;
    vibe_touristy_to_local: number | null;
  };
  reason: string;
  alternatives?: { id: string; name: string; type: string }[];
  notes?: string;
  walkingMinutes?: number;
  productSuggestions?: {
    id: string;
    title: string;
    short_pitch: string;
    price_cents: number;
    duration_minutes: number | null;
  }[];
}

interface ItineraryDay {
  dayNumber: number;
  date: string;
  slots: ItinerarySlot[];
  summary: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { preferences }: { preferences: TripPreferences } = await req.json();

    if (!preferences?.city) {
      return new Response(
        JSON.stringify({ error: "Seleziona una città" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Generating itinerary for ${preferences.city}, ${preferences.numDays} days`);

    // Fetch city info
    const { data: cityData, error: cityError } = await supabase
      .from("cities")
      .select("*")
      .eq("slug", preferences.city)
      .maybeSingle();

    if (cityError || !cityData) {
      // Try by ID
      const { data: cityById } = await supabase
        .from("cities")
        .select("*")
        .eq("id", preferences.city)
        .maybeSingle();
      
      if (!cityById) {
        return new Response(
          JSON.stringify({ error: "Città non trovata" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const city = cityData || (await supabase.from("cities").select("*").eq("id", preferences.city).single()).data;
    const cityId = city.id;

    // Fetch approved places for the city
    const { data: places, error: placesError } = await supabase
      .from("places")
      .select(`
        id, name, place_type, zone, zone_id, address, 
        local_one_liner, local_warning, duration_minutes,
        price_range, cuisine_type, meal_time, bar_time,
        food_primary, food_secondary, format_experience, dietary_options,
        photo_url, indoor_outdoor, crowd_level,
        best_times, best_days, ideal_for,
        vibe_touristy_to_local, social_level,
        physical_effort, mental_effort,
        why_people_go, mood_primary,
        latitude, longitude
      `)
      .eq("city_id", cityId)
      .eq("status", "approved");

    if (placesError) {
      console.error("Error fetching places:", placesError);
      throw new Error("Errore nel caricamento dei luoghi");
    }

    // Fetch approved products for add-on suggestions
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(`
        id, title, short_pitch, price_cents, 
        duration_minutes, product_type, preferred_time_buckets
      `)
      .eq("city_id", cityId)
      .eq("status", "approved");

    if (productsError) {
      console.error("Error fetching products:", productsError);
    }

    // Fetch city zones
    const { data: zones } = await supabase
      .from("city_zones")
      .select("id, name, vibe_primary, best_time, touristy_score, local_tip")
      .eq("city_id", cityId)
      .eq("status", "approved");

    console.log(`Found ${places?.length || 0} places, ${products?.length || 0} products, ${zones?.length || 0} zones`);

    // If no places in database, return helpful message
    if (!places || places.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "Nessun luogo approvato per questa città",
          message: "Aggiungi prima dei luoghi nel backoffice e approvali"
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare data for AI
    // Map foodBudget to price_range for filtering
    const budgetToPrice: Record<string, string[]> = {
      budget: ['budget'],
      moderate: ['budget', 'moderate'],
      expensive: ['budget', 'moderate', 'expensive'],
      luxury: ['budget', 'moderate', 'expensive', 'luxury'],
    };
    const allowedPriceRanges = budgetToPrice[preferences.foodBudget] || ['budget', 'moderate', 'expensive', 'luxury'];

    const placesForAI = places.map(p => ({
      id: p.id,
      name: p.name,
      type: p.place_type,
      zone: p.zone,
      one_liner: p.local_one_liner,
      warning: p.local_warning,
      duration: p.duration_minutes || 60,
      price: p.price_range,
      cuisine: p.cuisine_type,
      food_primary: p.food_primary,
      food_secondary: p.food_secondary,
      meal_time: p.meal_time,
      best_times: p.best_times,
      ideal_for: p.ideal_for,
      touristy: p.vibe_touristy_to_local,
      effort: p.physical_effort,
      indoor_outdoor: p.indoor_outdoor,
      crowd: p.crowd_level,
      mood: p.mood_primary,
      why: p.why_people_go,
      budget_match: !p.price_range || allowedPriceRanges.includes(p.price_range),
    }));

    const productsForAI = (products || []).map(p => ({
      id: p.id,
      title: p.title,
      pitch: p.short_pitch,
      price: p.price_cents,
      duration: p.duration_minutes,
      type: p.product_type,
      times: p.preferred_time_buckets,
    }));

    const zonesForAI = (zones || []).map(z => ({
      id: z.id,
      name: z.name,
      vibe: z.vibe_primary,
      best_time: z.best_time,
      touristy: z.touristy_score,
      tip: z.local_tip,
    }));

    // Build budget label for prompt
    const budgetLabels: Record<string, string> = {
      budget: '€ (economico)',
      moderate: '€€ (medio)',
      expensive: '€€€ (curato)',
      luxury: '€€€€ (esperienza premium)',
    };
    const foodBudgetLabel = budgetLabels[preferences.foodBudget] || '€€ (medio)';

    // Build travel period label and compute start date for itinerary
    const seasonLabels: Record<string, string> = {
      spring: 'primavera (marzo-maggio) — clima mite, meno folla, fioritura',
      summer: 'estate (giugno-agosto) — caldo intenso, alta stagione turistica, serate vivaci',
      autumn: 'autunno (settembre-novembre) — temperatura piacevole, folla ridotta, prodotti tipici',
      winter: 'inverno (dicembre-febbraio) — freddo, poca folla, atmosfera raccolta',
    };
    const monthNames = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];

    // Season → middle month (1-indexed for Date constructor month-1)
    const seasonMidMonth: Record<string, number> = { spring: 4, summer: 7, autumn: 10, winter: 1 };
    // Season → representative year (winter of current year could be next year's Jan)
    const getSeasonYear = (season: string) => {
      const currentYear = new Date().getFullYear();
      // If winter and we're past October, use next year's January
      if (season === 'winter' && new Date().getMonth() >= 10) return currentYear + 1;
      return currentYear;
    };

    let travelPeriodLabel = 'non specificato';
    // Use a local-date safe constructor: new Date(year, month0indexed, day) — no UTC shift issues
    let itineraryStartYear = new Date().getFullYear();
    let itineraryStartMonth0 = new Date().getMonth(); // 0-indexed
    let itineraryStartDay = new Date().getDate();

    const tp = preferences.travelPeriod;
    if (tp) {
      if (tp.type === 'season' && tp.season) {
        travelPeriodLabel = seasonLabels[tp.season] || tp.season;
        itineraryStartYear = getSeasonYear(tp.season);
        itineraryStartMonth0 = seasonMidMonth[tp.season] - 1; // convert to 0-indexed
        itineraryStartDay = 15;
      } else if (tp.type === 'month' && tp.month !== undefined) {
        // tp.month is already 0-indexed (0=gennaio, 7=agosto)
        travelPeriodLabel = monthNames[tp.month];
        itineraryStartYear = new Date().getFullYear();
        // If the selected month is already past, use next year
        if (tp.month < new Date().getMonth()) itineraryStartYear += 1;
        itineraryStartMonth0 = tp.month;
        itineraryStartDay = 15;
      } else if (tp.type === 'dates' && tp.dates?.start) {
        // Dates from frontend are ISO strings (serialized Date objects)
        // Parse as local date to avoid UTC midnight → previous day shift
        const parseLocalDate = (d: string | Date): { y: number; m: number; day: number } => {
          const s = typeof d === 'string' ? d : d.toISOString();
          // ISO string: "2026-08-13T00:00:00.000Z" or "2026-08-13"
          const match = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (match) return { y: parseInt(match[1]), m: parseInt(match[2]) - 1, day: parseInt(match[3]) };
          const fd = new Date(s);
          return { y: fd.getFullYear(), m: fd.getMonth(), day: fd.getDate() };
        };
        const start = parseLocalDate(tp.dates.start as unknown as string);
        const endRaw = tp.dates.end ? parseLocalDate(tp.dates.end as unknown as string) : start;
        itineraryStartYear = start.y;
        itineraryStartMonth0 = start.m;
        itineraryStartDay = start.day;

        const fmt = (v: { y: number; m: number; day: number }) =>
          `${v.day} ${monthNames[v.m]} ${v.y}`;
        const endStr = tp.dates.end ? ` → ${fmt(endRaw)}` : '';
        travelPeriodLabel = `date precise: ${fmt(start)}${endStr}`;
      }
    }

    // Build the base start date using local-safe constructor (avoids UTC timezone shifts)
    const itineraryStartDate = new Date(itineraryStartYear, itineraryStartMonth0, itineraryStartDay);

    // Build comprehensive prompt
    const systemPrompt = `Sei un esperto planner di viaggi locale italiano che crea itinerari personalizzati.
Hai accesso a un database curato di luoghi, ristoranti, bar e esperienze verificati da local contributors.

REGOLE CRITICHE:
1. Usa SOLO i luoghi dal database fornito - non inventare posti
2. Rispetta il ritmo scelto: ${preferences.rhythm <= 2 ? 'Calmo - max 2 attività/giorno' : preferences.rhythm <= 3 ? 'Moderato - 3-4 attività/giorno' : 'Intenso - 4-5 attività/giorno'}
3. BUDGET PASTI: ${foodBudgetLabel} — PREFERISCI FORTEMENTE luoghi con budget_match=true. Evita luoghi con budget_match=false a meno che non ci siano alternative.
4. Preferenze cibo: ${(preferences.foodPrimary || []).join(', ') || 'qualsiasi'} ${(preferences.foodSecondary || []).length > 0 ? '(dettagli: ' + preferences.foodSecondary.join(', ') + ')' : ''}
5. Atmosfera preferita: ${(preferences.atmospherePreferences || []).join(', ') || 'qualsiasi'}
6. Evita: ${(preferences.avoid || []).join(', ') || 'niente di specifico'}
7. Interessi principali: ${(preferences.topInterests || []).join(', ') || (preferences.interests || []).join(', ')}
8. Chi viaggia: ${preferences.travelWith} - adatta il mood di conseguenza
9. Tolleranza camminata: ${preferences.walkingTolerance}
10. Orario inizio: ${preferences.startTime === 'early' ? '8:00-9:00' : preferences.startTime === 'normal' ? '9:30-10:00' : '11:00+'}
11. Stile pranzo: ${preferences.lunchStyle === 'long' ? 'Lungo (90min)' : 'Veloce (45min)'}
12. Visite guidate: ${preferences.guidedTours === 'guided' ? 'Preferisce tour guidati - suggerisci SEMPRE prodotti/esperienze guidate' : preferences.guidedTours === 'autonomous' ? 'Preferisce visitare in autonomia - suggerisci prodotti SOLO se molto rilevanti' : 'Non ha preferenze - suggerisci prodotti quando migliorano l\'esperienza'}
13. Restrizioni alimentari: ${(preferences.dietaryRestrictions || []).join(', ') || 'nessuna'} — se presenti, scegli ristoranti che le supportano (campo dietary_options)
14. PERIODO DI VIAGGIO: ${travelPeriodLabel} — FONDAMENTALE: adatta TUTTE le tue scelte tenendo conto di questo periodo. Menziona esplicitamente il periodo nel "reason" di ogni slot (es. "perfetto in estate per..." o "in agosto consigliamo di..."). Considera: affollamento stagionale, orari estivi/invernali, condizioni meteo, aperture speciali/chiusure.

Per ogni slot suggerisci prodotti/esperienze add-on seguendo le preferenze dell'utente.
Usa il campo "local_one_liner" come base per le descrizioni - è il DNA del posto.`;

    const userPrompt = `Crea un itinerario di ${preferences.numDays} ${preferences.numDays === 1 ? 'giorno' : 'giorni'} a ${city.name}.

PERIODO DEL VIAGGIO: ${travelPeriodLabel}
Tieni SEMPRE presente il periodo in ogni scelta e nella motivazione degli slot.

DATABASE LUOGHI DISPONIBILI:
${JSON.stringify(placesForAI, null, 2)}

PRODOTTI/ESPERIENZE ADD-ON DISPONIBILI:
${JSON.stringify(productsForAI, null, 2)}

ZONE DELLA CITTÀ:
${JSON.stringify(zonesForAI, null, 2)}

PREFERENZE VIAGGIATORE:
- Interessi: ${(preferences.interests || []).join(', ')}
- Top priority: ${(preferences.topInterests || []).join(', ')}
- Budget pasti: ${foodBudgetLabel}
- Cibo preferito: ${(preferences.foodPrimary || []).join(', ') || 'qualsiasi'}
- Ritmo: ${preferences.rhythm}/5
- Viaggia: ${preferences.travelWith}
- Restrizioni alimentari: ${(preferences.dietaryRestrictions || []).join(', ') || 'nessuna'}
- Desideri speciali: ${preferences.wishes || 'nessuno'}

Genera l'itinerario ottimale usando SOLO luoghi dal database, raggruppando per zone quando possibile per minimizzare spostamenti.
Per ogni slot indica un motivo personalizzato basato sulle preferenze E sul periodo di viaggio.
Suggerisci prodotti add-on dove appropriato (es. tour guidato prima di un museo, degustazione dopo pranzo).`;

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
              name: "create_itinerary",
              description: "Crea un itinerario strutturato con giorni e slot temporali",
              parameters: {
                type: "object",
                properties: {
                  days: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        dayNumber: { type: "number" },
                        slots: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              type: { 
                                type: "string", 
                                enum: ["activity", "meal", "break"] 
                              },
                              startTime: { type: "string", description: "HH:MM format" },
                              endTime: { type: "string", description: "HH:MM format" },
                              placeId: { 
                                type: "string", 
                                description: "ID del luogo dal database" 
                              },
                              reason: { 
                                type: "string", 
                                description: "Motivazione personalizzata per questa scelta" 
                              },
                              alternativeIds: {
                                type: "array",
                                items: { type: "string" },
                                description: "ID di 1-2 alternative"
                              },
                              walkingMinutes: { 
                                type: "number",
                                description: "Minuti di camminata dallo slot precedente"
                              },
                              notes: { type: "string" },
                              productIds: {
                                type: "array",
                                items: { type: "string" },
                                description: "ID di prodotti add-on suggeriti per questo slot"
                              }
                            },
                            required: ["type", "startTime", "endTime", "reason"]
                          }
                        },
                        summary: { type: "string" }
                      },
                      required: ["dayNumber", "slots", "summary"]
                    }
                  }
                },
                required: ["days"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_itinerary" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite richieste AI raggiunto, riprova tra poco" }),
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

    const aiData = await response.json();
    console.log("AI response received");

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function?.name !== "create_itinerary") {
      console.error("Unexpected AI response format:", aiData);
      throw new Error("Formato risposta AI non valido");
    }

    let aiItinerary;
    try {
      aiItinerary = JSON.parse(toolCall.function.arguments);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      throw new Error("Errore nel parsing dell'itinerario");
    }

    // Map place IDs to full place data
    const placeMap = new Map(places.map(p => [p.id, p]));
    const productMap = new Map((products || []).map(p => [p.id, p]));

    const hasExactDates = tp?.type === 'dates' && !!tp.dates?.start;

    // Build final itinerary with full place data
    const itinerary: ItineraryDay[] = aiItinerary.days.map((day: any) => {
      let dateLabel: string;
      if (hasExactDates) {
        const baseDate = new Date(itineraryStartDate);
        baseDate.setDate(baseDate.getDate() + day.dayNumber - 1);
        dateLabel = baseDate.toLocaleDateString("it-IT", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      } else {
        dateLabel = `Giorno ${day.dayNumber}`;
      }

      return {
        dayNumber: day.dayNumber,
        date: dateLabel,
        summary: day.summary,
        slots: day.slots.map((slot: any, idx: number) => {
          const place = slot.placeId ? placeMap.get(slot.placeId) : null;
          const alternatives = (slot.alternativeIds || [])
            .map((id: string) => placeMap.get(id))
            .filter(Boolean)
            .map((p: any) => ({ id: p.id, name: p.name, type: p.place_type }));
          
          const productSuggestions = (slot.productIds || [])
            .map((id: string) => productMap.get(id))
            .filter(Boolean)
            .map((p: any) => ({
              id: p.id,
              title: p.title,
              short_pitch: p.short_pitch,
              price_cents: p.price_cents,
              duration_minutes: p.duration_minutes,
            }));

          return {
            id: `day${day.dayNumber}-slot${idx}`,
            type: slot.type,
            startTime: slot.startTime,
            endTime: slot.endTime,
            place: place ? {
              id: place.id,
              name: place.name,
              type: place.place_type,
              zone: place.zone,
              address: place.address,
              local_one_liner: place.local_one_liner,
              duration_minutes: place.duration_minutes,
              price_range: place.price_range,
              cuisine_type: place.cuisine_type,
              photo_url: place.photo_url,
              indoor_outdoor: place.indoor_outdoor,
              crowd_level: place.crowd_level,
              vibe_touristy_to_local: place.vibe_touristy_to_local,
              latitude: place.latitude,
              longitude: place.longitude,
            } : undefined,
            reason: slot.reason,
            alternatives,
            notes: slot.notes,
            walkingMinutes: slot.walkingMinutes || 0,
            productSuggestions: productSuggestions.length > 0 ? productSuggestions : undefined,
          };
        }),
      };
    });

    console.log(`Generated itinerary with ${itinerary.length} days`);

    return new Response(
      JSON.stringify({ 
        itinerary,
        city: {
          id: city.id,
          name: city.name,
          region: city.region,
          latitude: city.latitude,
          longitude: city.longitude,
        },
        meta: {
          placesUsed: places.length,
          productsAvailable: products?.length || 0,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-itinerary:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Errore sconosciuto" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
