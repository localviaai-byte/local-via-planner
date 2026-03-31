import { motion } from 'framer-motion';
import { Sun, Coffee, Moon } from 'lucide-react';
import { type TripPreferences } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { RhythmSlider } from '@/components/ui/RhythmSlider';

interface StepRhythmProps {
  preferences: TripPreferences;
  onUpdate: (updates: Partial<TripPreferences>) => void;
}

export function StepRhythm({ preferences, onUpdate }: StepRhythmProps) {
  const startTimeOptions = [
    { value: 'early', label: 'Mattiniero', description: 'Alle 8:00', icon: Sun },
    { value: 'normal', label: 'Normale', description: 'Alle 9:30', icon: Coffee },
    { value: 'late', label: 'Con calma', description: 'Alle 11:00', icon: Moon },
  ];

  const lunchOptions = [
    { value: 'quick', label: 'Pranzo veloce', description: '45 min - 1h', emoji: '🥪' },
    { value: 'long', label: 'Pranzo rilassato', description: '1.5 - 2h', emoji: '🍝' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="text-center mb-1">
        <h2 className="font-display text-xl font-semibold text-foreground tracking-tight">
          Il tuo ritmo ideale
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Ogni viaggio ha il suo tempo. Qual è il tuo?
        </p>
      </div>

      {/* Rhythm Slider */}
      <div className="space-y-3 p-4 bg-card rounded-xl shadow-soft">
        <label className="text-xs font-medium text-foreground">
          Intensità del viaggio
        </label>
        <RhythmSlider
          value={preferences.rhythm}
          onChange={(rhythm) => onUpdate({ rhythm })}
        />
      </div>

      {/* Start Time */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          A che ora preferisci partire?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {startTimeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = preferences.startTime === option.value;
            return (
              <Button key={option.value} type="button"
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => onUpdate({ startTime: option.value as TripPreferences['startTime'] })}
                className="h-auto py-3 flex flex-col gap-1">
                <Icon className="w-4 h-4" />
                <span className="font-medium text-[11px]">{option.label}</span>
                <span className="text-[9px] opacity-70">{option.description}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Lunch Style */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Come preferisci il pranzo?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {lunchOptions.map((option) => {
            const isSelected = preferences.lunchStyle === option.value;
            return (
              <Button key={option.value} type="button"
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => onUpdate({ lunchStyle: option.value as TripPreferences['lunchStyle'] })}
                className="h-auto py-4 flex flex-col gap-1.5">
                <span className="text-xl">{option.emoji}</span>
                <span className="font-medium text-xs">{option.label}</span>
                <span className="text-[10px] opacity-70">{option.description}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
