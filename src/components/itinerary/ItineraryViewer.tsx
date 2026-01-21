import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Share2, 
  Download, 
  Calendar,
  Map,
  RotateCcw,
  Sparkles,
  Coffee,
  Footprints,
  Package,
  Check,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimelineSlotReal } from './TimelineSlotReal';
import { SelectedProductsIndicator } from './SelectedProductsIndicator';
import { SavePlanSheet } from './SavePlanSheet';
import { ExtrasCheckoutSheet } from './ExtrasCheckoutSheet';
import { ItineraryMapSheet } from './ItineraryMapSheet';
import { CalendarSheet } from './CalendarSheet';
import { useSelectedProducts } from '@/contexts/SelectedProductsContext';
import { useTripPlan } from '@/contexts/TripPlanContext';
import { type TripPreferences } from '@/lib/mockData';
import { type GeneratedItinerary } from '@/hooks/useGenerateItinerary';

interface ItineraryViewerProps {
  preferences: TripPreferences;
  generatedData: GeneratedItinerary;
  onBack: () => void;
  onRegenerate: () => void;
}

export function ItineraryViewer({ preferences, generatedData, onBack, onRegenerate }: ItineraryViewerProps) {
  const [activeDay, setActiveDay] = useState(0);
  const [showDayTransition, setShowDayTransition] = useState(false);
  const [showSaveSheet, setShowSaveSheet] = useState(false);
  const [showMapSheet, setShowMapSheet] = useState(false);
  const [showCalendarSheet, setShowCalendarSheet] = useState(false);
  const daySectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isScrollingRef = useRef(false);
  
  const { selectedProducts, addProduct } = useSelectedProducts();
  const { 
    planStatus, 
    isSaving, 
    savePlan, 
    setPlanStatus,
    hasShownPostSaveSheet,
    setHasShownPostSaveSheet,
    openCheckout 
  } = useTripPlan();
  
  const { itinerary, city, meta } = generatedData;
  const hasExtras = selectedProducts.length > 0;
  const isSaved = planStatus !== 'DRAFT';

  // Intersection Observer for automatic day switching on scroll
  useEffect(() => {
    if (itinerary.length <= 1) return;
    // While the map sheet is open, don't let scroll observers override the selected day.
    if (showMapSheet) return;

    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0.1,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (isScrollingRef.current) return;
      
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const dayIndex = daySectionRefs.current.findIndex(
            (ref) => ref === entry.target
          );
          if (dayIndex !== -1 && dayIndex !== activeDay) {
            setShowDayTransition(true);
            setActiveDay(dayIndex);
            // Hide transition indicator after animation
            setTimeout(() => setShowDayTransition(false), 1500);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    daySectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [itinerary.length, activeDay, showMapSheet]);

  // Scroll to day when tab is clicked
  const handleDayClick = (index: number) => {
    isScrollingRef.current = true;
    setActiveDay(index);
    
    daySectionRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    // Reset scroll lock after animation
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 800);
  };

  const quickActions = [
    { icon: RotateCcw, label: 'Rigenera', action: onRegenerate },
    { icon: Footprints, label: 'Meno camminate', action: () => {} },
    { icon: Coffee, label: 'Più relax', action: () => {} },
    { icon: Sparkles, label: 'Più cultura', action: () => {} },
  ];

  // Count total products available
  const totalProducts = itinerary.reduce((acc, day) => 
    acc + day.slots.reduce((slotAcc, slot) => 
      slotAcc + (slot.productSuggestions?.length || 0), 0
    ), 0
  );

  // Handle save plan
  const handleSavePlan = async () => {
    const success = await savePlan();
    
    if (success) {
      // Update status based on extras
      if (hasExtras) {
        setPlanStatus('SAVED_WITH_EXTRAS');
      } else {
        setPlanStatus('SAVED');
      }
      
      // Show post-save sheet (only once)
      if (!hasShownPostSaveSheet) {
        setTimeout(() => {
          setShowSaveSheet(true);
          setHasShownPostSaveSheet(true);
        }, 500);
      }
    }
  };

  // Handle confirm extras from sheet
  const handleConfirmExtras = () => {
    setShowSaveSheet(false);
    openCheckout();
  };

  const handleBackToPlan = () => {
    setShowSaveSheet(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Day Transition Indicator */}
      <AnimatePresence>
        {showDayTransition && itinerary.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed top-1/3 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
          >
            <div className="bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
              <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold"
              >
                {activeDay + 1}
              </motion.div>
              <span className="font-display font-semibold text-lg">
                Giorno {activeDay + 1}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-hero text-primary-foreground">
        <div className="container max-w-2xl py-4 px-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-2xl font-bold">
              {preferences.numDays} {preferences.numDays === 1 ? 'giorno' : 'giorni'} a {city.name}
            </h1>
            <p className="text-sm opacity-90 mt-1">
              {preferences.interests.length} interessi • Ritmo {
                preferences.rhythm <= 2 ? 'calmo' : preferences.rhythm <= 3 ? 'moderato' : 'intenso'
              }
            </p>
            {meta.placesUsed > 0 && (
              <p className="text-xs opacity-75 mt-1 flex items-center gap-2">
                <span>📍 {meta.placesUsed} luoghi dal database</span>
                {totalProducts > 0 && (
                  <span className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {totalProducts} esperienze disponibili
                  </span>
                )}
              </p>
            )}
          </motion.div>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="sticky top-[116px] z-40 bg-background border-b border-border">
        <div className="container max-w-2xl py-3 px-4">
          <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                onClick={action.action}
                className="flex-shrink-0"
              >
                <action.icon className="w-4 h-4 mr-1" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Day Tabs */}
      {itinerary.length > 1 && (
        <div className="sticky top-[168px] z-30 bg-background border-b border-border">
          <div className="container max-w-2xl">
            <div className="flex">
              {itinerary.map((day, index) => (
                <button
                  key={day.dayNumber}
                  onClick={() => handleDayClick(index)}
                  className={`flex-1 py-3 text-sm font-medium transition-all relative ${
                    activeDay === index 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <motion.span
                    animate={{
                      scale: activeDay === index && showDayTransition ? [1, 1.1, 1] : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    className="inline-block"
                  >
                    Giorno {day.dayNumber}
                  </motion.span>
                  {activeDay === index && (
                    <motion.div
                      layoutId="activeDay"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Itinerary Content - All days rendered for scroll */}
      <main className="container max-w-2xl py-6 px-4">
        {itinerary.map((day, dayIndex) => (
          <div
            key={day.dayNumber}
            ref={(el) => (daySectionRefs.current[dayIndex] = el)}
            className="scroll-mt-[220px]"
          >
            {/* Day Divider - only for days after the first */}
            {dayIndex > 0 && (
              <motion.div 
                className="my-8 flex items-center gap-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-100px' }}
              >
                <div className="flex-1 h-px bg-border" />
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {day.dayNumber}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    Giorno {day.dayNumber}
                  </span>
                </div>
                <div className="flex-1 h-px bg-border" />
              </motion.div>
            )}

            {/* Day Header */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="font-display text-xl font-semibold text-foreground capitalize">
                {day.date}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {day.summary}
              </p>
            </motion.div>

            {/* Timeline */}
            <div className="relative">
              {day.slots.map((slot) => (
                <TimelineSlotReal
                  key={slot.id}
                  slot={slot}
                  dayIndex={dayIndex}
                  onReplace={() => {}}
                  onMove={() => {}}
                  onAddProduct={(product, placeName) => {
                    addProduct(product, dayIndex, slot.place?.id, placeName);
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </main>

      {/* Selected Products Indicator */}
      <SelectedProductsIndicator />

      {/* Save Plan Sheet */}
      <SavePlanSheet
        isOpen={showSaveSheet}
        onOpenChange={setShowSaveSheet}
        hasExtras={hasExtras}
        extrasCount={selectedProducts.length}
        onConfirmExtras={handleConfirmExtras}
        onBackToPlan={handleBackToPlan}
      />

      {/* Checkout Sheet */}
      <ExtrasCheckoutSheet />

      {/* Map Sheet */}
      <ItineraryMapSheet
        isOpen={showMapSheet}
        onOpenChange={setShowMapSheet}
        generatedData={generatedData}
        activeDay={activeDay}
        onDayChange={setActiveDay}
      />

      {/* Calendar Sheet */}
      <CalendarSheet
        isOpen={showCalendarSheet}
        onOpenChange={setShowCalendarSheet}
        generatedData={generatedData}
        activeDay={activeDay}
        onDayChange={setActiveDay}
      />

      {/* Bottom CTA */}
      <div className="sticky bottom-0 bg-background border-t border-border z-30">
        <div className="container max-w-2xl py-4 px-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setShowMapSheet(true)}>
            <Map className="w-4 h-4 mr-2" />
            Mappa
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => setShowCalendarSheet(true)}>
            <Calendar className="w-4 h-4 mr-2" />
            Calendario
          </Button>
          <Button 
            className="flex-1 bg-gradient-hero"
            onClick={handleSavePlan}
            disabled={isSaving || isSaved}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvo...
              </>
            ) : isSaved ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Salvato
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Salva
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
