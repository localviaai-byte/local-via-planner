import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ItineraryViewer } from '@/components/itinerary/ItineraryViewer';
import { SelectedProductsProvider } from '@/contexts/SelectedProductsContext';
import { TripPlanProvider } from '@/contexts/TripPlanContext';
import { useGenerateItinerary, type GeneratedItinerary, type GeneratedDay, type GeneratedSlot, type ItineraryPlace } from '@/hooks/useGenerateItinerary';
import { type TripPreferences } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

type PageState = 'loading' | 'ready' | 'regenerating' | 'error';

export default function SavedPlanViewer() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [pageState, setPageState] = useState<PageState>('loading');
  const [generatedData, setGeneratedData] = useState<GeneratedItinerary | null>(null);
  const [preferences, setPreferences] = useState<TripPreferences | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const { generate } = useGenerateItinerary();

  useEffect(() => {
    if (!planId) return;
    loadPlan(planId);
  }, [planId]);

  const loadPlan = async (id: string) => {
    setPageState('loading');
    try {
      // Fetch plan with city
      const { data: plan, error: planError } = await supabase
        .from('trip_plans')
        .select('*, city:cities(*)')
        .eq('id', id)
        .single();

      if (planError || !plan) throw new Error('Piano non trovato');

      const city = (plan as any).city;
      if (!city) throw new Error('Città non trovata');

      // Fetch plan items with places and products
      const { data: items, error: itemsError } = await supabase
        .from('plan_items')
        .select('*, place:places(*), product:products(*)')
        .eq('plan_id', id)
        .order('day_index')
        .order('sort_order');

      if (itemsError) throw itemsError;

      // Reconstruct preferences from saved JSON
      const savedPrefs = (plan.preferences || {}) as Record<string, any>;
      const prefs: TripPreferences = {
        city: savedPrefs.city || city.slug,
        cities: savedPrefs.cities || [city.slug],
        nearbyAreas: savedPrefs.nearbyAreas ?? true,
        maxTravelMinutes: savedPrefs.maxTravelMinutes ?? 90,
        dates: null,
        travelPeriod: savedPrefs.travelPeriod || { type: 'none' },
        numDays: plan.days || 1,
        travelers: savedPrefs.travelers || { adults: 2, children: 0, seniors: 0 },
        travelWith: savedPrefs.travelWith || 'couple',
        interests: savedPrefs.interests || [],
        topInterests: savedPrefs.topInterests || [],
        rhythm: savedPrefs.rhythm ?? 3,
        startTime: savedPrefs.startTime || 'normal',
        lunchStyle: savedPrefs.lunchStyle || 'long',
        foodPrimary: savedPrefs.foodPrimary || [],
        foodSecondary: savedPrefs.foodSecondary || [],
        atmospherePreferences: savedPrefs.atmospherePreferences || [],
        foodBudget: savedPrefs.foodBudget || 'moderate',
        dietaryRestrictions: savedPrefs.dietaryRestrictions || [],
        cuisinePreferences: savedPrefs.cuisinePreferences || [],
        budget: savedPrefs.budget ?? 2,
        activityStyle: savedPrefs.activityStyle || 'highlights',
        guidedTours: savedPrefs.guidedTours || 'unknown',
        walkingTolerance: savedPrefs.walkingTolerance || 'medium',
        accommodation: savedPrefs.accommodation || null,
        transport: savedPrefs.transport || 'walking',
        constraints: savedPrefs.constraints || [],
        wishes: savedPrefs.wishes || '',
        avoid: savedPrefs.avoid || [],
      };

      // Reconstruct GeneratedItinerary from plan_items
      const itemsByDay: Record<number, typeof items> = {};
      (items || []).forEach(item => {
        const day = item.day_index || 1;
        if (!itemsByDay[day]) itemsByDay[day] = [];
        itemsByDay[day].push(item);
      });

      const days: GeneratedDay[] = [];
      const numDays = plan.days || Object.keys(itemsByDay).length || 1;

      for (let d = 1; d <= numDays; d++) {
        const dayItems = itemsByDay[d] || [];
        const slots: GeneratedSlot[] = dayItems
          .filter((item: any) => item.item_type === 'place' && item.place)
          .map((item: any, idx: number) => {
            const place = item.place;
            const itinPlace: ItineraryPlace = {
              id: place.id,
              name: place.name,
              type: place.place_type,
              zone: place.zone,
              address: place.address,
              local_one_liner: place.local_one_liner,
              duration_minutes: place.duration_minutes,
              price_range: place.price_range,
              cuisine_type: place.cuisine_type,
              photo_url: place.photo_url || place.tripadvisor_image_url,
              indoor_outdoor: place.indoor_outdoor,
              crowd_level: place.crowd_level,
              vibe_touristy_to_local: place.vibe_touristy_to_local,
              latitude: place.latitude ? Number(place.latitude) : null,
              longitude: place.longitude ? Number(place.longitude) : null,
            };

            // Determine slot type from slot_type or place_type
            let slotType: 'activity' | 'meal' | 'break' | 'transfer' = 'activity';
            if (item.slot_type === 'meal' || ['restaurant', 'cafe', 'bar', 'street_food', 'bakery', 'gelateria', 'pastry_shop'].includes(place.place_type)) {
              slotType = 'meal';
            } else if (item.slot_type === 'break') {
              slotType = 'break';
            }

            return {
              id: item.id,
              type: slotType,
              startTime: item.start_time ? item.start_time.slice(0, 5) : `${9 + idx}:00`,
              endTime: item.end_time ? item.end_time.slice(0, 5) : `${10 + idx}:00`,
              place: itinPlace,
              reason: place.local_one_liner || `Tappa ${idx + 1}`,
              alternatives: [],
              productSuggestions: [],
            } as GeneratedSlot;
          });

        days.push({
          dayNumber: d,
          date: plan.start_date
            ? new Date(new Date(plan.start_date).getTime() + (d - 1) * 86400000).toISOString().slice(0, 10)
            : `Giorno ${d}`,
          slots,
          summary: `Giorno ${d} del tuo viaggio`,
        });
      }

      const itinerary: GeneratedItinerary = {
        itinerary: days,
        city: {
          id: city.id,
          name: city.name,
          region: city.region,
          latitude: city.latitude ? Number(city.latitude) : null,
          longitude: city.longitude ? Number(city.longitude) : null,
        },
        meta: {
          placesUsed: (items || []).filter((i: any) => i.item_type === 'place').length,
          productsAvailable: (items || []).filter((i: any) => i.item_type === 'product').length,
        },
      };

      setPreferences(prefs);
      setGeneratedData(itinerary);
      setPageState('ready');
    } catch (err: any) {
      console.error('Error loading plan:', err);
      setErrorMsg(err.message || 'Errore nel caricamento');
      setPageState('error');
    }
  };

  const handleRegenerate = async () => {
    if (!preferences) return;
    setPageState('regenerating');
    const result = await generate(preferences);
    if (result) {
      setGeneratedData(result);
      setPageState('ready');
    } else {
      setPageState('ready'); // stay on current data
    }
  };

  const handleRegenerateWith = async (tweaks: Partial<TripPreferences>) => {
    if (!preferences) return;
    const newPrefs = { ...preferences, ...tweaks };
    setPreferences(newPrefs);
    setPageState('regenerating');
    const result = await generate(newPrefs);
    if (result) {
      setGeneratedData(result);
      setPageState('ready');
    } else {
      setPageState('ready');
    }
  };

  if (pageState === 'loading' || pageState === 'regenerating') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 mx-auto mb-6"
        >
          <Sparkles className="w-full h-full text-primary" />
        </motion.div>
        <h2 className="font-display text-xl font-bold text-foreground mb-2">
          {pageState === 'regenerating' ? 'Rigenero il tuo itinerario...' : 'Carico il tuo piano...'}
        </h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Un momento...</span>
        </div>
      </div>
    );
  }

  if (pageState === 'error') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            {errorMsg || 'Piano non trovato'}
          </h2>
          <p className="text-muted-foreground mb-6">
            Non siamo riusciti a caricare questo piano.
          </p>
          <Button onClick={() => navigate('/my-plans')}>
            Torna ai miei piani
          </Button>
        </div>
      </div>
    );
  }

  if (pageState === 'ready' && preferences && generatedData) {
    return (
      <SelectedProductsProvider>
        <TripPlanProvider>
          <ItineraryViewer
            preferences={preferences}
            generatedData={generatedData}
            onBack={() => navigate('/my-plans')}
            onRegenerate={handleRegenerate}
            onRegenerateWith={handleRegenerateWith}
          />
        </TripPlanProvider>
      </SelectedProductsProvider>
    );
  }

  return null;
}
