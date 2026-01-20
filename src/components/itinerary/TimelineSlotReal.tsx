import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  MapPin, 
  Footprints, 
  RefreshCw,
  ArrowUpDown,
  ChevronRight,
  ChevronDown,
  Euro,
  Users,
  Package,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type GeneratedSlot, type ProductSuggestion } from '@/hooks/useGenerateItinerary';

interface TimelineSlotRealProps {
  slot: GeneratedSlot;
  onReplace: () => void;
  onMove: () => void;
}

export function TimelineSlotReal({ slot, onReplace, onMove }: TimelineSlotRealProps) {
  const [showProducts, setShowProducts] = useState(false);

  const getSlotIcon = () => {
    if (slot.type === 'meal') return '🍽️';
    if (slot.type === 'break') return '☕';
    if (slot.type === 'transfer') return '🚶';
    
    const placeType = slot.place?.type;
    if (placeType === 'attraction') return '🏛️';
    if (placeType === 'restaurant') return '🍽️';
    if (placeType === 'bar') return '🍷';
    if (placeType === 'view') return '🌅';
    if (placeType === 'experience') return '✨';
    if (placeType === 'club') return '🎶';
    if (placeType === 'zone') return '🧭';
    return '📍';
  };

  const getSlotColor = () => {
    if (slot.type === 'meal') return 'border-l-gold';
    if (slot.type === 'break') return 'border-l-olive';
    if (slot.type === 'transfer') return 'border-l-muted-foreground';
    return 'border-l-primary';
  };

  const getPriceLabel = (priceRange: string | null) => {
    switch (priceRange) {
      case 'budget': return '€';
      case 'moderate': return '€€';
      case 'expensive': return '€€€';
      case 'luxury': return '€€€€';
      default: return null;
    }
  };

  const getLocalScore = (score: number | null) => {
    if (!score) return null;
    if (score >= 4) return { label: 'Locals only', color: 'text-green-600' };
    if (score >= 3) return { label: 'Misto', color: 'text-amber-600' };
    return { label: 'Turistico', color: 'text-red-500' };
  };

  const formatPrice = (cents: number) => {
    return `€${(cents / 100).toFixed(0)}`;
  };

  const place = slot.place;
  const hasProducts = slot.productSuggestions && slot.productSuggestions.length > 0;

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
        {slot.walkingMinutes && slot.walkingMinutes > 0 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
            <Footprints className="w-3 h-3" />
            {slot.walkingMinutes} min
          </span>
        )}
      </div>

      {/* Slot Card */}
      <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
        {place && (
          <>
            {/* Image (if available) */}
            {place.photo_url && (
              <div className="h-32 bg-muted overflow-hidden">
                <img 
                  src={place.photo_url} 
                  alt={place.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Header */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-display text-lg font-semibold text-foreground">
                  {place.name}
                </h4>
                {getPriceLabel(place.price_range) && (
                  <span className="text-sm text-muted-foreground font-medium">
                    {getPriceLabel(place.price_range)}
                  </span>
                )}
              </div>
              
              {/* Zone & Address */}
              {(place.zone || place.address) && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3" />
                  <span>{place.zone || place.address}</span>
                </div>
              )}

              {/* One-liner (the DNA!) */}
              {place.local_one_liner && (
                <p className="mt-2 text-sm italic text-foreground/80">
                  "{place.local_one_liner}"
                </p>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                {place.duration_minutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {place.duration_minutes} min
                  </span>
                )}
                {place.cuisine_type && (
                  <span className="flex items-center gap-1">
                    🍽️ {place.cuisine_type}
                  </span>
                )}
                {place.indoor_outdoor && (
                  <span className="flex items-center gap-1">
                    {place.indoor_outdoor === 'indoor' ? '🏠' : place.indoor_outdoor === 'outdoor' ? '☀️' : '🏠/☀️'}
                  </span>
                )}
                {getLocalScore(place.vibe_touristy_to_local) && (
                  <span className={`flex items-center gap-1 ${getLocalScore(place.vibe_touristy_to_local)?.color}`}>
                    <Users className="w-3 h-3" />
                    {getLocalScore(place.vibe_touristy_to_local)?.label}
                  </span>
                )}
              </div>

              {/* Reason */}
              <p className="mt-3 text-sm text-foreground/80 bg-secondary/50 rounded-lg p-3">
                💡 {slot.reason}
              </p>
            </div>

            {/* Product Suggestions */}
            {hasProducts && (
              <div className="border-t border-border">
                <button
                  onClick={() => setShowProducts(!showProducts)}
                  className="w-full px-4 py-3 text-sm font-medium text-primary hover:bg-secondary/50 transition-colors flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    {slot.productSuggestions!.length} esperienza da aggiungere
                  </span>
                  {showProducts ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                
                <AnimatePresence>
                  {showProducts && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-2">
                        {slot.productSuggestions!.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

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
                  <span>Alternative ({slot.alternatives.length})</span>
                  <ChevronRight className="w-4 h-4" />
                </summary>
                <div className="px-4 pb-4 space-y-2">
                  {slot.alternatives.map((alt) => (
                    <div
                      key={alt.id}
                      className="p-3 bg-secondary/50 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <span className="text-sm font-medium">{alt.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {alt.type}
                        </span>
                      </div>
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
        {slot.type === 'break' && !place && (
          <div className="p-4">
            <h4 className="font-medium text-foreground">Pausa</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {slot.notes || slot.reason}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ProductCard({ product }: { product: ProductSuggestion }) {
  return (
    <div className="p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h5 className="font-medium text-sm text-foreground">
            {product.title}
          </h5>
          <p className="text-xs text-muted-foreground mt-1">
            {product.short_pitch}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="font-semibold text-primary">
              €{(product.price_cents / 100).toFixed(0)}
            </span>
            {product.duration_minutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {product.duration_minutes} min
              </span>
            )}
          </div>
        </div>
        <Button size="sm" variant="default" className="shrink-0">
          Aggiungi
          <ExternalLink className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </div>
  );
}
