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
    { value: 'early', label: 'Mattiniero', description: 'Inizio alle 8:00', icon: Sun },
    { value: 'normal', label: 'Normale', description: 'Inizio alle 9:30', icon: Coffee },
    { value: 'late', label: 'Con calma', description: 'Inizio alle 11:00', icon: Moon },
  ];

  const lunchOptions = [
    { value: 'quick', label: 'Pranzo veloce', description: '45 min - 1 ora', emoji: '🥪' },
    { value: 'long', label: 'Pranzo rilassato', description: '1.5 - 2 ore', emoji: '🍝' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Editorial header */}
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-semibold text-foreground mb-3 tracking-tight">
          Il tuo ritmo ideale
        </h2>
        <p className="text-muted-foreground">
          Ogni viaggio ha il suo tempo. Qual è il tuo?
        </p>
      </div>

      {/* Rhythm Slider */}
      <div className="space-y-4 p-5 bg-card rounded-2xl shadow-soft">
        <label className="text-sm font-medium text-foreground">
          Intensità del viaggio
        </label>
        <RhythmSlider
          value={preferences.rhythm}
          onChange={(rhythm) => onUpdate({ rhythm })}
        />
      </div>

      {/* Start Time */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-muted-foreground">
          A che ora preferisci partire?
        </label>
        <div className="grid grid-cols-3 gap-3">
          {startTimeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = preferences.startTime === option.value;
            return (
              <Button
                key={option.value}
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => onUpdate({ startTime: option.value as TripPreferences['startTime'] })}
                className="h-auto py-4 flex flex-col gap-2"
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-xs">{option.label}</span>
                <span className="text-[10px] opacity-70">{option.description}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Lunch Style */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-muted-foreground">
          Come preferisci il pranzo?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {lunchOptions.map((option) => {
            const isSelected = preferences.lunchStyle === option.value;
            return (
              <Button
                key={option.value}
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => onUpdate({ lunchStyle: option.value as TripPreferences['lunchStyle'] })}
                className="h-auto py-5 flex flex-col gap-2"
              >
                <span className="text-2xl">{option.emoji}</span>
                <span className="font-medium">{option.label}</span>
                <span className="text-xs opacity-70">{option.description}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
