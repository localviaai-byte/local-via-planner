import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Share2, 
  Download, 
  Calendar,
  Map,
  RotateCcw,
  Sparkles,
  Zap,
  Coffee,
  Footprints,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimelineSlot } from './TimelineSlot';
import { 
  type TripPreferences, 
  type ItineraryDay, 
  type ItinerarySlot,
  places,
  restaurants,
  cities
} from '@/lib/mockData';

interface ItineraryViewerProps {
  preferences: TripPreferences;
  onBack: () => void;
}

// Generate mock itinerary based on preferences
function generateMockItinerary(preferences: TripPreferences): ItineraryDay[] {
  const city = cities.find(c => c.id === preferences.city);
  const cityPlaces = places.filter(p => 
    p.cityId === preferences.city || 
    (preferences.nearbyAreas && ['pompei', 'napoli'].includes(p.cityId))
  );
  const cityRestaurants = restaurants.filter(r => 
    r.cityId === preferences.city ||
    (preferences.nearbyAreas && ['pompei', 'napoli'].includes(r.cityId))
  );

  // Sort places by must-see score and filter by interests
  const scoredPlaces = cityPlaces
    .filter(p => p.tags.some(t => preferences.interests.includes(t)) || p.mustSeeScore >= 8)
    .sort((a, b) => b.mustSeeScore - a.mustSeeScore);

  const days: ItineraryDay[] = [];
  let placeIndex = 0;
  let restaurantIndex = 0;

  for (let d = 1; d <= preferences.numDays; d++) {
    const slots: ItinerarySlot[] = [];
    
    // Morning activity
    const startHour = preferences.startTime === 'early' ? 8 : preferences.startTime === 'normal' ? 9 : 11;
    
    if (scoredPlaces[placeIndex]) {
      const morningPlace = scoredPlaces[placeIndex++];
      slots.push({
        id: `day${d}-morning`,
        type: 'activity',
        startTime: `${startHour.toString().padStart(2, '0')}:30`,
        endTime: `${(startHour + Math.floor(morningPlace.durationMinutes / 60)).toString().padStart(2, '0')}:${(30 + morningPlace.durationMinutes % 60).toString().padStart(2, '0')}`,
        place: morningPlace,
        reason: `Alta priorità per "${morningPlace.tags[0]}" • Ideale al mattino per evitare affollamento`,
        alternatives: scoredPlaces.slice(placeIndex, placeIndex + 2),
        walkingMinutes: 0,
      });
    }

    // Lunch
    const lunchRestaurant = cityRestaurants[restaurantIndex++ % cityRestaurants.length];
    const lunchDuration = preferences.lunchStyle === 'long' ? 90 : 60;
    slots.push({
      id: `day${d}-lunch`,
      type: 'meal',
      startTime: '13:00',
      endTime: preferences.lunchStyle === 'long' ? '14:30' : '14:00',
      restaurant: lunchRestaurant,
      reason: `Cucina ${lunchRestaurant.cuisine[0]} • ${lunchRestaurant.vibe} • ${'€'.repeat(lunchRestaurant.priceRange)}`,
      alternatives: cityRestaurants.slice(restaurantIndex, restaurantIndex + 2),
      walkingMinutes: 10,
    });

    // Afternoon activity
    if (scoredPlaces[placeIndex]) {
      const afternoonPlace = scoredPlaces[placeIndex++];
      slots.push({
        id: `day${d}-afternoon`,
        type: 'activity',
        startTime: preferences.lunchStyle === 'long' ? '15:00' : '14:30',
        endTime: preferences.lunchStyle === 'long' ? '17:00' : '16:30',
        place: afternoonPlace,
        reason: `Perfetto nel pomeriggio • ${afternoonPlace.difficulty === 'easy' ? 'Facile da visitare' : 'Esperienza immersiva'}`,
        alternatives: scoredPlaces.slice(placeIndex, placeIndex + 2),
        walkingMinutes: 15,
      });
    }

    // Break
    slots.push({
      id: `day${d}-break`,
      type: 'break',
      startTime: '17:00',
      endTime: '17:30',
      reason: 'Pausa caffè meritata',
      notes: 'Consigliamo un caffè napoletano in uno dei bar storici della zona',
    });

    // Evening (if rhythm is not too calm)
    if (preferences.rhythm >= 3 && scoredPlaces[placeIndex]) {
      const eveningPlace = scoredPlaces.find(p => 
        p.bestTimeOfDay.includes('evening') && !slots.some(s => s.place?.id === p.id)
      ) || scoredPlaces[placeIndex++];
      
      if (eveningPlace) {
        slots.push({
          id: `day${d}-evening`,
          type: 'activity',
          startTime: '17:45',
          endTime: '19:00',
          place: eveningPlace,
          reason: `Ideale al tramonto • ${eveningPlace.crowdLevel === 'low' ? 'Meno affollato la sera' : 'Atmosfera serale unica'}`,
          alternatives: [],
          walkingMinutes: 10,
        });
      }
    }

    days.push({
      dayNumber: d,
      date: new Date(Date.now() + (d - 1) * 24 * 60 * 60 * 1000).toLocaleDateString('it-IT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
      slots,
      summary: `${slots.filter(s => s.type === 'activity').length} attività, ${slots.filter(s => s.type === 'meal').length} pasto`,
    });
  }

  return days;
}

export function ItineraryViewer({ preferences, onBack }: ItineraryViewerProps) {
  const [itinerary] = useState<ItineraryDay[]>(() => generateMockItinerary(preferences));
  const [activeDay, setActiveDay] = useState(0);
  
  const city = cities.find(c => c.id === preferences.city);

  const quickActions = [
    { icon: RotateCcw, label: 'Rigenera', action: () => {} },
    { icon: Footprints, label: 'Meno camminate', action: () => {} },
    { icon: Coffee, label: 'Più relax', action: () => {} },
    { icon: Sparkles, label: 'Più cultura', action: () => {} },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-hero text-primary-foreground">
        <div className="container max-w-2xl py-4 px-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-2xl font-bold">
              {preferences.numDays} {preferences.numDays === 1 ? 'giorno' : 'giorni'} a {city?.name}
            </h1>
            <p className="text-sm opacity-90 mt-1">
              {preferences.interests.length} interessi • Ritmo {
                preferences.rhythm <= 2 ? 'calmo' : preferences.rhythm <= 3 ? 'moderato' : 'intenso'
              }
            </p>
          </motion.div>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="sticky top-[116px] z-40 bg-background border-b border-border">
        <div className="container max-w-2xl py-3 px-4">
          <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                onClick={action.action}
                className="flex-shrink-0"
              >
                <action.icon className="w-4 h-4 mr-1" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Day Tabs */}
      {itinerary.length > 1 && (
        <div className="sticky top-[168px] z-30 bg-background border-b border-border">
          <div className="container max-w-2xl">
            <div className="flex">
              {itinerary.map((day, index) => (
                <button
                  key={day.dayNumber}
                  onClick={() => setActiveDay(index)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                    activeDay === index 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Giorno {day.dayNumber}
                  {activeDay === index && (
                    <motion.div
                      layoutId="activeDay"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Itinerary Content */}
      <main className="container max-w-2xl py-6 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDay}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Day Header */}
            <div className="mb-6">
              <h2 className="font-display text-xl font-semibold text-foreground capitalize">
                {itinerary[activeDay].date}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {itinerary[activeDay].summary}
              </p>
            </div>

            {/* Timeline */}
            <div className="relative">
              {itinerary[activeDay].slots.map((slot) => (
                <TimelineSlot
                  key={slot.id}
                  slot={slot}
                  onReplace={() => {}}
                  onMove={() => {}}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom CTA */}
      <div className="sticky bottom-0 bg-background border-t border-border">
        <div className="container max-w-2xl py-4 px-4 flex gap-3">
          <Button variant="outline" className="flex-1">
            <Map className="w-4 h-4 mr-2" />
            Mappa
          </Button>
          <Button variant="outline" className="flex-1">
            <Calendar className="w-4 h-4 mr-2" />
            Calendario
          </Button>
          <Button className="flex-1 bg-gradient-hero">
            <Download className="w-4 h-4 mr-2" />
            Salva
          </Button>
        </div>
      </div>
    </div>
  );
}
