import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { PlaceFormData, IdealFor } from '@/types/database';
import { IDEAL_FOR_OPTIONS } from '@/types/database';

interface StepInsiderProps {
  formData: PlaceFormData;
  onUpdate: (updates: Partial<PlaceFormData>) => void;
}

export default function StepInsider({ formData, onUpdate }: StepInsiderProps) {
  const toggleIdealFor = (id: IdealFor) => {
    const current = formData.ideal_for || [];
    const newList = current.includes(id)
      ? current.filter(i => i !== id)
      : [...current, id];
    onUpdate({ ideal_for: newList });
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
          Insider insights
        </h2>
        <p className="text-muted-foreground">
          Le cose che solo un local sa
        </p>
      </div>

      {/* Insider toggles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 card-editorial">
          <div>
            <Label htmlFor="tourist_trap" className="text-base cursor-pointer">
              ⚠️ Tourist trap?
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              I locali lo evitano
            </p>
          </div>
          <Switch
            id="tourist_trap"
            checked={formData.tourist_trap}
            onCheckedChange={(checked) => onUpdate({ tourist_trap: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-4 card-editorial">
          <div>
            <Label htmlFor="overrated" className="text-base cursor-pointer">
              😐 Overrated?
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Famoso ma non vale la hype
            </p>
          </div>
          <Switch
            id="overrated"
            checked={formData.overrated}
            onCheckedChange={(checked) => onUpdate({ overrated: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-4 card-editorial">
          <div>
            <Label htmlFor="local_secret" className="text-base cursor-pointer">
              🤫 Segreto local?
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Posto nascosto che pochi conoscono
            </p>
          </div>
          <Switch
            id="local_secret"
            checked={formData.local_secret}
            onCheckedChange={(checked) => onUpdate({ local_secret: checked })}
          />
        </div>
      </div>

      {/* Ideal for */}
      <div className="space-y-3">
        <Label className="text-base">Ideale per...</Label>
        <p className="text-xs text-muted-foreground">Seleziona tutti quelli che si applicano</p>
        <div className="grid grid-cols-2 gap-2">
          {IDEAL_FOR_OPTIONS.map((option) => {
            const isSelected = (formData.ideal_for || []).includes(option.id as IdealFor);
            return (
              <Button
                key={option.id}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                className={`${isSelected ? '' : 'bg-card'}`}
                onClick={() => toggleIdealFor(option.id as IdealFor)}
              >
                <span className="mr-2">{option.icon}</span>
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
