import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Turtle, Rabbit } from 'lucide-react';

interface RhythmSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const rhythmLabels = [
  { value: 1, label: 'Molto calmo', description: '1-2 attività al giorno, tanto relax' },
  { value: 2, label: 'Calmo', description: '2-3 attività, pause frequenti' },
  { value: 3, label: 'Bilanciato', description: '3-4 attività, ritmo moderato' },
  { value: 4, label: 'Dinamico', description: '4-5 attività, ritmo sostenuto' },
  { value: 5, label: 'Intenso', description: 'Massimizza esperienze!' },
];

export function RhythmSlider({ value, onChange }: RhythmSliderProps) {
  const currentRhythm = rhythmLabels.find(r => r.value === value) || rhythmLabels[2];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-muted-foreground">
        <div className="flex items-center gap-2">
          <Turtle className="w-4 h-4" />
          <span className="text-sm">Calmo</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Intenso</span>
          <Rabbit className="w-4 h-4" />
        </div>
      </div>

      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={1}
        max={5}
        step={1}
        className="w-full"
      />

      <motion.div
        key={value}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-4 bg-secondary/50 rounded-xl"
      >
        <p className="font-display text-lg font-semibold text-foreground">
          {currentRhythm.label}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {currentRhythm.description}
        </p>
      </motion.div>
    </div>
  );
}
