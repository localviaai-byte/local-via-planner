import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import { ProductAddOnCard } from './ProductAddOnCard';
import { useAddProductToPlan } from '@/hooks/useTripPlans';
import type { Product } from '@/types/database';

interface SlotAddOnSuggestionProps {
  planId: string;
  dayIndex: number;
  anchorPlaceId?: string;
  anchorType?: 'before' | 'after' | 'instead';
  recommendations: { product: Product; score: number }[];
}

export function SlotAddOnSuggestion({
  planId,
  dayIndex,
  anchorPlaceId,
  anchorType = 'after',
  recommendations,
}: SlotAddOnSuggestionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  
  const addProductMutation = useAddProductToPlan();
  
  // Only show the best recommendation inline
  const topRecommendation = recommendations[0];
  const hasAlternatives = recommendations.length > 1;
  
  if (!topRecommendation) return null;
  
  const handleAddProduct = async (product: Product) => {
    setAddingProductId(product.id);
    try {
      await addProductMutation.mutateAsync({
        planId,
        productId: product.id,
        dayIndex,
        anchorPlaceId,
        anchorType,
      });
    } finally {
      setAddingProductId(null);
    }
  };
  
  return (
    <div className="mt-2">
      {/* Inline suggestion */}
      <ProductAddOnCard
        product={topRecommendation.product}
        onAdd={() => handleAddProduct(topRecommendation.product)}
        isAdding={addingProductId === topRecommendation.product.id}
        variant="inline"
      />
      
      {/* Alternatives toggle */}
      {hasAlternatives && (
        <div className="mt-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            {recommendations.length - 1} {recommendations.length === 2 ? 'alternativa' : 'alternative'} disponibili
            <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 mt-2 pl-4 border-l-2 border-primary/20">
                  {recommendations.slice(1).map(({ product }) => (
                    <ProductAddOnCard
                      key={product.id}
                      product={product}
                      onAdd={() => handleAddProduct(product)}
                      isAdding={addingProductId === product.id}
                      variant="minimal"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
