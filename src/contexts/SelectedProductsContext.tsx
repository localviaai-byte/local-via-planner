import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { ProductSuggestion } from '@/hooks/useGenerateItinerary';

interface SelectedProduct {
  product: ProductSuggestion;
  dayIndex: number;
  anchorPlaceId?: string;
  anchorPlaceName?: string;
  addedAt: Date;
}

interface DismissedProduct {
  productId: string;
  dayIndex: number;
  dismissedAt: Date;
}

interface SelectedProductsContextType {
  // Selected products (cart)
  selectedProducts: SelectedProduct[];
  addProduct: (product: ProductSuggestion, dayIndex: number, anchorPlaceId?: string, anchorPlaceName?: string) => void;
  removeProduct: (productId: string, dayIndex: number) => void;
  isProductSelected: (productId: string, dayIndex: number) => boolean;
  getProductsByDay: (dayIndex: number) => SelectedProduct[];
  getTotalPrice: () => number;
  clearProducts: () => void;
  
  // Dismissal tracking (for conversion rules)
  dismissedProducts: DismissedProduct[];
  dismissProduct: (productId: string, dayIndex: number) => void;
  getDismissalCountForDay: (dayIndex: number) => number;
  shouldShowSuggestions: (dayIndex: number) => boolean;
  
  // Limits
  maxPerDay: number;
  maxDismissalsBeforeHide: number;
}

const SelectedProductsContext = createContext<SelectedProductsContextType | null>(null);

interface SelectedProductsProviderProps {
  children: ReactNode;
  maxPerDay?: number;
  maxDismissalsBeforeHide?: number;
}

export function SelectedProductsProvider({ 
  children, 
  maxPerDay = 2,
  maxDismissalsBeforeHide = 2,
}: SelectedProductsProviderProps) {
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [dismissedProducts, setDismissedProducts] = useState<DismissedProduct[]>([]);

  const addProduct = useCallback((
    product: ProductSuggestion, 
    dayIndex: number, 
    anchorPlaceId?: string, 
    anchorPlaceName?: string
  ) => {
    setSelectedProducts(prev => {
      // Check if already selected
      if (prev.some(p => p.product.id === product.id && p.dayIndex === dayIndex)) {
        return prev;
      }
      
      // Check day limit
      const dayCount = prev.filter(p => p.dayIndex === dayIndex).length;
      if (dayCount >= maxPerDay) {
        return prev; // Silently ignore, UI should prevent this
      }
      
      return [...prev, {
        product,
        dayIndex,
        anchorPlaceId,
        anchorPlaceName,
        addedAt: new Date(),
      }];
    });
  }, [maxPerDay]);

  const removeProduct = useCallback((productId: string, dayIndex: number) => {
    setSelectedProducts(prev => 
      prev.filter(p => !(p.product.id === productId && p.dayIndex === dayIndex))
    );
    
    // Track as dismissed when removed
    setDismissedProducts(prev => [...prev, {
      productId,
      dayIndex,
      dismissedAt: new Date(),
    }]);
  }, []);

  const isProductSelected = useCallback((productId: string, dayIndex: number) => {
    return selectedProducts.some(p => p.product.id === productId && p.dayIndex === dayIndex);
  }, [selectedProducts]);

  const getProductsByDay = useCallback((dayIndex: number) => {
    return selectedProducts.filter(p => p.dayIndex === dayIndex);
  }, [selectedProducts]);

  const getTotalPrice = useCallback(() => {
    return selectedProducts.reduce((sum, p) => sum + (p.product.price_cents || 0), 0);
  }, [selectedProducts]);

  const clearProducts = useCallback(() => {
    setSelectedProducts([]);
  }, []);

  const dismissProduct = useCallback((productId: string, dayIndex: number) => {
    setDismissedProducts(prev => [...prev, {
      productId,
      dayIndex,
      dismissedAt: new Date(),
    }]);
  }, []);

  const getDismissalCountForDay = useCallback((dayIndex: number) => {
    return dismissedProducts.filter(d => d.dayIndex === dayIndex).length;
  }, [dismissedProducts]);

  const shouldShowSuggestions = useCallback((dayIndex: number) => {
    const dismissals = getDismissalCountForDay(dayIndex);
    const selected = getProductsByDay(dayIndex).length;
    
    // Hide suggestions if:
    // 1. User dismissed 2+ products for this day
    // 2. User already has max products for this day
    return dismissals < maxDismissalsBeforeHide && selected < maxPerDay;
  }, [getDismissalCountForDay, getProductsByDay, maxDismissalsBeforeHide, maxPerDay]);

  const value: SelectedProductsContextType = {
    selectedProducts,
    addProduct,
    removeProduct,
    isProductSelected,
    getProductsByDay,
    getTotalPrice,
    clearProducts,
    dismissedProducts,
    dismissProduct,
    getDismissalCountForDay,
    shouldShowSuggestions,
    maxPerDay,
    maxDismissalsBeforeHide,
  };

  return (
    <SelectedProductsContext.Provider value={value}>
      {children}
    </SelectedProductsContext.Provider>
  );
}

export function useSelectedProducts() {
  const context = useContext(SelectedProductsContext);
  if (!context) {
    throw new Error('useSelectedProducts must be used within a SelectedProductsProvider');
  }
  return context;
}
