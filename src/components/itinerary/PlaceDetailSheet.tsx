import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Star, 
  Users, 
  Utensils, 
  ExternalLink 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import type { ItineraryPlace } from '@/hooks/useGenerateItinerary';

interface PlaceDetailSheetProps {
  place: (ItineraryPlace & { time?: string }) | null;
  isOpen: boolean;
  onClose: () => void;
}

const typeLabels: Record<string, string> = {
  attraction: 'Attrazione',
  restaurant: 'Ristorante',
  bar: 'Bar',
  club: 'Club',
  experience: 'Esperienza',
  view: 'Panorama',
  zone: 'Zona',
};

export function PlaceDetailSheet({ place, isOpen, onClose }: PlaceDetailSheetProps) {
  if (!place) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[90vh] p-0 rounded-t-2xl overflow-y-auto">
        <div className="relative">
          {/* Hero image */}
          {place.photo_url ? (
            <div className="relative h-56 w-full overflow-hidden">
              <img
                src={place.photo_url}
                alt={place.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h2 className="font-display text-2xl font-bold leading-tight">{place.name}</h2>
                <p className="text-sm text-white/80 mt-1">{typeLabels[place.type] || place.type}</p>
              </div>
            </div>
          ) : (
            <SheetHeader className="p-5 pb-3">
              <SheetTitle className="font-display text-xl">{place.name}</SheetTitle>
              <SheetDescription>{typeLabels[place.type] || place.type}</SheetDescription>
            </SheetHeader>
          )}

          <div className="p-5 space-y-5">
            {/* One-liner */}
            {place.local_one_liner && (
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                <p className="text-sm italic text-foreground leading-relaxed">
                  "{place.local_one_liner}"
                </p>
                <p className="text-xs text-muted-foreground mt-2">— Consiglio locale</p>
              </div>
            )}

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              {place.duration_minutes && (
                <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Durata</p>
                    <p className="text-sm font-medium">{place.duration_minutes} min</p>
                  </div>
                </div>
              )}
              {place.price_range && (
                <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center text-lg">
                    💰
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Prezzo</p>
                    <p className="text-sm font-medium">{place.price_range}</p>
                  </div>
                </div>
              )}
              {place.cuisine_type && (
                <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center">
                    <Utensils className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cucina</p>
                    <p className="text-sm font-medium">{place.cuisine_type}</p>
                  </div>
                </div>
              )}
              {place.crowd_level && (
                <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Affollamento</p>
                    <p className="text-sm font-medium">
                      {place.crowd_level === 'low' ? 'Basso' : place.crowd_level === 'high' ? 'Alto' : 'Medio'}
                    </p>
                  </div>
                </div>
              )}
              {place.indoor_outdoor && (
                <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center text-lg">
                    {place.indoor_outdoor === 'indoor' ? '🏠' : place.indoor_outdoor === 'outdoor' ? '🌳' : '🔄'}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ambiente</p>
                    <p className="text-sm font-medium">
                      {place.indoor_outdoor === 'indoor' ? 'Indoor' : place.indoor_outdoor === 'outdoor' ? 'Outdoor' : 'Misto'}
                    </p>
                  </div>
                </div>
              )}
              {place.vibe_touristy_to_local != null && (
                <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center">
                    <Star className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Vibe</p>
                    <p className="text-sm font-medium">
                      {place.vibe_touristy_to_local >= 7 ? 'Molto locale' : place.vibe_touristy_to_local >= 4 ? 'Misto' : 'Turistico'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Address */}
            {place.address && (
              <div className="flex items-start gap-3 p-3 bg-muted rounded-xl">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Indirizzo</p>
                  <p className="text-sm font-medium">{place.address}</p>
                </div>
              </div>
            )}

            {/* Zone */}
            {place.zone && (
              <div className="text-sm text-muted-foreground">
                📍 Zona: <span className="font-medium text-foreground">{place.zone}</span>
              </div>
            )}

            {/* Google Maps link */}
            {place.latitude && place.longitude && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Apri in Google Maps
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
