import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { PlaceFormData, TargetAudience } from '@/types/database';
import { TARGET_AUDIENCE_OPTIONS } from '@/types/database';

interface StepSocialProps {
  formData: PlaceFormData;
  onUpdate: (updates: Partial<PlaceFormData>) => void;
}

const SOCIAL_LEVEL_LABELS = [
  { value: 1, emoji: '😐', label: 'Per niente' },
  { value: 2, emoji: '🙂', label: 'Poco' },
  { value: 3, emoji: '😊', label: 'Abbastanza' },
  { value: 4, emoji: '😄', label: 'Molto' },
  { value: 5, emoji: '🔥', label: 'Moltissimo' },
];

export default function StepSocial({ formData, onUpdate }: StepSocialProps) {
  const currentLevel = SOCIAL_LEVEL_LABELS.find(l => l.value === formData.social_level) || SOCIAL_LEVEL_LABELS[2];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-8"
    >
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
          Social & Vibe
        </h2>
        <p className="text-muted-foreground">
          Com'è l'atmosfera sociale?
        </p>
      </div>

      {/* Social level slider */}
      <div className="space-y-4">
        <Label className="text-base">
          Qui è normale parlare con sconosciuti?
        </Label>
        
        <div className="card-editorial p-6">
          <div className="text-center mb-6">
            <span className="text-4xl">{currentLevel.emoji}</span>
            <p className="text-sm font-medium mt-2">{currentLevel.label}</p>
          </div>
          
          <Slider
            value={[formData.social_level]}
            onValueChange={([value]) => onUpdate({ social_level: value })}
            min={1}
            max={5}
            step={1}
            className="w-full"
          />
          
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Per niente</span>
            <span>Moltissimo</span>
          </div>
        </div>
      </div>

      {/* Toggle options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 card-editorial">
          <div>
            <Label htmlFor="solo" className="text-base cursor-pointer">
              Ci vai anche da solo senza disagio?
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Ok andarci in solitaria
            </p>
          </div>
          <Switch
            id="solo"
            checked={formData.solo_friendly}
            onCheckedChange={(checked) => onUpdate({ solo_friendly: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-4 card-editorial">
          <div>
            <Label htmlFor="flirt" className="text-base cursor-pointer">
              È un posto dove si conosce gente?
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Atmosfera aperta e sociale
            </p>
          </div>
          <Switch
            id="flirt"
            checked={formData.flirt_friendly}
            onCheckedChange={(checked) => onUpdate({ flirt_friendly: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-4 card-editorial">
          <div>
            <Label htmlFor="group" className="text-base cursor-pointer">
              Meglio in gruppo?
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Ideale per compagnie
            </p>
          </div>
          <Switch
            id="group"
            checked={formData.group_friendly}
            onCheckedChange={(checked) => onUpdate({ group_friendly: checked })}
          />
        </div>
      </div>

      {/* Target audience */}
      <div className="space-y-3">
        <Label className="text-base">Chi trovi di solito qui?</Label>
        <div className="grid grid-cols-2 gap-2">
          {TARGET_AUDIENCE_OPTIONS.map((option) => {
            const isSelected = formData.target_audience === option.id;
            return (
              <Button
                key={option.id}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                className={`${isSelected ? '' : 'bg-card'}`}
                onClick={() => onUpdate({ target_audience: option.id as TargetAudience })}
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
