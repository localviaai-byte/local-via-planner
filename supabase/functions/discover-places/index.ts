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

    // Step 1: Search for places using Firecrawl
    const searchQueries = [
      `migliori attrazioni ${fullLocation}`,
      `ristoranti consigliati ${fullLocation}`,
      `bar aperitivo ${fullLocation}`,
      `vita notturna club ${fullLocation}`,
      `punti panoramici ${fullLocation}`,
      `esperienze uniche ${fullLocation}`,
      `quartieri zone ${fullLocation}`,
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
            limit: 5,
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
                const truncatedContent = result.markdown.substring(0, 2000);
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
    const combinedContent = allSearchResults.slice(0, 10).join('\n\n');
    
    const systemPrompt = `Sei un esperto di viaggi italiano. Analizza i contenuti web forniti ed estrai luoghi specifici per ${fullLocation}.

Per ogni luogo identificato, fornisci:
- name: nome esatto del luogo
- place_type: uno tra "attraction", "restaurant", "bar", "club", "experience", "view", "zone"
- address: indirizzo se disponibile
- zone: quartiere/zona della città
- description: breve descrizione (max 100 caratteri)
- why_people_go: array di 1-3 motivi (es: ["Divertirti", "Mangiare bene"])
- best_times: array di momenti ideali (es: ["aperitivo", "dinner"])
- confidence: 0.0-1.0 quanto sei sicuro che sia un luogo reale e rilevante

Regole:
- Estrai solo luoghi REALI e SPECIFICI (non categorie generiche)
- Ignora catene internazionali ovvie (McDonald's, Starbucks)
- Preferisci luoghi autentici e apprezzati dai locali
- Massimo 15 suggerimenti di qualità
- Il confidence deve essere alto (>0.7) solo se hai informazioni concrete`;

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
          { role: 'user', content: `Analizza questi contenuti web e estrai i luoghi:\n\n${combinedContent}` }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'extract_places',
            description: 'Extract suggested places from web content',
            parameters: {
              type: 'object',
              properties: {
                places: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      place_type: { 
                        type: 'string', 
                        enum: ['attraction', 'restaurant', 'bar', 'club', 'experience', 'view', 'zone'] 
                      },
                      address: { type: 'string' },
                      zone: { type: 'string' },
                      description: { type: 'string' },
                      why_people_go: { type: 'array', items: { type: 'string' } },
                      best_times: { type: 'array', items: { type: 'string' } },
                      confidence: { type: 'number' }
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
