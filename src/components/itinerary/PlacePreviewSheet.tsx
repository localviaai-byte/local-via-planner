import { 
  Clock, 
  MapPin, 
  Eye,
  Users,
  Star,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import type { ItineraryPlace } from '@/hooks/useGenerateItinerary';

interface PlacePreviewSheetProps {
  place: (ItineraryPlace & { time?: string; slotType?: string }) | null;
  isOpen: boolean;
  onClose: () => void;
  onViewDetail: () => void;
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

const typeEmojis: Record<string, string> = {
  attraction: '🏛️',
  restaurant: '🍽️',
  bar: '🍸',
  club: '🎶',
  experience: '✨',
  view: '👁️',
  zone: '📍',
};

export function PlacePreviewSheet({ place, isOpen, onClose, onViewDetail }: PlacePreviewSheetProps) {
  if (!place) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute bottom-4 left-4 right-4 z-20 bg-background rounded-2xl shadow-xl border overflow-hidden"
        >
          <div className="relative">
            {/* Photo */}
            {place.photo_url && (
              <div className="h-32 w-full overflow-hidden">
                <img
                  src={place.photo_url}
                  alt={place.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-semibold text-foreground leading-tight truncate">
                    {place.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
                    <span>{typeEmojis[place.type] || '📍'}</span>
                    <span>{typeLabels[place.type] || place.type}</span>
                    {place.time && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {place.time}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* One-liner */}
              {place.local_one_liner && (
                <p className="text-sm text-muted-foreground mt-2 italic leading-snug line-clamp-2">
                  "{place.local_one_liner}"
                </p>
              )}

              {/* Quick info chips */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {place.duration_minutes && (
                  <span className="text-xs bg-muted px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {place.duration_minutes} min
                  </span>
                )}
                {place.price_range && (
                  <span className="text-xs bg-muted px-2.5 py-1 rounded-full">
                    {place.price_range}
                  </span>
                )}
                {place.cuisine_type && (
                  <span className="text-xs bg-muted px-2.5 py-1 rounded-full">
                    {place.cuisine_type}
                  </span>
                )}
                {place.indoor_outdoor && (
                  <span className="text-xs bg-muted px-2.5 py-1 rounded-full">
                    {place.indoor_outdoor === 'indoor' ? '🏠 Indoor' : place.indoor_outdoor === 'outdoor' ? '🌳 Outdoor' : '🔄 Misto'}
                  </span>
                )}
                {place.crowd_level && (
                  <span className="text-xs bg-muted px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {place.crowd_level === 'low' ? 'Poco affollato' : place.crowd_level === 'high' ? 'Affollato' : 'Moderato'}
                  </span>
                )}
                {place.vibe_touristy_to_local != null && place.vibe_touristy_to_local >= 7 && (
                  <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Locale
                  </span>
                )}
              </div>

              {/* Address */}
              {place.address && (
                <div className="flex items-start gap-1.5 mt-3 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-1">{place.address}</span>
                </div>
              )}

              {/* CTA */}
              <Button
                onClick={onViewDetail}
                className="w-full mt-4"
                variant="outline"
              >
                <Eye className="w-4 h-4 mr-2" />
                Scopri di più
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
