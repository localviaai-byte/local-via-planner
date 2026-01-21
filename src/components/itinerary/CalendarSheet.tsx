import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Clock,
  MapPin,
  Utensils,
  Coffee,
  Footprints,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { type GeneratedItinerary, type GeneratedSlot } from '@/hooks/useGenerateItinerary';

interface CalendarSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  generatedData: GeneratedItinerary;
  activeDay: number;
  onDayChange: (day: number) => void;
}

export function CalendarSheet({
  isOpen,
  onOpenChange,
  generatedData,
  activeDay,
  onDayChange,
}: CalendarSheetProps) {
  const { itinerary } = generatedData;
  
  // Safely get current day with bounds check
  const safeActiveDay = Math.max(0, Math.min(activeDay, itinerary.length - 1));
  const currentDay = itinerary[safeActiveDay];

  // Calculate timeline bounds - memoize per day
  const parseTime = (timeStr: string): number => {
    if (!timeStr) return 9 * 60; // default 9:00
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const formatTime = (timeStr: string): string => {
    return timeStr || '09:00';
  };

  // Get earliest start and latest end for current day
  const timeSlots = currentDay?.slots?.filter(s => s.startTime && s.endTime) || [];
  const earliestStart = timeSlots.length > 0 
    ? Math.min(...timeSlots.map(s => parseTime(s.startTime)))
    : 9 * 60;
  const latestEnd = timeSlots.length > 0
    ? Math.max(...timeSlots.map(s => parseTime(s.endTime)))
    : 22 * 60;

  // Round to hour boundaries for display
  const startHour = Math.floor(earliestStart / 60);
  const endHour = Math.ceil(latestEnd / 60);
  const totalMinutes = Math.max((endHour - startHour) * 60, 60); // min 1 hour
  const pixelsPerMinute = 2;

  // Calculate slot position and height
  const getSlotStyle = (slot: GeneratedSlot) => {
    const startMin = parseTime(slot.startTime) - startHour * 60;
    const endMin = parseTime(slot.endTime) - startHour * 60;
    const duration = endMin - startMin;
    
    return {
      top: Math.max(0, startMin * pixelsPerMinute),
      height: Math.max(duration * pixelsPerMinute, 40),
    };
  };

  // Get slot type info - use 'type' from GeneratedSlot
  const getSlotTypeInfo = (slot: GeneratedSlot) => {
    const slotType = slot.type;
    
    switch (slotType) {
      case 'meal':
        return {
          icon: Utensils,
          color: 'bg-terracotta/10 border-terracotta/30',
          iconColor: 'text-terracotta',
          label: 'Pasto',
        };
      case 'break':
        return {
          icon: Coffee,
          color: 'bg-sand-dark/30 border-sand-dark/50',
          iconColor: 'text-muted-foreground',
          label: 'Pausa',
        };
      case 'transfer':
        return {
          icon: Footprints,
          color: 'bg-muted/50 border-muted-foreground/20',
          iconColor: 'text-muted-foreground',
          label: 'Spostamento',
        };
      default:
        return {
          icon: MapPin,
          color: 'bg-olive/10 border-olive/30',
          iconColor: 'text-olive',
          label: 'Visita',
        };
    }
  };

  // Check if slot has products (upgrades)
  const hasProducts = (slot: GeneratedSlot) => {
    return slot.productSuggestions && slot.productSuggestions.length > 0;
  };

  // Generate hour markers
  const hourMarkers = [];
  for (let h = startHour; h <= endHour; h++) {
    hourMarkers.push(h);
  }

  const handlePrevDay = () => {
    if (activeDay > 0) {
      onDayChange(activeDay - 1);
    }
  };

  const handleNextDay = () => {
    if (activeDay < itinerary.length - 1) {
      onDayChange(activeDay + 1);
    }
  };

  // Early return after all hooks
  if (!currentDay) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-3xl" aria-describedby={undefined}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-4 pt-4 pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevDay}
                disabled={activeDay === 0}
                className="h-8 w-8"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="text-center">
                <SheetTitle className="font-display text-lg">
                  Giorno {currentDay.dayNumber}
                </SheetTitle>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">
                  {currentDay.date}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextDay}
                disabled={activeDay === itinerary.length - 1}
                className="h-8 w-8"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Day Dots */}
            {itinerary.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-3">
                {itinerary.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => onDayChange(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === activeDay 
                        ? 'bg-primary w-4' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </SheetHeader>

          {/* Timeline */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDay}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Timeline Container */}
                <div 
                  className="relative ml-16"
                  style={{ height: totalMinutes * pixelsPerMinute }}
                >
                  {/* Hour Markers */}
                  {hourMarkers.map((hour) => (
                    <div
                      key={hour}
                      className="absolute left-0 right-0"
                      style={{ top: (hour - startHour) * 60 * pixelsPerMinute }}
                    >
                      <div className="absolute -left-16 w-12 text-right">
                        <span className="text-xs text-muted-foreground font-medium">
                          {hour.toString().padStart(2, '0')}:00
                        </span>
                      </div>
                      <div className="absolute left-0 right-0 h-px bg-border/50" />
                    </div>
                  ))}

                  {/* Slots */}
                  {currentDay.slots.map((slot, index) => {
                    const style = getSlotStyle(slot);
                    const typeInfo = getSlotTypeInfo(slot);
                    const Icon = typeInfo.icon;
                    const isUpgrade = hasProducts(slot);
                    
                    return (
                      <motion.div
                        key={slot.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`absolute left-4 right-0 rounded-xl border ${typeInfo.color} ${
                          isUpgrade ? 'ring-2 ring-primary/20 ring-offset-2' : ''
                        }`}
                        style={{
                          top: style.top,
                          height: style.height,
                          minHeight: 48,
                        }}
                      >
                        <div className="p-3 h-full flex flex-col">
                          {/* Time Badge */}
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(slot.startTime)}</span>
                              <span className="opacity-50">–</span>
                              <span>{formatTime(slot.endTime)}</span>
                            </div>
                            
                            {/* Upgrade Badge */}
                            {isUpgrade && (
                              <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" />
                                Esperienza
                              </span>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex items-start gap-2 flex-1">
                            <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${typeInfo.iconColor}`} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-foreground line-clamp-1">
                                {slot.place?.name || typeInfo.label}
                              </p>
                              {slot.place?.type && (
                                <p className="text-xs text-muted-foreground capitalize">
                                  {slot.place.type}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Walking Duration (if present) */}
                          {slot.walkingMinutes && slot.walkingMinutes > 0 && style.height > 80 && (
                            <div className="mt-auto pt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Footprints className="w-3 h-3" />
                              <span>{slot.walkingMinutes} min a piedi dopo</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Visual Gaps - Breathing Room Indicator */}
                  {currentDay.slots.map((slot, index) => {
                    if (index === currentDay.slots.length - 1) return null;
                    
                    const nextSlot = currentDay.slots[index + 1];
                    const thisEnd = parseTime(slot.endTime);
                    const nextStart = parseTime(nextSlot.startTime);
                    const gap = nextStart - thisEnd;
                    
                    // Show gap indicator if > 30 minutes
                    if (gap > 30) {
                      const topPos = (thisEnd - startHour * 60) * pixelsPerMinute;
                      const height = gap * pixelsPerMinute;
                      
                      return (
                        <div
                          key={`gap-${index}`}
                          className="absolute left-4 right-0 flex items-center justify-center"
                          style={{
                            top: topPos + 8,
                            height: height - 16,
                          }}
                        >
                          <span className="text-[10px] text-muted-foreground/60 bg-background px-2">
                            {gap >= 60 
                              ? `${Math.floor(gap / 60)}h ${gap % 60 > 0 ? `${gap % 60}min` : ''} liberi`
                              : `${gap} min liberi`
                            }
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-border bg-muted/30">
            <p className="text-xs text-center text-muted-foreground">
              {currentDay.slots.length} attività • Ritmo {
                currentDay.slots.length <= 3 ? 'calmo' : currentDay.slots.length <= 5 ? 'moderato' : 'intenso'
              }
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
