import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, ChevronUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSelectedProducts } from '@/contexts/SelectedProductsContext';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';

interface SelectedProductsIndicatorProps {
  onContinue?: () => void;
}

export function SelectedProductsIndicator({ onContinue }: SelectedProductsIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    selectedProducts, 
    removeProduct, 
    getTotalPrice, 
    getProductsByDay,
  } = useSelectedProducts();

  const totalCount = selectedProducts.length;
  const totalPrice = getTotalPrice();
  const formattedTotal = `€${(totalPrice / 100).toFixed(0)}`;

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
                  {totalCount} {totalCount === 1 ? 'esperienza selezionata' : 'esperienze selezionate'}
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
                    
                    <button
                      onClick={() => removeProduct(item.product.id, item.dayIndex)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      aria-label="Rimuovi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Fixed footer */}
          <div className="border-t border-border p-4 bg-background">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Totale stimato</span>
              <span className="text-xl font-bold text-foreground">{formattedTotal}</span>
            </div>
            
            <Button 
              onClick={() => {
                setIsOpen(false);
                onContinue?.();
              }}
              className="w-full"
              size="lg"
            >
              <ChevronUp className="w-4 h-4 mr-2" />
              Continua con la pianificazione
            </Button>
            
            <p className="text-xs text-muted-foreground text-center mt-3">
              Il pagamento avverrà solo alla conferma del viaggio
            </p>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
