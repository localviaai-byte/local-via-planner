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
  Coffee,
  Footprints,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimelineSlotReal } from './TimelineSlotReal';
import { type TripPreferences } from '@/lib/mockData';
import { type GeneratedItinerary, type GeneratedDay, type GeneratedSlot } from '@/hooks/useGenerateItinerary';

interface ItineraryViewerProps {
  preferences: TripPreferences;
  generatedData: GeneratedItinerary;
  onBack: () => void;
  onRegenerate: () => void;
}

export function ItineraryViewer({ preferences, generatedData, onBack, onRegenerate }: ItineraryViewerProps) {
  const [activeDay, setActiveDay] = useState(0);
  
  const { itinerary, city, meta } = generatedData;

  const quickActions = [
    { icon: RotateCcw, label: 'Rigenera', action: onRegenerate },
    { icon: Footprints, label: 'Meno camminate', action: () => {} },
    { icon: Coffee, label: 'Più relax', action: () => {} },
    { icon: Sparkles, label: 'Più cultura', action: () => {} },
  ];

  // Count total products available
  const totalProducts = itinerary.reduce((acc, day) => 
    acc + day.slots.reduce((slotAcc, slot) => 
      slotAcc + (slot.productSuggestions?.length || 0), 0
    ), 0
  );

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
              {preferences.numDays} {preferences.numDays === 1 ? 'giorno' : 'giorni'} a {city.name}
            </h1>
            <p className="text-sm opacity-90 mt-1">
              {preferences.interests.length} interessi • Ritmo {
                preferences.rhythm <= 2 ? 'calmo' : preferences.rhythm <= 3 ? 'moderato' : 'intenso'
              }
            </p>
            {meta.placesUsed > 0 && (
              <p className="text-xs opacity-75 mt-1 flex items-center gap-2">
                <span>📍 {meta.placesUsed} luoghi dal database</span>
                {totalProducts > 0 && (
                  <span className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {totalProducts} esperienze disponibili
                  </span>
                )}
              </p>
            )}
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
                {itinerary[activeDay]?.date}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {itinerary[activeDay]?.summary}
              </p>
            </div>

            {/* Timeline */}
            <div className="relative">
              {itinerary[activeDay]?.slots.map((slot) => (
                <TimelineSlotReal
                  key={slot.id}
                  slot={slot}
                  dayIndex={activeDay}
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
