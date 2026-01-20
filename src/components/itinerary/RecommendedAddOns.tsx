import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductAddOnCard } from './ProductAddOnCard';
import { useRecommendedProducts } from '@/hooks/useProducts';
import { useAddProductToPlan } from '@/hooks/useTripPlans';
import type { Product, PlaceType, TimeBucket, IdealFor } from '@/types/database';

interface RecommendedAddOnsProps {
  planId: string;
  cityId: string;
  dayIndex: number;
  
  // Context for recommendations
  placeTypes?: PlaceType[];
  interestTags?: string[];
  timeBuckets?: TimeBucket[];
  zoneIds?: string[];
  tripDays?: number;
  userPace?: number;
  idealFor?: IdealFor[];
  socialLevel?: number;
  
  // Display options
  maxVisible?: number;
  variant?: 'section' | 'inline';
  title?: string;
}

export function RecommendedAddOns({
  planId,
  cityId,
  dayIndex,
  placeTypes = [],
  interestTags = [],
  timeBuckets = [],
  zoneIds = [],
  tripDays = 1,
  userPace,
  idealFor,
  socialLevel,
  maxVisible = 2,
  variant = 'section',
  title = 'Esperienze consigliate per te',
}: RecommendedAddOnsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  
  const { data: recommendations, isLoading } = useRecommendedProducts({
    cityId,
    placeTypes,
    interestTags,
    timeBuckets,
    zoneIds,
    tripDays,
    userPace,
    idealFor,
    socialLevel,
  });
  
  const addProductMutation = useAddProductToPlan();
  
  const handleAddProduct = async (product: Product) => {
    setAddingProductId(product.id);
    try {
      await addProductMutation.mutateAsync({
        planId,
        productId: product.id,
        dayIndex,
        slotType: product.preferred_time_buckets?.[0] || undefined,
      });
    } finally {
      setAddingProductId(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-20 bg-muted rounded-lg" />
        <div className="h-20 bg-muted rounded-lg" />
      </div>
    );
  }
  
  if (!recommendations?.length) {
    return null;
  }
  
  const visibleRecommendations = isExpanded 
    ? recommendations 
    : recommendations.slice(0, maxVisible);
  
  const hasMore = recommendations.length > maxVisible;
  
  if (variant === 'inline') {
    return (
      <div className="space-y-2">
        {visibleRecommendations.map(({ product, score }) => (
          <ProductAddOnCard
            key={product.id}
            product={product}
            onAdd={() => handleAddProduct(product)}
            isAdding={addingProductId === product.id}
            variant="minimal"
          />
        ))}
        {hasMore && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-xs text-primary hover:underline"
          >
            +{recommendations.length - maxVisible} altre esperienze
          </button>
        )}
      </div>
    );
  }
  
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 mb-6"
    >
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">
            Arricchisci il tuo viaggio con esperienze uniche
          </p>
        </div>
      </div>
      
      {/* Recommendations grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {visibleRecommendations.map(({ product, score, matchedRule }) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              layout
            >
              <ProductAddOnCard
                product={product}
                onAdd={() => handleAddProduct(product)}
                isAdding={addingProductId === product.id}
                variant="card"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Show more/less */}
      {hasMore && (
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Mostra meno
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Vedi altre {recommendations.length - maxVisible} esperienze
              </>
            )}
          </Button>
        </div>
      )}
    </motion.section>
  );
}
