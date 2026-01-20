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
  Users,
  ExternalLink,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductDetailSheet } from './ProductDetailSheet';
import { type GeneratedSlot, type ProductSuggestion } from '@/hooks/useGenerateItinerary';
import { toast } from 'sonner';

interface TimelineSlotRealProps {
  slot: GeneratedSlot;
  dayIndex: number;
  onReplace: () => void;
  onMove: () => void;
  onAddProduct?: (product: ProductSuggestion, placeName?: string) => void;
  userRhythm?: string;
  showSuggestions?: boolean;
}

export function TimelineSlotReal({ 
  slot, 
  dayIndex,
  onReplace, 
  onMove,
  onAddProduct,
  userRhythm,
  showSuggestions = true,
}: TimelineSlotRealProps) {
  const [showProducts, setShowProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSuggestion | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());

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
  const hasProducts = showSuggestions && slot.productSuggestions && slot.productSuggestions.length > 0;
  
  // Filter out already-added products
  const availableProducts = slot.productSuggestions?.filter(p => !addedProducts.has(p.id)) || [];
  const hasAvailableProducts = availableProducts.length > 0;

  const handleOpenProductDetail = (product: ProductSuggestion) => {
    setSelectedProduct(product);
  };

  const handleAddProduct = async () => {
    if (!selectedProduct) return;
    
    setIsAddingProduct(true);
    try {
      // Call parent handler if provided
      onAddProduct?.(selectedProduct, place?.name);
      
      // Mark as added locally
      setAddedProducts(prev => new Set(prev).add(selectedProduct.id));
      
      // Show success toast
      toast.success('Esperienza aggiunta al piano! 🎉');
      
      // Close sheet
      setSelectedProduct(null);
    } catch (error) {
      toast.error('Errore nell\'aggiunta dell\'esperienza');
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleQuickAdd = (product: ProductSuggestion, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddProduct?.(product, place?.name);
    setAddedProducts(prev => new Set(prev).add(product.id));
    toast.success('Esperienza aggiunta al piano! 🎉');
  };

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

            {/* Product Suggestions - Inline for single, expandable for multiple */}
            {hasProducts && (
              <div className="border-t border-border">
                {slot.productSuggestions!.length === 1 ? (
                  // Single product: Always visible inline card
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                      <span className="text-base">✨</span>
                      Rendi questa visita più immersiva
                    </p>
                    <ProductCard 
                      product={slot.productSuggestions![0]} 
                      onCardClick={() => handleOpenProductDetail(slot.productSuggestions![0])}
                      onQuickAdd={(e) => handleQuickAdd(slot.productSuggestions![0], e)}
                      isAdded={addedProducts.has(slot.productSuggestions![0].id)}
                    />
                  </div>
                ) : (
                  // Multiple products: Show first inline + expandable alternatives
                  <>
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                        <span className="text-base">✨</span>
                        Vuoi approfondire questa esperienza?
                      </p>
                      <ProductCard 
                        product={slot.productSuggestions![0]} 
                        onCardClick={() => handleOpenProductDetail(slot.productSuggestions![0])}
                        onQuickAdd={(e) => handleQuickAdd(slot.productSuggestions![0], e)}
                        isAdded={addedProducts.has(slot.productSuggestions![0].id)}
                      />
                    </div>
                    
                    {/* Alternatives toggle */}
                    <button
                      onClick={() => setShowProducts(!showProducts)}
                      className="w-full px-4 py-2 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-secondary/30 transition-colors flex items-center justify-center gap-1 border-t border-border/50"
                    >
                      {showProducts ? (
                        <>
                          <ChevronDown className="w-3 h-3" />
                          Nascondi alternative
                        </>
                      ) : (
                        <>
                          <ChevronRight className="w-3 h-3" />
                          Vedi {slot.productSuggestions!.length - 1} {slot.productSuggestions!.length === 2 ? 'alternativa' : 'alternative'}
                        </>
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
                            {slot.productSuggestions!.slice(1).map((product) => (
                              <ProductCard 
                                key={product.id} 
                                product={product} 
                                variant="minimal"
                                onCardClick={() => handleOpenProductDetail(product)}
                                onQuickAdd={(e) => handleQuickAdd(product, e)}
                                isAdded={addedProducts.has(product.id)}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
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

      {/* Product Detail Bottom Sheet */}
      <ProductDetailSheet
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAdd={handleAddProduct}
        isAdding={isAddingProduct}
        slotContext={{
          placeName: place?.name,
          userRhythm,
        }}
      />
    </motion.div>
  );
}

interface ProductCardProps {
  product: ProductSuggestion;
  variant?: 'default' | 'minimal';
  onCardClick?: () => void;
  onQuickAdd?: (e: React.MouseEvent) => void;
  isAdded?: boolean;
}

function ProductCard({ 
  product, 
  variant = 'default', 
  onCardClick, 
  onQuickAdd,
  isAdded = false,
}: ProductCardProps) {
  if (isAdded) {
    return (
      <div className="p-3 bg-olive/10 rounded-xl border border-olive/30 flex items-center gap-3">
        <Check className="w-5 h-5 text-olive" />
        <span className="text-sm font-medium text-foreground">{product.title}</span>
        <span className="text-xs text-muted-foreground ml-auto">Aggiunto</span>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div 
        onClick={onCardClick}
        className="p-2.5 bg-secondary/50 rounded-lg flex items-center justify-between gap-2 cursor-pointer hover:bg-secondary/70 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <h5 className="font-medium text-sm text-foreground truncate">
            {product.title}
          </h5>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
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
        <Button size="sm" variant="outline" className="shrink-0 h-8 text-xs">
          Aggiungi
        </Button>
      </div>
    );
  }
  
  // Default: Featured inline card - tappable
  return (
    <div 
      onClick={onCardClick}
      className="p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20 cursor-pointer hover:from-primary/10 hover:to-primary/15 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h5 className="font-semibold text-sm text-foreground">
            {product.title}
          </h5>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {product.short_pitch}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="font-bold text-primary text-sm">
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
        <Button 
          size="sm" 
          variant="default" 
          className="shrink-0"
          onClick={onQuickAdd}
        >
          Aggiungi
          <ExternalLink className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </div>
  );
}
