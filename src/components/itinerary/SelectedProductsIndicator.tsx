import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSelectedProducts } from '@/contexts/SelectedProductsContext';
import { useTripPlan } from '@/contexts/TripPlanContext';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';

export function SelectedProductsIndicator() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    selectedProducts, 
    removeProduct, 
    getTotalPrice,
  } = useSelectedProducts();
  const { planStatus, openCheckout } = useTripPlan();

  const totalCount = selectedProducts.length;
  const totalPrice = getTotalPrice();
  const formattedTotal = `€${(totalPrice / 100).toFixed(0)}`;
  
  // Check if products are confirmed (paid)
  const isConfirmed = planStatus === 'CONFIRMED_WITH_EXTRAS';

  // Group products by day
  const productsByDay = selectedProducts.reduce((acc, item) => {
    const day = item.dayIndex;
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {} as Record<number, typeof selectedProducts>);

  if (totalCount === 0) return null;

  return (
    <>
      {/* Floating indicator button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-shadow"
      >
        <ShoppingBag className="w-5 h-5" />
        <span className="font-semibold text-sm">Extra del viaggio</span>
        
        {/* Badge */}
        <span className="ml-1 bg-white/20 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {totalCount}
        </span>
      </motion.button>

      {/* Bottom sheet with selected products */}
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader className="relative pb-2 border-b border-border">
            <DrawerClose className="absolute right-4 top-4 p-2 rounded-full hover:bg-secondary transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </DrawerClose>
            
            <div className="flex items-center gap-3 pr-10">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <DrawerTitle className="font-display text-xl font-semibold text-foreground">
                  Extra del tuo viaggio
                </DrawerTitle>
                <p className="text-sm text-muted-foreground">
                  {isConfirmed 
                    ? 'Esperienze confermate e prenotate' 
                    : 'Aggiunti al piano, pronti da confermare'}
                </p>
              </div>
            </div>
          </DrawerHeader>

          {/* Scrollable content */}
          <div className="overflow-y-auto px-4 py-4 space-y-4 max-h-[50vh]">
            {Object.entries(productsByDay).map(([dayIndex, products]) => (
              <div key={dayIndex} className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Giorno {Number(dayIndex) + 1}
                </h4>
                
                {products.map((item) => (
                  <div 
                    key={`${item.product.id}-${item.dayIndex}`}
                    className="flex items-center justify-between gap-3 p-3 bg-secondary/50 rounded-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm text-foreground truncate">
                        {item.product.title}
                      </h5>
                      {item.anchorPlaceName && (
                        <p className="text-xs text-muted-foreground">
                          Con: {item.anchorPlaceName}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="font-semibold text-primary">
                          €{(item.product.price_cents / 100).toFixed(0)}
                        </span>
                        {item.product.duration_minutes && (
                          <span>· {item.product.duration_minutes} min</span>
                        )}
                      </div>
                    </div>
                    
                    {!isConfirmed && (
                      <button
                        onClick={() => removeProduct(item.product.id, item.dayIndex)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        aria-label="Rimuovi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {isConfirmed && (
                      <span className="text-xs text-green-600 font-medium px-2 py-1 bg-green-100 rounded-full">
                        Prenotato
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Fixed footer */}
          <div className="border-t border-border p-4 bg-background">
            {!isConfirmed ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Totale stimato</span>
                    <p className="text-xs text-muted-foreground">
                      {totalCount} {totalCount === 1 ? 'esperienza' : 'esperienze'}
                    </p>
                  </div>
                  <span className="text-xl font-bold text-foreground">{formattedTotal}</span>
                </div>
                
                <Button 
                  onClick={() => {
                    setIsOpen(false);
                    openCheckout();
                  }}
                  className="w-full bg-gradient-hero"
                  size="lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Conferma e procedi al pagamento
                </Button>
                
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Il pagamento avverrà solo alla conferma
                </p>
              </>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-green-600 font-medium">
                  ✓ Tutte le esperienze sono state confermate
                </p>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
