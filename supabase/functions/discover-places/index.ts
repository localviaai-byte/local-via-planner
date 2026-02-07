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
  // TripAdvisor enrichment fields
  tripadvisor_id?: string;
  tripadvisor_ranking?: number;
  tripadvisor_ranking_category?: string;
  tripadvisor_rating?: number;
  tripadvisor_reviews_count?: number;
  tripadvisor_price_level?: string;
  tripadvisor_url?: string;
  tripadvisor_image_url?: string;
}

interface DiscoveryOptions {
  placeType?: string;
  focusZone?: string;
  searchRadius?: string;
  intensity?: string;
  maxQueries?: number;
}

// Generate search queries based on filters
function generateSearchQueries(
  cityName: string, 
  region: string | undefined, 
  options: DiscoveryOptions
): string[] {
  const focusArea = options.focusZone || '';
  const placeType = options.placeType;
  const intensity = options.intensity || 'normal';
  const maxQueries = options.maxQueries || 15;
  
  const regionPart = region ? `"${region}"` : '';
  const zonePart = focusArea ? `"${focusArea}"` : '';
  
  // Build location string
  const locationBase = zonePart 
    ? `"${cityName}" ${zonePart}` 
    : `"${cityName}" ${regionPart}`;

  const allQueries: string[] = [];

  // ========================
  // ATTRACTIONS QUERIES
  // ========================
  if (!placeType || placeType === 'attraction') {
    allQueries.push(
      `${locationBase} cosa vedere attrazioni turistiche`,
      `${locationBase} siti archeologici musei monumenti storici`,
      `${locationBase} chiese basiliche luoghi sacri visitare`,
      `${locationBase} parchi giardini ville storiche`,
      `${locationBase} best attractions things to do`,
      `${locationBase} must see landmarks tourist guide`,
      `${locationBase} luoghi segreti nascosti da scoprire`,
      `${locationBase} patrimonio UNESCO monumenti`,
    );
    if (intensity === 'deep' || intensity === 'exhaustive') {
      allQueries.push(
        `${locationBase} attrazioni meno conosciute locali`,
        `${locationBase} hidden gems off the beaten path`,
        `${locationBase} luoghi instagrammabili foto spot`,
        `${locationBase} castelli palazzi storici tour`,
      );
    }
  }

  // ========================
  // RESTAURANTS QUERIES
  // ========================
  if (!placeType || placeType === 'restaurant') {
    allQueries.push(
      `${locationBase} ristoranti tipici cucina locale tradizionale`,
      `${locationBase} trattoria osteria dove mangiare bene`,
      `${locationBase} pizzeria migliore pizza`,
      `${locationBase} ristorante pesce mare frutti di mare`,
      `${locationBase} best restaurants local food TripAdvisor`,
      `${locationBase} ristoranti romantici cena speciale`,
    );
    if (intensity === 'deep' || intensity === 'exhaustive') {
      allQueries.push(
        `${locationBase} street food cibo di strada specialità`,
        `${locationBase} ristoranti economici buoni pranzo`,
        `${locationBase} ristorante stellato gourmet fine dining`,
        `${locationBase} trattoria autentica locals only`,
        `${locationBase} dove mangiano i locali ristoranti nascosti`,
      );
    }
    if (intensity === 'exhaustive') {
      allQueries.push(
        `${locationBase} migliori ristoranti 2024 2025 nuovi`,
        `${locationBase} brunch colazione migliore`,
        `${locationBase} ristoranti vegetariani vegani`,
      );
    }
  }

  // ========================
  // BARS & CAFES QUERIES
  // ========================
  if (!placeType || placeType === 'bar') {
    allQueries.push(
      `${locationBase} bar aperitivo migliori cocktail`,
      `${locationBase} wine bar enoteca vino locale`,
      `${locationBase} caffè storico pasticceria dolci`,
      `${locationBase} rooftop bar terrazza drink`,
      `${locationBase} cocktail bar speakeasy`,
    );
    if (intensity === 'deep' || intensity === 'exhaustive') {
      allQueries.push(
        `${locationBase} aperitivo dove andare locals`,
        `${locationBase} bar con musica live serata`,
        `${locationBase} pub birreria craft beer`,
        `${locationBase} lounge bar elegante`,
      );
    }
    if (intensity === 'exhaustive') {
      allQueries.push(
        `${locationBase} bar notturni dopo cena`,
        `${locationBase} caffetteria specialty coffee`,
      );
    }
  }

  // ========================
  // NIGHTLIFE QUERIES
  // ========================
  if (!placeType || placeType === 'club') {
    allQueries.push(
      `${locationBase} discoteca club vita notturna locali serali`,
      `${locationBase} live music pub birreria serata`,
      `${locationBase} nightlife clubs bars dancing`,
    );
    if (intensity === 'deep' || intensity === 'exhaustive') {
      allQueries.push(
        `${locationBase} locali notturni dove ballare`,
        `${locationBase} discoteche migliori weekend`,
        `${locationBase} jazz club musica dal vivo`,
      );
    }
  }

  // ========================
  // VIEWS & EXPERIENCES QUERIES
  // ========================
  if (!placeType || placeType === 'view') {
    allQueries.push(
      `${locationBase} punti panoramici vista belvedere tramonto`,
      `${locationBase} best viewpoints scenic spots photography`,
      `${locationBase} terrazze panoramiche vista città`,
    );
    if (intensity === 'deep' || intensity === 'exhaustive') {
      allQueries.push(
        `${locationBase} sunset spots migliori tramonti`,
        `${locationBase} foto panoramiche dove scattare`,
      );
    }
  }

  if (!placeType || placeType === 'experience') {
    allQueries.push(
      `${locationBase} esperienze uniche attività tour guidati`,
      `${locationBase} escursioni trekking natura dintorni`,
      `${locationBase} cooking class corso cucina esperienza`,
    );
    if (intensity === 'deep' || intensity === 'exhaustive') {
      allQueries.push(
        `${locationBase} tour enogastronomici degustazioni`,
        `${locationBase} attività all'aperto avventura`,
        `${locationBase} workshop laboratori artigianali`,
      );
    }
  }

  // ========================
  // ZONES/NEIGHBORHOODS QUERIES
  // ========================
  if (!placeType || placeType === 'zone') {
    allQueries.push(
      `${locationBase} quartieri zone centro storico passeggiare`,
      `${locationBase} vie dello shopping mercati locali`,
      `${locationBase} neighborhoods districts local areas guide`,
    );
    if (intensity === 'deep' || intensity === 'exhaustive') {
      allQueries.push(
        `${locationBase} zone caratteristiche atmosfera`,
        `${locationBase} quartieri emergenti nuovi`,
        `${locationBase} aree pedonali passeggio`,
      );
    }
  }

  // Shuffle and limit
  const shuffled = allQueries.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, maxQueries);
}

// Background processing function
async function processDiscovery(
  supabase: ReturnType<typeof createClient>,
  jobId: string,
  cityName: string,
  cityId: string,
  region: string | undefined,
  country: string | undefined,
  options: DiscoveryOptions
) {
  const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  try {
    const fullLocation = options.focusZone 
      ? `${options.focusZone}, ${cityName}` 
      : region 
        ? `${cityName}, ${region}, ${country || 'Italia'}` 
        : `${cityName}, ${country || 'Italia'}`;
    
    console.log(`[Job ${jobId}] Starting discovery for: ${fullLocation}`);

    // Generate queries based on filters
    const searchQueries = generateSearchQueries(cityName, region, options);
    console.log(`[Job ${jobId}] Generated ${searchQueries.length} search queries`);

    const allSearchResults: string[] = [];
    const resultsPerQuery = options.intensity === 'exhaustive' ? 8 : 
                            options.intensity === 'deep' ? 6 : 5;

    // Process queries in batches of 5 for better performance
    const batchSize = 5;
    for (let i = 0; i < searchQueries.length; i += batchSize) {
      const batch = searchQueries.slice(i, i + batchSize);
      const progress = Math.round(((i + batch.length) / searchQueries.length) * 50);
      
      // Update progress
      await supabase
        .from('discovery_jobs')
        .update({ progress, updated_at: new Date().toISOString() })
        .eq('id', jobId);

      // Process batch in parallel
      const batchPromises = batch.map(async (query) => {
        try {
          console.log(`[Job ${jobId}] Searching: ${query}`);
          const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${firecrawlApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query,
              limit: resultsPerQuery,
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
              return searchData.data
                .filter((result: any) => result.markdown)
                .map((result: any) => `=== Source: ${result.title || result.url} ===\n${result.markdown.substring(0, 2000)}`);
            }
          } else {
            console.error(`[Job ${jobId}] Search failed for query: ${query}`);
          }
        } catch (e) {
          console.error(`[Job ${jobId}] Search error for "${query}":`, e);
        }
        return [];
      });

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(results => allSearchResults.push(...results));
    }

    console.log(`[Job ${jobId}] Collected ${allSearchResults.length} search results`);

    if (allSearchResults.length === 0) {
      await supabase
        .from('discovery_jobs')
        .update({ 
          status: 'completed', 
          progress: 100,
          result: { suggestions: [], message: 'Nessun risultato trovato' },
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);
      return;
    }

    // Update progress before AI processing
    await supabase
      .from('discovery_jobs')
      .update({ progress: 60, updated_at: new Date().toISOString() })
      .eq('id', jobId);

    // Process with AI
    const maxResults = options.intensity === 'exhaustive' ? 40 : 
                       options.intensity === 'deep' ? 30 : 25;
    const combinedContent = allSearchResults.slice(0, maxResults).join('\n\n');
    
    const placeTypeFilter = options.placeType 
      ? `IMPORTANTE: Cerca SOLO luoghi di tipo "${options.placeType}".` 
      : '';
    
    const zoneFilter = options.focusZone
      ? `IMPORTANTE: Concentrati SOLO su luoghi nella zona "${options.focusZone}" di ${cityName}.`
      : '';

    const maxSuggestions = options.intensity === 'exhaustive' ? 35 : 
                           options.intensity === 'deep' ? 25 : 20;
    
    const systemPrompt = `Sei un curatore locale esperto di ${cityName}. Il tuo compito è estrarre luoghi SPECIFICI che si trovano FISICAMENTE dentro ${cityName} (${region || ''}, ${country || 'Italia'}).

${placeTypeFilter}
${zoneFilter}

REGOLE CRITICHE DI FILTRAGGIO:
1. SOLO luoghi che sono DENTRO ${cityName} - NON includere luoghi in città vicine
2. Il nome del luogo deve essere un POSTO SPECIFICO, non una categoria generica
3. Ignora catene internazionali (McDonald's, Starbucks, etc.)
4. Se non sei SICURO che il luogo sia a ${cityName}, NON includerlo (confidence = 0)
5. NON duplicare luoghi con nomi simili

DIVERSITÀ RICHIESTA (se non filtrato per tipo):
- "attraction" (musei, siti archeologici, monumenti)
- "restaurant" (ristoranti, trattorie, pizzerie)
- "bar" (bar, wine bar, cocktail bar, caffè)
- "club" (discoteche, locali notturni)
- "experience" (tour, attività, esperienze)
- "view" (punti panoramici, belvedere)
- "zone" (quartieri, aree pedonali, zone caratteristiche)

Per ogni luogo fornisci:
- name: nome ESATTO del luogo (es: "Ristorante Da Mario", "Scavi di Pompei")
- place_type: DEVE corrispondere al tipo reale del luogo
- address: via/piazza se disponibile (deve essere a ${cityName}!)
- zone: quartiere/zona DENTRO ${cityName}${options.focusZone ? ` (preferibilmente "${options.focusZone}")` : ''}
- description: max 80 caratteri
- why_people_go: 1-3 motivi (es: ["Mangiare bene", "Vista mare"])
- best_times: quando andare (es: ["pranzo", "cena", "aperitivo"])
- confidence: 
  - 0.9-1.0 = sei CERTO che esiste a ${cityName}
  - 0.7-0.9 = molto probabile
  - 0.5-0.7 = possibile ma da verificare
  - sotto 0.5 = NON INCLUDERE

MASSIMO ${maxSuggestions} suggerimenti totali, privilegia la qualità sulla quantità.`;

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
          { role: 'user', content: `Analizza questi contenuti web ed estrai SOLO luoghi che sono FISICAMENTE dentro ${cityName}${options.focusZone ? ` (zona: ${options.focusZone})` : ''}:\n\n${combinedContent}` }
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

    // Update progress
    await supabase
      .from('discovery_jobs')
      .update({ progress: 90, updated_at: new Date().toISOString() })
      .eq('id', jobId);

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`[Job ${jobId}] AI error:`, aiResponse.status, errorText);
      
      await supabase
        .from('discovery_jobs')
        .update({ 
          status: 'failed', 
          error: aiResponse.status === 429 ? 'Rate limit exceeded' : 'Errore nell\'elaborazione AI',
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);
      return;
    }

    const aiData = await aiResponse.json();
    console.log(`[Job ${jobId}] AI response received`);

    let suggestions: SuggestedPlace[] = [];
    
    try {
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        const parsed = JSON.parse(toolCall.function.arguments);
        suggestions = parsed.places || [];
      }
    } catch (e) {
      console.error(`[Job ${jobId}] Error parsing AI response:`, e);
    }

    // Filter by confidence and deduplicate
    suggestions = suggestions
      .filter(s => s.confidence >= 0.5)
      .filter((s, i, arr) => arr.findIndex(x => x.name.toLowerCase() === s.name.toLowerCase()) === i)
      .sort((a, b) => b.confidence - a.confidence);

    console.log(`[Job ${jobId}] Extracted ${suggestions.length} high-confidence suggestions`);

    // CRITICAL: Save suggestions and mark job as completed BEFORE TripAdvisor enrichment
    // This prevents the job from getting stuck if the worker shuts down during enrichment
    
    // First, save all suggestions to the database
    if (suggestions.length > 0) {
      // Check for existing suggestions to avoid duplicates
      const { data: existingPlaces } = await supabase
        .from('places')
        .select('name')
        .eq('city_id', cityId);
      
      const { data: existingSuggestions } = await supabase
        .from('place_suggestions')
        .select('name')
        .eq('city_id', cityId);
      
      const existingNames = new Set([
        ...(existingPlaces || []).map(p => p.name.toLowerCase()),
        ...(existingSuggestions || []).map(s => s.name.toLowerCase()),
      ]);
      
      const newSuggestions = suggestions.filter(s => !existingNames.has(s.name.toLowerCase()));
      
      if (newSuggestions.length > 0) {
        const { error: insertError } = await supabase
          .from('place_suggestions')
          .insert(newSuggestions.map(s => ({
            city_id: cityId,
            name: s.name,
            place_type: s.place_type,
            address: s.address || null,
            zone: s.zone || null,
            description: s.description || null,
            why_people_go: s.why_people_go || [],
            best_times: s.best_times || [],
            confidence: s.confidence,
            status: 'pending',
          })));
        
        if (insertError) {
          console.error(`[Job ${jobId}] Error saving suggestions:`, insertError);
        } else {
          console.log(`[Job ${jobId}] Saved ${newSuggestions.length} new suggestions to database`);
        }
      }
    }

    // Mark job as completed IMMEDIATELY - don't wait for TripAdvisor enrichment
    await supabase
      .from('discovery_jobs')
      .update({ 
        status: 'completed', 
        progress: 100,
        result: { 
          suggestions,
          sourcesCount: allSearchResults.length,
          cityId,
          newCount: suggestions.length
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    console.log(`[Job ${jobId}] Discovery completed successfully with ${suggestions.length} suggestions`);
    
    // TripAdvisor enrichment happens AFTER job is marked complete (best effort, non-blocking)
    // This way if the worker shuts down, the job is still complete
    const apifyApiKey = Deno.env.get('APIFY_API_KEY');
    if (apifyApiKey && suggestions.length > 0) {
      console.log(`[Job ${jobId}] Starting background TripAdvisor enrichment for top places`);
      
      // Take top 5 suggestions for TripAdvisor enrichment (reduced from 10 to avoid timeouts)
      const placesToEnrich = suggestions.slice(0, 5).filter(s => s.place_type !== 'zone');
      
      for (const place of placesToEnrich) {
        try {
          const searchQuery = `${place.name} ${cityName}`;
          const actorUrl = 'https://api.apify.com/v2/acts/maxcopell~tripadvisor/run-sync-get-dataset-items';
          
          const response = await fetch(`${actorUrl}?token=${apifyApiKey}&timeout=20`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: searchQuery,
              maxItemsPerQuery: 3,
              language: 'it',
              currency: 'EUR',
            }),
          });

          if (response.ok) {
            const results = await response.json();
            if (results && results.length > 0) {
              const match = results[0];
              
              // Update the suggestion in the database with TripAdvisor data
              await supabase
                .from('place_suggestions')
                .update({
                  tripadvisor_id: match.locationId,
                  tripadvisor_ranking: match.rankingPosition,
                  tripadvisor_ranking_category: match.rankingCategory || match.category?.name,
                  tripadvisor_rating: match.rating,
                  tripadvisor_reviews_count: match.numberOfReviews || match.reviewsCount,
                  tripadvisor_price_level: match.priceLevel || match.priceRange,
                  tripadvisor_url: match.webUrl || match.url,
                  tripadvisor_image_url: match.image,
                })
                .eq('city_id', cityId)
                .eq('name', place.name);
              
              console.log(`[Job ${jobId}] Enriched "${place.name}" with TripAdvisor (rating: ${match.rating})`);
            }
          }
          
          // Small delay between API calls
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (e) {
          console.error(`[Job ${jobId}] TripAdvisor enrichment error for "${place.name}":`, e);
          // Continue with other places - don't let one failure stop enrichment
        }
      }
      
      console.log(`[Job ${jobId}] TripAdvisor enrichment completed`);
    } else if (!apifyApiKey) {
      console.log(`[Job ${jobId}] Skipping TripAdvisor enrichment - APIFY_API_KEY not configured`);
    }

  } catch (error) {
    console.error(`[Job ${jobId}] Discovery error:`, error);
    await supabase
      .from('discovery_jobs')
      .update({ 
        status: 'failed', 
        error: error instanceof Error ? error.message : 'Discovery failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cityName, cityId, region, country, options = {} } = await req.json();

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

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const discoveryOptions: DiscoveryOptions = {
      placeType: options.placeType,
      focusZone: options.focusZone,
      searchRadius: options.searchRadius || 'city',
      intensity: options.intensity || 'normal',
      maxQueries: options.maxQueries || 15,
    };

    console.log(`Starting discovery for: ${cityName}`);
    console.log(`Options:`, JSON.stringify(discoveryOptions));

    // Create job record immediately
    const { data: job, error: jobError } = await supabase
      .from('discovery_jobs')
      .insert({ 
        city_id: cityId, 
        status: 'processing', 
        progress: 0,
        options: discoveryOptions
      })
      .select()
      .single();

    if (jobError || !job) {
      console.error('Failed to create job:', jobError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create discovery job' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Created job: ${job.id}`);

    // Start background processing (non-blocking)
    EdgeRuntime.waitUntil(
      processDiscovery(supabase, job.id, cityName, cityId, region, country, discoveryOptions)
    );

    // Return immediately with job ID
    return new Response(
      JSON.stringify({ 
        success: true, 
        jobId: job.id,
        message: 'Discovery started in background'
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
