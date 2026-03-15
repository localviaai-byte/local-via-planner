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
  ArrowLeft,
  Tag,
  BadgePercent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSelectedProducts } from '@/contexts/SelectedProductsContext';
import { useTripPlan } from '@/contexts/TripPlanContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';

type CheckoutStep = 'summary' | 'details' | 'payment' | 'complete';

interface AppliedDiscount {
  partnerId: string;
  partnerName: string;
  referralCode: string;
  discountPercent: number;
}

export function ExtrasCheckoutSheet() {
  const [step, setStep] = useState<CheckoutStep>('summary');
  const [isProcessing, setIsProcessing] = useState(false);
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
  
  const { selectedProducts, getTotalPrice } = useSelectedProducts();
  const { isCheckoutOpen, closeCheckout, completeCheckout } = useTripPlan();

  const totalPrice = getTotalPrice();
  const discountAmount = appliedDiscount 
    ? Math.round(totalPrice * appliedDiscount.discountPercent / 100)
    : 0;
  const finalPrice = totalPrice - discountAmount;
  const formattedTotal = `€${(finalPrice / 100).toFixed(0)}`;
  const formattedOriginal = `€${(totalPrice / 100).toFixed(0)}`;

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const { data: partner, error } = await supabase
        .from('partners')
        .select('id, company_name, referral_code, discount_percent, status, partner_type')
        .eq('referral_code', promoCode.trim().toUpperCase())
        .eq('partner_type', 'referral')
        .eq('status', 'active')
        .maybeSingle();

      if (error || !partner) {
        toast.error('Codice non valido o scaduto');
        return;
      }

      setAppliedDiscount({
        partnerId: partner.id,
        partnerName: partner.company_name,
        referralCode: partner.referral_code!,
        discountPercent: Number(partner.discount_percent) || 5,
      });
      toast.success(`Sconto ${partner.discount_percent}% applicato!`);
    } catch {
      toast.error('Errore nella verifica del codice');
    } finally {
      setPromoLoading(false);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setPromoCode('');
  };

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

    // Track referral conversion if a discount code was used
    if (appliedDiscount) {
      try {
        await supabase.from('referral_conversions').insert({
          partner_id: appliedDiscount.partnerId,
          conversion_type: 'checkout',
          revenue_cents: finalPrice,
          commission_cents: Math.round(finalPrice * (appliedDiscount.discountPercent * 2) / 100), // commission ~2x the discount
          status: 'pending',
        });
      } catch (err) {
        console.error('Error tracking referral conversion:', err);
      }
    }

    const success = await completeCheckout();
    if (success) {
      setStep('complete');
    }
    setIsProcessing(false);
  };

  const handleClose = () => {
    setStep('summary');
    setAppliedDiscount(null);
    setPromoCode('');
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
                        <div className="text-right shrink-0">
                          <span className="font-semibold text-sm text-primary">
                            €{((item.product.price_cents * item.quantity) / 100).toFixed(0)}
                          </span>
                          {item.quantity > 1 && (
                            <p className="text-[10px] text-muted-foreground">
                              {item.quantity} × €{(item.product.price_cents / 100).toFixed(0)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {item.quantity} {item.quantity === 1 ? 'persona' : 'persone'}
                        </span>
                        {item.preferredTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Ore {item.preferredTime}
                          </span>
                        )}
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

              {/* Promo Code Section */}
              <div className="border border-dashed border-border rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  Hai un codice sconto?
                </div>
                {appliedDiscount ? (
                  <div className="flex items-center justify-between bg-primary/10 rounded-lg p-2.5">
                    <div className="flex items-center gap-2">
                      <BadgePercent className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-primary">
                          -{appliedDiscount.discountPercent}% applicato
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          da {appliedDiscount.partnerName}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={removeDiscount} className="h-7 text-xs text-destructive">
                      Rimuovi
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Es. ABC12345"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="font-mono text-sm uppercase"
                      onKeyDown={(e) => e.key === 'Enter' && applyPromoCode()}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={applyPromoCode}
                      disabled={promoLoading || !promoCode.trim()}
                      className="shrink-0"
                    >
                      {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Applica'}
                    </Button>
                  </div>
                )}
              </div>
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
                <div className="text-right">
                  {appliedDiscount ? (
                    <>
                      <span className="text-sm line-through text-muted-foreground mr-2">{formattedOriginal}</span>
                      <span className="text-2xl font-bold text-primary">{formattedTotal}</span>
                      <p className="text-xs text-primary">Risparmi €{(discountAmount / 100).toFixed(0)}</p>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-foreground">{formattedTotal}</span>
                  )}
                </div>
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
              <div className="p-4 bg-muted/50 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotale</span>
                  <span>€{(totalPrice / 100).toFixed(0)}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex items-center justify-between text-sm text-primary">
                    <span className="flex items-center gap-1">
                      <BadgePercent className="w-3.5 h-3.5" />
                      Sconto {appliedDiscount.discountPercent}%
                    </span>
                    <span>-€{(discountAmount / 100).toFixed(0)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="font-medium text-foreground">Totale da pagare</span>
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
