import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { PlaceFormData, SuggestedStay } from '@/types/database';
import { SUGGESTED_STAY_OPTIONS } from '@/types/database';

interface StepEffortProps {
  formData: PlaceFormData;
  onUpdate: (updates: Partial<PlaceFormData>) => void;
}

const EFFORT_LABELS = [
  { value: 1, label: 'Nullo' },
  { value: 2, label: 'Basso' },
  { value: 3, label: 'Medio' },
  { value: 4, label: 'Alto' },
  { value: 5, label: 'Intenso' },
];

export default function StepEffort({ formData, onUpdate }: StepEffortProps) {
  const physicalLabel = EFFORT_LABELS.find(l => l.value === formData.physical_effort)?.label || 'Non specificato';
  const mentalLabel = EFFORT_LABELS.find(l => l.value === formData.mental_effort)?.label || 'Non specificato';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
          Effort & tempo
        </h2>
        <p className="text-muted-foreground">
          Quanto impegno richiede questa esperienza?
        </p>
      </div>

      {/* Physical effort */}
      <div className="card-editorial p-4 space-y-3">
        <Label className="text-sm font-medium">🏃 Sforzo fisico</Label>
        <p className="text-xs text-muted-foreground">Quanta attività fisica serve?</p>
        <Slider
          value={[formData.physical_effort || 1]}
          onValueChange={([v]) => onUpdate({ physical_effort: v })}
          min={1}
          max={5}
          step={1}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Nullo</span>
          <span className="font-medium text-foreground">{physicalLabel}</span>
          <span>Intenso</span>
        </div>
      </div>

      {/* Mental effort */}
      <div className="card-editorial p-4 space-y-3">
        <Label className="text-sm font-medium">🧠 Sforzo mentale</Label>
        <p className="text-xs text-muted-foreground">Concentrazione, pianificazione, stress</p>
        <Slider
          value={[formData.mental_effort || 1]}
          onValueChange={([v]) => onUpdate({ mental_effort: v })}
          min={1}
          max={5}
          step={1}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Nullo</span>
          <span className="font-medium text-foreground">{mentalLabel}</span>
          <span>Intenso</span>
        </div>
      </div>

      {/* Suggested stay */}
      <div className="space-y-3">
        <Label className="text-base">⏱️ Quanto tempo ci stai?</Label>
        <div className="grid grid-cols-3 gap-2">
          {SUGGESTED_STAY_OPTIONS.map((option) => {
            const isSelected = formData.suggested_stay === option.id;
            return (
              <Button
                key={option.id}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                className={`${isSelected ? '' : 'bg-card'}`}
                onClick={() => onUpdate({ suggested_stay: option.id as SuggestedStay })}
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
