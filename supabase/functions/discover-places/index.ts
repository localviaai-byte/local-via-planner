import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SuggestedPlace {
  name: string;
  place_type: 'attraction' | 'restaurant' | 'bar' | 'club' | 'experience' | 'view' | 'zone';
  address?: string;
  zone?: string;
  description?: string;
  why_people_go?: string[];
  best_times?: string[];
  confidence: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cityName, cityId, region, country } = await req.json();

    if (!cityName) {
      return new Response(
        JSON.stringify({ success: false, error: 'City name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Lovable AI not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fullLocation = region ? `${cityName}, ${region}, ${country || 'Italia'}` : `${cityName}, ${country || 'Italia'}`;
    
    console.log(`Starting discovery for: ${fullLocation}`);

    // Step 1: Search for places using Firecrawl with more specific queries
    const searchQueries = [
      // Attractions - be specific to the city
      `"${cityName}" cosa vedere attrazioni turistiche monumenti`,
      `"${cityName}" siti archeologici musei da visitare`,
      // Restaurants - local focus
      `"${cityName}" ristoranti tipici dove mangiare locale`,
      `"${cityName}" trattoria osteria cucina tradizionale`,
      // Bars & Aperitivo
      `"${cityName}" bar aperitivo cocktail migliori`,
      `"${cityName}" wine bar enoteca`,
      // Nightlife
      `"${cityName}" discoteca club vita notturna locali`,
      // Views & Experiences
      `"${cityName}" punti panoramici vista belvedere`,
      `"${cityName}" esperienze uniche attività`,
      // Zones/Neighborhoods
      `"${cityName}" quartieri zone centro storico`,
    ];

    const allSearchResults: string[] = [];

    for (const query of searchQueries) {
      try {
        console.log(`Searching: ${query}`);
        const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            limit: 3, // Fewer results per query but more queries
            lang: 'it',
            country: 'IT',
            scrapeOptions: {
              formats: ['markdown'],
              onlyMainContent: true,
            },
          }),
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.data && Array.isArray(searchData.data)) {
            for (const result of searchData.data) {
              if (result.markdown) {
                // Limit content length to avoid token limits
                const truncatedContent = result.markdown.substring(0, 1500);
                allSearchResults.push(`
=== Source: ${result.title || result.url} ===
${truncatedContent}
`);
              }
            }
          }
        }
      } catch (e) {
        console.error(`Search error for "${query}":`, e);
      }
    }

    console.log(`Collected ${allSearchResults.length} search results`);

    if (allSearchResults.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          suggestions: [],
          message: 'Nessun risultato trovato. Prova con un\'altra città.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Use AI to extract structured place suggestions
    const combinedContent = allSearchResults.slice(0, 15).join('\n\n');
    
    const systemPrompt = `Sei un curatore locale esperto di ${cityName}. Il tuo compito è estrarre luoghi SPECIFICI che si trovano FISICAMENTE dentro ${cityName} (${region || ''}, ${country || 'Italia'}).

REGOLE CRITICHE DI FILTRAGGIO:
1. SOLO luoghi che sono DENTRO ${cityName} - NON includere luoghi in città vicine (es: se cerchi Pompei, NON includere Napoli, Ercolano, Sorrento, etc.)
2. Il nome del luogo deve essere un POSTO SPECIFICO, non una categoria generica
3. Ignora catene internazionali (McDonald's, Starbucks, etc.)
4. Se non sei SICURO che il luogo sia a ${cityName}, NON includerlo (confidence = 0)

DIVERSITÀ RICHIESTA - Devi trovare luoghi per OGNI categoria:
- 2-3 "attraction" (musei, siti archeologici, monumenti)
- 2-3 "restaurant" (ristoranti, trattorie, pizzerie)
- 2-3 "bar" (bar, wine bar, cocktail bar)
- 1-2 "club" (discoteche, locali notturni) - se esistono
- 1-2 "experience" (tour, attività, esperienze)
- 1-2 "view" (punti panoramici, belvedere)
- 1-2 "zone" (quartieri, aree pedonali, zone caratteristiche)

Per ogni luogo fornisci:
- name: nome ESATTO del luogo (es: "Ristorante Da Mario", "Scavi di Pompei")
- place_type: DEVE corrispondere al tipo reale del luogo
- address: via/piazza se disponibile (deve essere a ${cityName}!)
- zone: quartiere/zona DENTRO ${cityName}
- description: max 80 caratteri
- why_people_go: 1-3 motivi (es: ["Mangiare bene", "Vista mare"])
- best_times: quando andare (es: ["pranzo", "cena", "aperitivo"])
- confidence: 
  - 0.9-1.0 = sei CERTO che esiste a ${cityName}
  - 0.7-0.9 = molto probabile
  - 0.5-0.7 = possibile ma da verificare
  - sotto 0.5 = NON INCLUDERE

MASSIMO 20 suggerimenti totali, privilegia la qualità sulla quantità.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analizza questi contenuti web ed estrai SOLO luoghi che sono FISICAMENTE dentro ${cityName}:\n\n${combinedContent}` }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'extract_places',
            description: `Extract places located ONLY in ${cityName}`,
            parameters: {
              type: 'object',
              properties: {
                places: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', description: 'Exact name of the place' },
                      place_type: { 
                        type: 'string', 
                        enum: ['attraction', 'restaurant', 'bar', 'club', 'experience', 'view', 'zone'],
                        description: 'Type must match what the place actually is'
                      },
                      address: { type: 'string', description: `Address in ${cityName}` },
                      zone: { type: 'string', description: `Neighborhood/area within ${cityName}` },
                      description: { type: 'string', description: 'Brief description max 80 chars' },
                      why_people_go: { type: 'array', items: { type: 'string' }, description: '1-3 reasons' },
                      best_times: { type: 'array', items: { type: 'string' }, description: 'Best times to visit' },
                      confidence: { type: 'number', description: 'How certain this place is in the target city (0-1)' }
                    },
                    required: ['name', 'place_type', 'confidence']
                  }
                }
              },
              required: ['places']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'extract_places' } }
      }),
    });

    

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Riprova tra qualche minuto.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: 'Errore nell\'elaborazione AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    let suggestions: SuggestedPlace[] = [];
    
    try {
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        const parsed = JSON.parse(toolCall.function.arguments);
        suggestions = parsed.places || [];
      }
    } catch (e) {
      console.error('Error parsing AI response:', e);
    }

    // Filter by confidence and deduplicate
    suggestions = suggestions
      .filter(s => s.confidence >= 0.5)
      .filter((s, i, arr) => arr.findIndex(x => x.name.toLowerCase() === s.name.toLowerCase()) === i)
      .sort((a, b) => b.confidence - a.confidence);

    console.log(`Extracted ${suggestions.length} high-confidence suggestions`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        suggestions,
        sourcesCount: allSearchResults.length,
        cityId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Discovery error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Discovery failed' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
