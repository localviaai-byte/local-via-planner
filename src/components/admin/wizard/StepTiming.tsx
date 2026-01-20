import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { PlaceFormData, BestDay, BestTime } from '@/types/database';
import { BEST_DAYS_OPTIONS, BEST_TIMES_OPTIONS } from '@/types/database';
import { Check } from 'lucide-react';

interface StepTimingProps {
  formData: PlaceFormData;
  onUpdate: (updates: Partial<PlaceFormData>) => void;
}

export default function StepTiming({ formData, onUpdate }: StepTimingProps) {
  const toggleDay = (day: BestDay) => {
    const current = formData.best_days;
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day];
    onUpdate({ best_days: updated });
  };

  const toggleTime = (time: BestTime) => {
    const current = formData.best_times;
    const updated = current.includes(time)
      ? current.filter(t => t !== time)
      : [...current, time];
    onUpdate({ best_times: updated });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
          Quando funziona davvero?
        </h2>
        <p className="text-muted-foreground">
          Quando lo consiglieresti a un amico?
        </p>
      </div>

      {/* Best days */}
      <div className="space-y-3">
        <Label className="text-base">Giorni migliori</Label>
        <div className="flex flex-wrap gap-2">
          {BEST_DAYS_OPTIONS.map((day) => {
            const isSelected = formData.best_days.includes(day.id);
            return (
              <Button
                key={day.id}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                className={`min-w-[50px] ${isSelected ? '' : 'bg-card'}`}
                onClick={() => toggleDay(day.id)}
              >
                {day.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Best times */}
      <div className="space-y-3">
        <Label className="text-base">Orari migliori</Label>
        <div className="grid grid-cols-2 gap-2">
          {BEST_TIMES_OPTIONS.map((time) => {
            const isSelected = formData.best_times.includes(time.id);
            return (
              <Button
                key={time.id}
                variant={isSelected ? 'default' : 'outline'}
                className={`justify-start ${isSelected ? '' : 'bg-card'}`}
                onClick={() => toggleTime(time.id)}
              >
                <span className="mr-2">{time.icon}</span>
                <span className="flex-1 text-left">{time.label}</span>
                {isSelected && <Check className="w-4 h-4" />}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Periods to avoid */}
      <div className="space-y-2">
        <Label htmlFor="avoid">Periodi da evitare (opzionale)</Label>
        <Textarea
          id="avoid"
          value={formData.periods_to_avoid}
          onChange={(e) => onUpdate({ periods_to_avoid: e.target.value })}
          placeholder="Es: Agosto è morto, il lunedì è chiuso..."
          className="bg-card resize-none"
          rows={2}
          maxLength={200}
        />
      </div>
    </motion.div>
  );
}
