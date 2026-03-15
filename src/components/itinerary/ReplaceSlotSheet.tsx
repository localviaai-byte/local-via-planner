import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, MapPin, Clock, Users, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import type { GeneratedSlot, ItineraryPlace } from '@/hooks/useGenerateItinerary';

interface ReplaceSlotSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  slot: GeneratedSlot | null;
  cityId: string;
  onReplace: (newPlace: ItineraryPlace) => void;
}

interface AlternativePlace {
  id: string;
  name: string;
  place_type: string;
  zone: string | null;
  address: string | null;
  local_one_liner: string | null;
  duration_minutes: number | null;
  price_range: string | null;
  cuisine_type: string | null;
  food_primary: string[] | null;
  photo_url: string | null;
  indoor_outdoor: string | null;
  vibe_touristy_to_local: number | null;
  latitude: number | null;
  longitude: number | null;
  dietary_options: string[] | null;
}

const foodCategoryLabels: Record<string, { label: string; emoji: string }> = {
  pesce: { label: 'Pesce', emoji: '🐟' },
  carne: { label: 'Carne', emoji: '🥩' },
  pizza: { label: 'Pizza', emoji: '🍕' },
  pasta: { label: 'Pasta', emoji: '🍝' },
  vegetariano: { label: 'Vegetariano', emoji: '🥗' },
  street_food: { label: 'Street Food', emoji: '🌮' },
  dolci: { label: 'Dolci', emoji: '🍰' },
  misto: { label: 'Misto', emoji: '🍽️' },
};

const placeTypeLabels: Record<string, { label: string; emoji: string }> = {
  restaurant: { label: 'Ristorante', emoji: '🍽️' },
  bar: { label: 'Bar', emoji: '🍷' },
  attraction: { label: 'Attrazione', emoji: '🏛️' },
  view: { label: 'Panorama', emoji: '🌅' },
  experience: { label: 'Esperienza', emoji: '✨' },
  club: { label: 'Club', emoji: '🎶' },
  zone: { label: 'Zona', emoji: '🧭' },
};

export function ReplaceSlotSheet({
  isOpen,
  onOpenChange,
  slot,
  cityId,
  onReplace,
}: ReplaceSlotSheetProps) {
  const [alternatives, setAlternatives] = useState<AlternativePlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && slot?.place) {
      fetchAlternatives();
    }
  }, [isOpen, slot]);

  const fetchAlternatives = async () => {
    if (!slot?.place) return;

    setIsLoading(true);
    try {
      const placeType = slot.place.type as 'attraction' | 'bar' | 'restaurant' | 'club' | 'zone' | 'experience' | 'view';

      const { data, error } = await supabase
        .from('places')
        .select(
          'id, name, place_type, zone, address, local_one_liner, duration_minutes, price_range, cuisine_type, food_primary, photo_url, indoor_outdoor, vibe_touristy_to_local, latitude, longitude, dietary_options'
        )
        .eq('city_id', cityId)
        .eq('place_type', placeType)
        .eq('status', 'approved')
        .neq('id', slot.place.id)
        .limit(12);

      if (error) throw error;
      setAlternatives(data || []);
    } catch (err) {
      console.error('Error fetching alternatives:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (alt: AlternativePlace) => {
    const newPlace: ItineraryPlace = {
      id: alt.id,
      name: alt.name,
      type: alt.place_type,
      zone: alt.zone,
      address: alt.address,
      local_one_liner: alt.local_one_liner,
      duration_minutes: alt.duration_minutes,
      price_range: alt.price_range,
      cuisine_type: alt.cuisine_type,
      photo_url: alt.photo_url,
      indoor_outdoor: alt.indoor_outdoor,
      crowd_level: null,
      vibe_touristy_to_local: alt.vibe_touristy_to_local,
      latitude: alt.latitude,
      longitude: alt.longitude,
    };
    onReplace(newPlace);
    onOpenChange(false);
  };

  const isFood = slot?.place?.type === 'restaurant' || slot?.place?.type === 'bar';

  // Get unique food categories for filter chips
  const foodCategories = isFood
    ? [...new Set(alternatives.map((a) => a.food_primary).filter(Boolean))]
    : [];

  const filteredAlternatives = selectedFilter
    ? alternatives.filter((a) => a.food_primary === selectedFilter)
    : alternatives;

  const getPriceLabel = (priceRange: string | null) => {
    switch (priceRange) {
      case 'budget':
        return '€';
      case 'moderate':
        return '€€';
      case 'expensive':
        return '€€€';
      case 'luxury':
        return '€€€€';
      default:
        return null;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] overflow-hidden p-0">
        <div className="p-6 pb-0">
          <SheetHeader className="text-left">
            <SheetTitle className="flex items-center gap-2 font-display">
              <RefreshCw className="w-5 h-5 text-primary" />
              Sostituisci {slot?.place?.name}
            </SheetTitle>
            <SheetDescription>
              {isFood
                ? 'Scegli un\'alternativa per questo pasto'
                : 'Scegli un\'alternativa per questa tappa'}
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Food filter chips */}
        {isFood && foodCategories.length > 0 && (
          <div className="px-6 pt-4">
            <div className="flex gap-2 overflow-x-auto pb-2 -mb-2">
              <button
                onClick={() => setSelectedFilter(null)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !selectedFilter
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                Tutti
              </button>
              {foodCategories.map((cat) => {
                const info = foodCategoryLabels[cat!] || { label: cat, emoji: '🍽️' };
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedFilter(cat === selectedFilter ? null : cat!)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      selectedFilter === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>{info.emoji}</span>
                    {info.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Carousel */}
        <div className="px-6 py-4 overflow-y-auto max-h-[55vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Cerco alternative...</span>
            </div>
          ) : filteredAlternatives.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-1">😕</p>
              <p>Nessuna alternativa trovata</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-2 px-2">
              {filteredAlternatives.map((alt, index) => (
                <motion.div
                  key={alt.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex-shrink-0 w-[280px] snap-center"
                >
                  <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden h-full flex flex-col">
                    {/* Image */}
                    {alt.photo_url ? (
                      <div className="h-36 bg-muted overflow-hidden relative">
                        <img
                          src={alt.photo_url}
                          alt={alt.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Type badge */}
                        <div className="absolute top-2 left-2">
                          <span className="bg-background/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full">
                            {placeTypeLabels[alt.place_type]?.emoji}{' '}
                            {placeTypeLabels[alt.place_type]?.label || alt.place_type}
                          </span>
                        </div>
                        {/* Price badge */}
                        {getPriceLabel(alt.price_range) && (
                          <div className="absolute top-2 right-2">
                            <span className="bg-background/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full">
                              {getPriceLabel(alt.price_range)}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-24 bg-muted flex items-center justify-center text-3xl">
                        {placeTypeLabels[alt.place_type]?.emoji || '📍'}
                      </div>
                    )}

                    {/* Info */}
                    <div className="p-3 flex-1 flex flex-col">
                      <h4 className="font-display font-semibold text-foreground text-sm line-clamp-1">
                        {alt.name}
                      </h4>

                      {alt.zone && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{alt.zone}</span>
                        </div>
                      )}

                      {alt.local_one_liner && (
                        <p className="text-xs italic text-foreground/70 mt-1.5 line-clamp-2">
                          "{alt.local_one_liner}"
                        </p>
                      )}

                      {/* Food info badges */}
                      {isFood && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {alt.food_primary && (
                            <span className="text-xs bg-secondary rounded-full px-2 py-0.5 font-medium">
                              {foodCategoryLabels[alt.food_primary]?.emoji || '🍽️'}{' '}
                              {foodCategoryLabels[alt.food_primary]?.label || alt.food_primary}
                            </span>
                          )}
                          {alt.cuisine_type && (
                            <span className="text-xs bg-secondary rounded-full px-2 py-0.5 text-muted-foreground">
                              {alt.cuisine_type}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-2 mt-auto pt-2 text-xs text-muted-foreground">
                        {alt.duration_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {alt.duration_minutes} min
                          </span>
                        )}
                      </div>

                      {/* CTA */}
                      <Button
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => handleSelect(alt)}
                      >
                        Scegli questo
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
