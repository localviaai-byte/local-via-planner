import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  Clock, 
  MapPin,
  Users,
  Check,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSelectedProducts } from '@/contexts/SelectedProductsContext';
import { useTripPlan } from '@/contexts/TripPlanContext';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';

type CheckoutStep = 'summary' | 'details' | 'payment' | 'complete';

export function ExtrasCheckoutSheet() {
  const [step, setStep] = useState<CheckoutStep>('summary');
  const [isProcessing, setIsProcessing] = useState(false);
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  
  const { selectedProducts, getTotalPrice } = useSelectedProducts();
  const { isCheckoutOpen, closeCheckout, completeCheckout } = useTripPlan();

  const totalPrice = getTotalPrice();
  const formattedTotal = `€${(totalPrice / 100).toFixed(0)}`;

  // Group products by day
  const productsByDay = selectedProducts.reduce((acc, item) => {
    const day = item.dayIndex;
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {} as Record<number, typeof selectedProducts>);

  const handleProceedToDetails = () => {
    setStep('details');
  };

  const handleProceedToPayment = () => {
    if (!participantName || !participantEmail) return;
    setStep('payment');
  };

  const handleCompletePayment = async () => {
    setIsProcessing(true);
    const success = await completeCheckout();
    if (success) {
      setStep('complete');
    }
    setIsProcessing(false);
  };

  const handleClose = () => {
    setStep('summary');
    closeCheckout();
  };

  const renderContent = () => {
    switch (step) {
      case 'summary':
        return (
          <>
            <DrawerHeader className="relative pb-4 border-b border-border">
              <DrawerClose 
                onClick={handleClose}
                className="absolute right-4 top-4 p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </DrawerClose>
              
              <DrawerTitle className="font-display text-xl font-semibold text-foreground pr-10">
                Conferma esperienze
              </DrawerTitle>
              <p className="text-sm text-muted-foreground">
                Riepilogo delle esperienze selezionate
              </p>
            </DrawerHeader>

            {/* Scrollable content */}
            <div className="overflow-y-auto px-4 py-4 space-y-4 max-h-[40vh]">
              {Object.entries(productsByDay).map(([dayIndex, products]) => (
                <div key={dayIndex} className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Giorno {Number(dayIndex) + 1}
                  </h4>
                  
                  {products.map((item) => (
                    <div 
                      key={`${item.product.id}-${item.dayIndex}`}
                      className="p-3 bg-secondary/50 rounded-xl"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm text-foreground">
                            {item.product.title}
                          </h5>
                          {item.anchorPlaceName && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Con: {item.anchorPlaceName}
                            </p>
                          )}
                        </div>
                        <span className="font-semibold text-sm text-primary">
                          €{(item.product.price_cents / 100).toFixed(0)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {item.product.duration_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.product.duration_minutes} min
                          </span>
                        )}
                        {item.product.meeting_point && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {item.product.meeting_point}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Policy note */}
            <div className="px-4 py-3 bg-muted/50">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>
                  Cancellazione gratuita fino a 24 ore prima dell'esperienza.
                  Pagamento sicuro con crittografia SSL.
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border p-4 bg-background">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm text-muted-foreground">Totale</span>
                  <p className="text-xs text-muted-foreground">
                    {selectedProducts.length} {selectedProducts.length === 1 ? 'esperienza' : 'esperienze'}
                  </p>
                </div>
                <span className="text-2xl font-bold text-foreground">{formattedTotal}</span>
              </div>
              
              <Button 
                onClick={handleProceedToDetails}
                className="w-full bg-gradient-hero"
                size="lg"
              >
                Continua
              </Button>
            </div>
          </>
        );

      case 'details':
        return (
          <>
            <DrawerHeader className="relative pb-4 border-b border-border">
              <button 
                onClick={() => setStep('summary')}
                className="absolute left-4 top-4 p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <DrawerClose 
                onClick={handleClose}
                className="absolute right-4 top-4 p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </DrawerClose>
              
              <DrawerTitle className="font-display text-xl font-semibold text-foreground text-center">
                Dati partecipanti
              </DrawerTitle>
            </DrawerHeader>

            <div className="px-4 py-6 space-y-4">
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Users className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Partecipante principale
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome e cognome</Label>
                  <Input
                    id="name"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    placeholder="Mario Rossi"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={participantEmail}
                    onChange={(e) => setParticipantEmail(e.target.value)}
                    placeholder="mario@esempio.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Riceverai qui la conferma e i voucher
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border p-4 bg-background">
              <Button 
                onClick={handleProceedToPayment}
                disabled={!participantName || !participantEmail}
                className="w-full bg-gradient-hero"
                size="lg"
              >
                Procedi al pagamento
              </Button>
            </div>
          </>
        );

      case 'payment':
        return (
          <>
            <DrawerHeader className="relative pb-4 border-b border-border">
              <button 
                onClick={() => setStep('details')}
                className="absolute left-4 top-4 p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <DrawerClose 
                onClick={handleClose}
                className="absolute right-4 top-4 p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </DrawerClose>
              
              <DrawerTitle className="font-display text-xl font-semibold text-foreground text-center">
                Pagamento
              </DrawerTitle>
            </DrawerHeader>

            <div className="px-4 py-6 space-y-6">
              {/* Payment method placeholder */}
              <div className="p-4 border border-border rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Carta di credito</span>
                </div>
                
                <div className="space-y-3">
                  <Input placeholder="Numero carta" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="MM/AA" />
                    <Input placeholder="CVV" />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Totale da pagare</span>
                  <span className="text-xl font-bold text-foreground">{formattedTotal}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border p-4 bg-background">
              <Button 
                onClick={handleCompletePayment}
                disabled={isProcessing}
                className="w-full bg-gradient-hero"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Elaborazione...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Paga {formattedTotal}
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center mt-3">
                Pagamento sicuro con crittografia SSL
              </p>
            </div>
          </>
        );

      case 'complete':
        return (
          <div className="p-8 text-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center"
            >
              <Check className="w-10 h-10 text-green-600" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Pagamento completato! 🎉
              </h2>
              <p className="text-muted-foreground mb-6">
                Le tue esperienze sono state confermate.
                <br />
                Controlla la tua email per i voucher.
              </p>
              
              <Button onClick={handleClose} className="w-full" size="lg">
                Torna al piano
              </Button>
            </motion.div>
          </div>
        );
    }
  };

  return (
    <Drawer open={isCheckoutOpen} onOpenChange={(open) => !open && handleClose()}>
      <DrawerContent className="max-h-[85vh]">
        {renderContent()}
      </DrawerContent>
    </Drawer>
  );
}
