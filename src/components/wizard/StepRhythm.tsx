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
    { value: 'quick', label: 'Pranzo veloce', description: '45 min - 1 ora' },
    { value: 'long', label: 'Pranzo rilassato', description: '1.5 - 2 ore' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-bold text-foreground mb-2">
          Il tuo ritmo ideale
        </h2>
        <p className="text-muted-foreground">
          Ogni viaggio ha il suo tempo. Qual è il tuo?
        </p>
      </div>

      {/* Rhythm Slider */}
      <div className="space-y-4">
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
        <label className="text-sm font-medium text-foreground">
          A che ora preferisci partire?
        </label>
        <div className="grid grid-cols-3 gap-3">
          {startTimeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.value}
                type="button"
                variant={preferences.startTime === option.value ? 'default' : 'outline'}
                onClick={() => onUpdate({ startTime: option.value as TripPreferences['startTime'] })}
                className={`h-auto py-4 flex flex-col gap-2 ${
                  preferences.startTime === option.value ? 'bg-gradient-hero border-0' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{option.label}</span>
                <span className="text-xs opacity-80">{option.description}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Lunch Style */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-foreground">
          Come preferisci il pranzo?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {lunchOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={preferences.lunchStyle === option.value ? 'default' : 'outline'}
              onClick={() => onUpdate({ lunchStyle: option.value as TripPreferences['lunchStyle'] })}
              className={`h-auto py-4 flex flex-col gap-1 ${
                preferences.lunchStyle === option.value ? 'bg-gradient-hero border-0' : ''
              }`}
            >
              <span className="text-2xl">{option.value === 'quick' ? '🥪' : '🍝'}</span>
              <span className="font-medium">{option.label}</span>
              <span className="text-xs opacity-80">{option.description}</span>
            </Button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
