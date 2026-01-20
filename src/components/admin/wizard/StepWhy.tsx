import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { PlaceFormData, WhyPeopleGo } from '@/types/database';
import { WHY_PEOPLE_GO_OPTIONS } from '@/types/database';
import { Check } from 'lucide-react';

interface StepWhyProps {
  formData: PlaceFormData;
  onUpdate: (updates: Partial<PlaceFormData>) => void;
}

export default function StepWhy({ formData, onUpdate }: StepWhyProps) {
  const toggleOption = (id: WhyPeopleGo) => {
    const current = formData.why_people_go;
    const updated = current.includes(id)
      ? current.filter(i => i !== id)
      : [...current, id];
    onUpdate({ why_people_go: updated });
  };

  const showOtherInput = formData.why_people_go.includes('other');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
          Perché ci vai davvero?
        </h2>
        <p className="text-muted-foreground">
          Quando vai qui, di solito è per...
        </p>
      </div>

      {/* Options grid */}
      <div className="space-y-3">
        {WHY_PEOPLE_GO_OPTIONS.map((option) => {
          const isSelected = formData.why_people_go.includes(option.id);
          return (
            <Button
              key={option.id}
              variant="outline"
              className={`w-full justify-start h-auto py-3 px-4 ${
                isSelected 
                  ? 'border-primary bg-primary/5' 
                  : 'bg-card'
              }`}
              onClick={() => toggleOption(option.id)}
            >
              <span className="text-xl mr-3">{option.icon}</span>
              <span className="flex-1 text-left">{option.label}</span>
              {isSelected && (
                <Check className="w-5 h-5 text-primary" />
              )}
            </Button>
          );
        })}
      </div>

      {/* Other input */}
      {showOtherInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2"
        >
          <Input
            value={formData.why_other}
            onChange={(e) => onUpdate({ why_other: e.target.value })}
            placeholder="Specifica il motivo..."
            className="bg-card"
            maxLength={100}
          />
        </motion.div>
      )}

      {/* Selection count */}
      <p className="text-sm text-muted-foreground text-center">
        {formData.why_people_go.length} selezionati
      </p>
    </motion.div>
  );
}
