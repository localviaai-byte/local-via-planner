import { motion } from 'framer-motion';
import { 
  Clock, 
  MapPin, 
  Footprints, 
  RotateCcw, 
  ArrowUpDown, 
  RefreshCw,
  ChevronRight,
  Ticket,
  Star,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Place, type Restaurant, type ItinerarySlot } from '@/lib/mockData';

interface TimelineSlotProps {
  slot: ItinerarySlot;
  onReplace: () => void;
  onMove: () => void;
}

export function TimelineSlot({ slot, onReplace, onMove }: TimelineSlotProps) {
  const getSlotIcon = () => {
    if (slot.type === 'meal') return '🍽️';
    if (slot.type === 'break') return '☕';
    if (slot.type === 'transfer') return '🚶';
    return slot.place?.type === 'museum' ? '🏛️' 
         : slot.place?.type === 'viewpoint' ? '🌅'
         : slot.place?.type === 'experience' ? '✨'
         : '📍';
  };

  const getSlotColor = () => {
    if (slot.type === 'meal') return 'border-l-gold';
    if (slot.type === 'break') return 'border-l-olive';
    if (slot.type === 'transfer') return 'border-l-muted-foreground';
    return 'border-l-primary';
  };

  const item = slot.place || slot.restaurant;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative pl-6 pb-8 border-l-2 ${getSlotColor()} ml-4`}
    >
      {/* Timeline dot */}
      <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-background border-2 border-current flex items-center justify-center text-sm">
        {getSlotIcon()}
      </div>

      {/* Time badge */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold text-primary">
          {slot.startTime}
        </span>
        <span className="text-xs text-muted-foreground">→</span>
        <span className="text-sm text-muted-foreground">
          {slot.endTime}
        </span>
        {slot.walkingMinutes && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
            <Footprints className="w-3 h-3" />
            {slot.walkingMinutes} min
          </span>
        )}
      </div>

      {/* Slot Card */}
      <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
        {item && (
          <>
            {/* Header */}
            <div className="p-4">
              <h4 className="font-display text-lg font-semibold text-foreground">
                {item.name}
              </h4>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-2">
                {'tags' in item && item.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-secondary text-xs text-muted-foreground rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Meta info */}
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                {slot.place && (
                  <>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {slot.place.durationMinutes} min
                    </span>
                    {slot.place.ticketRequired && (
                      <span className="flex items-center gap-1">
                        <Ticket className="w-3 h-3" />
                        €{slot.place.ticketPrice}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-gold" />
                      {slot.place.mustSeeScore}/10
                    </span>
                  </>
                )}
                {slot.restaurant && (
                  <>
                    <span className="flex items-center gap-1">
                      {'€'.repeat(slot.restaurant.priceRange)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {slot.restaurant.vibe}
                    </span>
                  </>
                )}
              </div>

              {/* Reason */}
              <p className="mt-3 text-sm text-foreground/80 bg-secondary/50 rounded-lg p-3">
                💡 {slot.reason}
              </p>
            </div>

            {/* Actions */}
            <div className="flex border-t border-border divide-x divide-border">
              <button
                onClick={onReplace}
                className="flex-1 py-3 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Sostituisci
              </button>
              <button
                onClick={onMove}
                className="flex-1 py-3 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowUpDown className="w-4 h-4" />
                Sposta
              </button>
            </div>

            {/* Alternatives (collapsed by default) */}
            {slot.alternatives && slot.alternatives.length > 0 && (
              <details className="border-t border-border">
                <summary className="px-4 py-3 text-sm font-medium text-muted-foreground cursor-pointer hover:bg-secondary/50 flex items-center justify-between">
                  <span>Alternative disponibili ({slot.alternatives.length})</span>
                  <ChevronRight className="w-4 h-4" />
                </summary>
                <div className="px-4 pb-4 space-y-2">
                  {slot.alternatives.map((alt, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-secondary/50 rounded-lg flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">{alt.name}</span>
                      <Button size="sm" variant="ghost">
                        Scegli
                      </Button>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </>
        )}

        {/* Break/Transfer simple view */}
        {slot.type === 'break' && !item && (
          <div className="p-4">
            <h4 className="font-medium text-foreground">Pausa caffè</h4>
            <p className="text-sm text-muted-foreground mt-1">{slot.notes}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
