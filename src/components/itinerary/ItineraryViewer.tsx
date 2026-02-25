import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
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
  Loader2,
  UtensilsCrossed,
  Moon,
  Sun,
  Users,
  Heart,
  Eye,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimelineSlotReal } from './TimelineSlotReal';
import { SelectedProductsIndicator } from './SelectedProductsIndicator';
import { SavePlanSheet } from './SavePlanSheet';
import { ExtrasCheckoutSheet } from './ExtrasCheckoutSheet';
import { ItineraryGate } from './ItineraryGate';
import { ItineraryMapSheet } from './ItineraryMapSheet';
import { CalendarSheet } from './CalendarSheet';
import { ReplaceSlotSheet } from './ReplaceSlotSheet';
import { MoveSlotSheet } from './MoveSlotSheet';
import { useSelectedProducts } from '@/contexts/SelectedProductsContext';
import { useTripPlan } from '@/contexts/TripPlanContext';
import { type TripPreferences } from '@/lib/mockData';
import { type GeneratedItinerary, type GeneratedSlot, type GeneratedDay, type ItineraryPlace } from '@/hooks/useGenerateItinerary';
import { toast } from 'sonner';

interface ItineraryViewerProps {
  preferences: TripPreferences;
  generatedData: GeneratedItinerary;
  onBack: () => void;
  onRegenerate: () => void;
  onRegenerateWith?: (tweaks: Partial<TripPreferences>) => void;
}

export function ItineraryViewer({ preferences, generatedData, onBack, onRegenerate, onRegenerateWith }: ItineraryViewerProps) {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const FREE_SLOTS_LIMIT = 3; // How many slots anonymous users can see
  const [activeDay, setActiveDay] = useState(0);
  const [showDayTransition, setShowDayTransition] = useState(false);
  const [showSaveSheet, setShowSaveSheet] = useState(false);
  const [showMapSheet, setShowMapSheet] = useState(false);
  const [showCalendarSheet, setShowCalendarSheet] = useState(false);
  const [itineraryData, setItineraryData] = useState<GeneratedDay[]>(generatedData.itinerary);
  const [replaceTarget, setReplaceTarget] = useState<{ slot: GeneratedSlot; dayIndex: number } | null>(null);
  const [moveTarget, setMoveTarget] = useState<{ slot: GeneratedSlot; dayIndex: number } | null>(null);
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
  
  const { itinerary: _originalItinerary, city, meta } = generatedData;
  const hasExtras = selectedProducts.length > 0;
  const isSaved = planStatus !== 'DRAFT';

  // Replace handler
  const handleReplace = useCallback((newPlace: ItineraryPlace) => {
    if (!replaceTarget) return;
    setItineraryData(prev => {
      const updated = [...prev];
      const day = { ...updated[replaceTarget.dayIndex] };
      day.slots = day.slots.map(s =>
        s.id === replaceTarget.slot.id
          ? { ...s, place: newPlace, reason: `Hai scelto ${newPlace.name} al posto di ${replaceTarget.slot.place?.name}` }
          : s
      );
      updated[replaceTarget.dayIndex] = day;
      return updated;
    });
    toast.success(`Sostituito con ${newPlace.name}!`);
  }, [replaceTarget]);

  // Move (swap) handler
  const handleMove = useCallback((targetDayIndex: number, targetSlotId: string) => {
    if (!moveTarget) return;
    setItineraryData(prev => {
      const updated = prev.map(d => ({ ...d, slots: [...d.slots] }));
      
      const srcDay = updated[moveTarget.dayIndex];
      const dstDay = updated[targetDayIndex];
      
      const srcIdx = srcDay.slots.findIndex(s => s.id === moveTarget.slot.id);
      const dstIdx = dstDay.slots.findIndex(s => s.id === targetSlotId);
      
      if (srcIdx === -1 || dstIdx === -1) return prev;
      
      const srcSlot = srcDay.slots[srcIdx];
      const dstSlot = dstDay.slots[dstIdx];
      
      // Swap places, keep time structure
      srcDay.slots[srcIdx] = { ...srcSlot, place: dstSlot.place, reason: dstSlot.reason };
      dstDay.slots[dstIdx] = { ...dstSlot, place: srcSlot.place, reason: srcSlot.reason };
      
      return updated;
    });
    toast.success('Tappe scambiate! 🔄');
  }, [moveTarget]);

  // Intersection Observer for automatic day switching on scroll
  useEffect(() => {
    if (itineraryData.length <= 1) return;
    // While the map sheet is open, don't let scroll observers override the selected day.
    // Same for the calendar sheet: switching days there should not be immediately overridden.
    if (showMapSheet || showCalendarSheet) return;

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
  }, [itineraryData.length, activeDay, showMapSheet, showCalendarSheet]);

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

  const handleQuickTweak = useCallback((tweaks: Partial<TripPreferences>) => {
    if (onRegenerateWith) {
      onRegenerateWith(tweaks);
    } else {
      onRegenerate();
    }
  }, [onRegenerateWith, onRegenerate]);

  const quickActions = useMemo(() => {
    const actions: { icon: typeof RotateCcw; label: string; action: () => void }[] = [
      { icon: RotateCcw, label: 'Rigenera', action: onRegenerate },
      { icon: Footprints, label: 'Meno camminate', action: () => handleQuickTweak({ rhythm: Math.max(1, preferences.rhythm - 1) }) },
      { icon: Coffee, label: 'Più relax', action: () => handleQuickTweak({ rhythm: Math.max(1, preferences.rhythm - 1), lunchStyle: 'long' }) },
      { icon: Sparkles, label: 'Più cultura', action: () => handleQuickTweak({ interests: [...new Set([...preferences.interests, 'culture', 'history', 'art'])] }) },
      { icon: UtensilsCrossed, label: 'Più cibo locale', action: () => handleQuickTweak({ interests: [...new Set([...preferences.interests, 'food', 'local_cuisine'])] }) },
      { icon: Zap, label: 'Più intenso', action: () => handleQuickTweak({ rhythm: Math.min(5, preferences.rhythm + 1) }) },
    ];

    if (preferences.startTime !== 'early') {
      actions.push({ icon: Sun, label: 'Parti presto', action: () => handleQuickTweak({ startTime: 'early' }) });
    }
    if (preferences.startTime !== 'late') {
      actions.push({ icon: Moon, label: 'Parti tardi', action: () => handleQuickTweak({ startTime: 'late' }) });
    }
    if (preferences.travelWith === 'couple') {
      actions.push({ icon: Heart, label: 'Più romantico', action: () => handleQuickTweak({ interests: [...new Set([...preferences.interests, 'romantic'])] }) });
    }
    if (!preferences.interests.includes('panoramic')) {
      actions.push({ icon: Eye, label: 'Più panorami', action: () => handleQuickTweak({ interests: [...new Set([...preferences.interests, 'panoramic', 'scenic'])] }) });
    }
    if (preferences.guidedTours !== 'guided') {
      actions.push({ icon: Users, label: 'Con guida', action: () => handleQuickTweak({ guidedTours: 'guided' }) });
    }

    return actions;
  }, [preferences, onRegenerate, handleQuickTweak]);

  // Count total products available
  const totalProducts = itineraryData.reduce((acc, day) => 
    acc + day.slots.reduce((slotAcc, slot) => 
      slotAcc + (slot.productSuggestions?.length || 0), 0
    ), 0
  );

  // Handle save plan
  const handleSavePlan = async () => {
    // Build slots from itinerary data
    const slots = itineraryData.flatMap((day, dayIndex) =>
      day.slots
        .filter(slot => slot.place?.id)
        .map((slot, sortIndex) => ({
          place_id: slot.place!.id,
          item_type: 'place' as const,
          day_index: dayIndex + 1,
          start_time: slot.startTime ? `${slot.startTime}:00` : undefined,
          end_time: slot.endTime ? `${slot.endTime}:00` : undefined,
          slot_type: slot.type,
          sort_order: sortIndex,
        }))
    );

    // Add selected products
    const productSlots = selectedProducts.map((sp, i) => ({
      product_id: sp.product.id,
      item_type: 'product' as const,
      day_index: sp.dayIndex + 1,
      sort_order: 100 + i,
    }));

    const success = await savePlan({
      cityId: city.id,
      title: `${preferences.numDays} giorni a ${city.name}`,
      days: preferences.numDays,
      preferences: preferences as unknown as Record<string, unknown>,
      slots: [...slots, ...productSlots],
    });
    
    if (success) {
      if (hasExtras) {
        setPlanStatus('SAVED_WITH_EXTRAS');
      } else {
        setPlanStatus('SAVED');
      }
      
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
        {showDayTransition && itineraryData.length > 1 && (
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
      <div className="sticky top-[116px] z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container max-w-2xl py-2.5 px-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                onClick={action.action}
                className="flex-shrink-0 h-8 text-xs px-3"
              >
                <action.icon className="w-3.5 h-3.5 mr-1" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Day Tabs */}
      {itineraryData.length > 1 && (
        <div className="sticky top-[168px] z-30 bg-background border-b border-border">
          <div className="container max-w-2xl">
            <div className="flex">
              {itineraryData.map((day, index) => (
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
        {itineraryData.map((day, dayIndex) => {
          // For anonymous users, count total slots shown so far
          let totalSlotsShownBefore = 0;
          if (!isAuthenticated) {
            for (let i = 0; i < dayIndex; i++) {
              totalSlotsShownBefore += itineraryData[i].slots.length;
            }
          }
          const remainingFreeSlots = isAuthenticated ? Infinity : FREE_SLOTS_LIMIT - totalSlotsShownBefore;
          const shouldGateThisDay = !isAuthenticated && remainingFreeSlots <= 0;

          // Skip entire day if no free slots remain
          if (shouldGateThisDay && dayIndex > 0) return null;

          const visibleSlots = isAuthenticated ? day.slots : day.slots.slice(0, Math.max(0, remainingFreeSlots));
          const isGated = !isAuthenticated && totalSlotsShownBefore + day.slots.length > FREE_SLOTS_LIMIT;

          return (
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
              {visibleSlots.map((slot) => (
                <TimelineSlotReal
                  key={slot.id}
                  slot={slot}
                  dayIndex={dayIndex}
                  onReplace={() => setReplaceTarget({ slot, dayIndex })}
                  onMove={() => setMoveTarget({ slot, dayIndex })}
                  onAddProduct={(product, placeName) => {
                    addProduct(product, dayIndex, slot.place?.id, placeName);
                  }}
                />
              ))}
            </div>

            {/* Gate — shown when slots are cut off */}
            {isGated && <ItineraryGate freeSlots={FREE_SLOTS_LIMIT} />}
          </div>
          );
        })}
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

      {/* Replace Slot Sheet */}
      <ReplaceSlotSheet
        isOpen={!!replaceTarget}
        onOpenChange={(open) => !open && setReplaceTarget(null)}
        slot={replaceTarget?.slot || null}
        cityId={city.id}
        onReplace={handleReplace}
      />

      {/* Move Slot Sheet */}
      <MoveSlotSheet
        isOpen={!!moveTarget}
        onOpenChange={(open) => !open && setMoveTarget(null)}
        slot={moveTarget?.slot || null}
        currentDayIndex={moveTarget?.dayIndex || 0}
        itinerary={itineraryData}
        onMove={handleMove}
      />

      {/* Bottom CTA */}
      {isAuthenticated ? (
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border z-30 pb-safe-bottom">
        <div className="container max-w-2xl py-3 px-4 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowMapSheet(true)}>
            <Map className="w-4 h-4 mr-1.5" />
            Mappa
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowCalendarSheet(true)}>
            <Calendar className="w-4 h-4 mr-1.5" />
            Calendario
          </Button>
          <Button 
            size="sm"
            className="flex-1 bg-gradient-hero text-primary-foreground"
            onClick={handleSavePlan}
            disabled={isSaving || isSaved}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Salvo...
              </>
            ) : isSaved ? (
              <>
                <Check className="w-4 h-4 mr-1.5" />
                Salvato
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-1.5" />
                Salva
              </>
            )}
          </Button>
        </div>
      </div>
      ) : null}
    </div>
  );
}
