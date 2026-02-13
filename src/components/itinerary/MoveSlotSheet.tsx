import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, ArrowDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import type { GeneratedSlot, GeneratedDay } from '@/hooks/useGenerateItinerary';

interface MoveSlotSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  slot: GeneratedSlot | null;
  currentDayIndex: number;
  itinerary: GeneratedDay[];
  onMove: (targetDayIndex: number, targetSlotId: string) => void;
}

export function MoveSlotSheet({
  isOpen,
  onOpenChange,
  slot,
  currentDayIndex,
  itinerary,
  onMove,
}: MoveSlotSheetProps) {
  const [selectedDay, setSelectedDay] = useState(currentDayIndex);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedSlotId) {
      onMove(selectedDay, selectedSlotId);
      onOpenChange(false);
      setSelectedSlotId(null);
    }
  };

  const getSlotIcon = (s: GeneratedSlot) => {
    if (s.type === 'meal') return '🍽️';
    if (s.type === 'break') return '☕';
    if (s.type === 'transfer') return '🚶';
    const placeType = s.place?.type;
    if (placeType === 'attraction') return '🏛️';
    if (placeType === 'restaurant') return '🍽️';
    if (placeType === 'bar') return '🍷';
    if (placeType === 'view') return '🌅';
    if (placeType === 'experience') return '✨';
    if (placeType === 'club') return '🎶';
    return '📍';
  };

  const currentDay = itinerary[selectedDay];
  const swappableSlots = currentDay?.slots.filter(
    (s) => s.id !== slot?.id && s.place
  ) || [];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[75vh] overflow-hidden p-0">
        <div className="p-6 pb-0">
          <SheetHeader className="text-left">
            <SheetTitle className="flex items-center gap-2 font-display">
              <ArrowUpDown className="w-5 h-5 text-primary" />
              Sposta {slot?.place?.name}
            </SheetTitle>
            <SheetDescription>
              Seleziona la tappa con cui vuoi scambiare posizione
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Day tabs (if multi-day) */}
        {itinerary.length > 1 && (
          <div className="px-6 pt-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {itinerary.map((day, i) => (
                <button
                  key={day.dayNumber}
                  onClick={() => {
                    setSelectedDay(i);
                    setSelectedSlotId(null);
                  }}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedDay === i
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Giorno {day.dayNumber}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Slots list */}
        <div className="px-6 py-4 overflow-y-auto max-h-[50vh]">
          {swappableSlots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nessuna tappa disponibile per lo scambio</p>
            </div>
          ) : (
            <div className="space-y-2">
              {swappableSlots.map((s) => {
                const isSelected = selectedSlotId === s.id;
                return (
                  <motion.button
                    key={s.id}
                    onClick={() => setSelectedSlotId(isSelected ? null : s.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border bg-card hover:border-primary/40'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getSlotIcon(s)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {s.place?.name || 'Pausa'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.startTime} → {s.endTime}
                          {s.place?.zone && ` • ${s.place.zone}`}
                        </p>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                        >
                          <Check className="w-4 h-4" />
                        </motion.div>
                      )}
                    </div>

                    {/* Swap preview */}
                    {isSelected && slot?.place && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 pt-3 border-t border-border/50"
                      >
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{slot.place.name}</span>
                          <ArrowDown className="w-3 h-3 rotate-90" />
                          <span className="text-primary font-medium">
                            {s.startTime} → {s.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span className="font-medium text-foreground">{s.place?.name}</span>
                          <ArrowDown className="w-3 h-3 rotate-90" />
                          <span className="text-primary font-medium">
                            {slot.startTime} → {slot.endTime}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirm button */}
        <div className="p-6 pt-0 border-t border-border">
          <Button
            className="w-full"
            disabled={!selectedSlotId}
            onClick={handleConfirm}
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Conferma scambio
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
