import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      placeName,
      placeType,
      cityName,
      cityRegion,
      zone,
      whyPeopleGo,
      localOneLiner,
      moodPrimary,
      moodSecondary,
      idealFor,
      bestTimes,
      localWarning,
      cuisineType,
      priceRange,
      soloFriendly,
      groupFriendly,
      localSecret,
      touristTrap,
      vibeCalm,
      vibeTouristy,
    } = await req.json();

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

    const placeTypeLabels: Record<string, string> = {
      attraction: "attrazione",
      restaurant: "ristorante",
      bar: "bar",
      club: "club/discoteca",
      experience: "esperienza",
      view: "punto panoramico",
      zone: "quartiere",
    };
    const typeLabel = placeTypeLabels[placeType] || placeType || "luogo";

    // Build context from available data
    const contextParts: string[] = [];
    if (zone) contextParts.push(`Si trova nella zona: ${zone}`);
    if (whyPeopleGo?.length) contextParts.push(`Le persone ci vanno per: ${whyPeopleGo.join(", ")}`);
    if (localOneLiner) contextParts.push(`Frase che lo descrive: "${localOneLiner}"`);
    if (moodPrimary) contextParts.push(`Atmosfera principale: ${moodPrimary}`);
    if (moodSecondary) contextParts.push(`Atmosfera secondaria: ${moodSecondary}`);
    if (idealFor?.length) contextParts.push(`Ideale per: ${idealFor.join(", ")}`);
    if (bestTimes?.length) contextParts.push(`Orari migliori: ${bestTimes.join(", ")}`);
    if (localWarning) contextParts.push(`Avvertenza locale: ${localWarning}`);
    if (cuisineType) contextParts.push(`Cucina: ${cuisineType}`);
    if (priceRange) contextParts.push(`Fascia prezzo: ${priceRange}`);
    if (soloFriendly) contextParts.push("Adatto a chi viaggia da solo");
    if (groupFriendly) contextParts.push("Adatto a gruppi");
    if (localSecret) contextParts.push("È considerato un segreto locale");
    if (touristTrap) contextParts.push("Attenzione: può essere una trappola per turisti");
    if (vibeCalm != null) contextParts.push(`Vibe calmo→energetico: ${vibeCalm}/5`);
    if (vibeTouristy != null) contextParts.push(`Vibe turistico→locale: ${vibeTouristy}/5`);

    const contextBlock = contextParts.length > 0
      ? `\n\nEcco le informazioni disponibili su questo luogo:\n${contextParts.map(c => `- ${c}`).join("\n")}`
      : "";

    const systemPrompt = `Sei un narratore di viaggi italiano, appassionato e coinvolgente, che scrive per LocalVia — una piattaforma che aiuta i viaggiatori a vivere le città come un locale.

Il tuo stile è STORYTELLING emozionale: non elenchi freddi di informazioni, ma racconti brevi e vividi che fanno immaginare al lettore cosa proverà visitando quel posto. Usa i sensi: cosa vedrà, sentirà, assaporerà. Trasmetti l'energia del luogo.

Regole:
- Scrivi in italiano
- Massimo 400 caratteri (circa 3-4 frasi brevi)
- NON usare titoli, emoji, elenchi puntati o markdown
- NON iniziare con il nome del posto
- Parla direttamente al lettore usando il "tu"
- Mescola informazioni pratiche con emozione
- Se è un segreto locale, fai sentire il lettore privilegiato
- Se è una trappola turisti, sii onesto ma elegante
- Il tono deve essere quello di un amico locale che ti svela i suoi posti preferiti`;

    const userPrompt = `Genera una descrizione storytelling per "${placeName}", un/una ${typeLabel} a ${cityName}${cityRegion ? `, ${cityRegion}` : ""}, Italia.${contextBlock}

Scrivi un breve racconto che faccia venire voglia di andarci. Usa il tool "generate_description".`;

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
              name: "generate_description",
              description: "Genera una descrizione storytelling per un luogo",
              parameters: {
                type: "object",
                properties: {
                  description: {
                    type: "string",
                    maxLength: 400,
                    description: "Descrizione storytelling del luogo, massimo 400 caratteri, senza emoji né markdown",
                  },
                },
                required: ["description"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_description" } },
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
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function?.name !== "generate_description") {
      console.error("Unexpected response format:", data);
      throw new Error("Formato risposta AI non valido");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ description: result.description }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-place-description:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Errore sconosciuto" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
