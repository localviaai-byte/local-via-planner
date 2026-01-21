import { motion } from 'framer-motion';
import { Check, Map, Sparkles, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerClose,
} from '@/components/ui/drawer';

interface SavePlanSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  hasExtras: boolean;
  extrasCount: number;
  onConfirmExtras: () => void;
  onBackToPlan: () => void;
}

export function SavePlanSheet({
  isOpen,
  onOpenChange,
  hasExtras,
  extrasCount,
  onConfirmExtras,
  onBackToPlan,
}: SavePlanSheetProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[60vh]">
        <div className="p-6">
          {/* Close button */}
          <DrawerClose className="absolute right-4 top-4 p-2 rounded-full hover:bg-secondary transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </DrawerClose>

          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center"
          >
            <Check className="w-8 h-8 text-green-600" />
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-2xl font-bold text-foreground text-center mb-2"
          >
            Il tuo piano è pronto ✓
          </motion.h2>

          {/* Conditional content based on hasExtras */}
          {hasExtras ? (
            // FLOW B - Has extras
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <p className="text-muted-foreground mb-6">
                Hai aggiunto {extrasCount} {extrasCount === 1 ? 'esperienza' : 'esperienze'} al viaggio.
                <br />
                Puoi confermarle ora o farlo più tardi.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={onConfirmExtras}
                  className="w-full bg-gradient-hero"
                  size="lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Conferma esperienze
                </Button>
                
                <Button
                  onClick={onBackToPlan}
                  variant="ghost"
                  className="w-full"
                >
                  Torna al piano
                </Button>
              </div>
            </motion.div>
          ) : (
            // FLOW A - No extras
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <p className="text-muted-foreground mb-6">
                Vuoi fare il prossimo passo?
              </p>

              <div className="space-y-3">
                <Button
                  onClick={onBackToPlan}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Map className="w-4 h-4 mr-2" />
                  Esporta su mappa
                </Button>
                
                <Button
                  onClick={onBackToPlan}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Aggiungi esperienze
                </Button>
                
                <Button
                  onClick={onBackToPlan}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Condividi
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
