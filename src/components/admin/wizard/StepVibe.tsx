import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { PlaceFormData, VibeLabel } from '@/types/database';
import { VIBE_LABEL_OPTIONS } from '@/types/database';

interface StepVibeProps {
  formData: PlaceFormData;
  onUpdate: (updates: Partial<PlaceFormData>) => void;
}

interface VibeSliderProps {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (value: number) => void;
}

function VibeSlider({ label, leftLabel, rightLabel, value, onChange }: VibeSliderProps) {
  return (
    <div className="card-editorial p-4 space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={1}
        max={5}
        step={1}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

export default function StepVibe({ formData, onUpdate }: StepVibeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
          Che atmosfera c'è?
        </h2>
        <p className="text-muted-foreground">
          Descrivi il vibe di questo posto
        </p>
      </div>

      {/* Mood primary selection */}
      <div className="space-y-3">
        <Label className="text-base">Vibe principale</Label>
        <div className="grid grid-cols-2 gap-2">
          {VIBE_LABEL_OPTIONS.map((option) => {
            const isSelected = formData.mood_primary === option.id;
            return (
              <Button
                key={option.id}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                className={`${isSelected ? '' : 'bg-card'}`}
                onClick={() => onUpdate({ mood_primary: option.id as VibeLabel })}
              >
                <span className="mr-2">{option.icon}</span>
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Mood secondary selection */}
      <div className="space-y-3">
        <Label className="text-base">Vibe secondario (opzionale)</Label>
        <div className="grid grid-cols-2 gap-2">
          {VIBE_LABEL_OPTIONS.filter(o => o.id !== formData.mood_primary).map((option) => {
            const isSelected = formData.mood_secondary === option.id;
            return (
              <Button
                key={option.id}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                className={`${isSelected ? '' : 'bg-card'}`}
                onClick={() => onUpdate({ 
                  mood_secondary: isSelected ? null : option.id as VibeLabel 
                })}
              >
                <span className="mr-2">{option.icon}</span>
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Vibe sliders */}
      <div className="space-y-4 pt-4 border-t border-border">
        <Label className="text-base">Sfumature dell'atmosfera</Label>
        
        <VibeSlider
          label="Energia"
          leftLabel="Calmo ☕"
          rightLabel="🎉 Carico"
          value={formData.vibe_calm_to_energetic}
          onChange={(v) => onUpdate({ vibe_calm_to_energetic: v })}
        />

        <VibeSlider
          label="Volume"
          leftLabel="Silenzioso 🤫"
          rightLabel="🔊 Rumoroso"
          value={formData.vibe_quiet_to_loud}
          onChange={(v) => onUpdate({ vibe_quiet_to_loud: v })}
        />

        <VibeSlider
          label="Affollamento"
          leftLabel="Vuoto 🧘"
          rightLabel="👥 Pieno"
          value={formData.vibe_empty_to_crowded}
          onChange={(v) => onUpdate({ vibe_empty_to_crowded: v })}
        />

        <VibeSlider
          label="Pubblico"
          leftLabel="Turistico 📸"
          rightLabel="🏠 Super local"
          value={formData.vibe_touristy_to_local}
          onChange={(v) => onUpdate({ vibe_touristy_to_local: v })}
        />
      </div>

      {/* Visual summary */}
      <div className="text-center p-4 card-editorial">
        <p className="text-sm text-muted-foreground mb-2">Il tuo vibe</p>
        <div className="flex justify-center gap-2 text-2xl">
          {formData.mood_primary && VIBE_LABEL_OPTIONS.find(o => o.id === formData.mood_primary)?.icon}
          {formData.mood_secondary && VIBE_LABEL_OPTIONS.find(o => o.id === formData.mood_secondary)?.icon}
          {formData.vibe_calm_to_energetic >= 4 && '🎉'}
          {formData.vibe_calm_to_energetic <= 2 && '☕'}
          {formData.vibe_touristy_to_local >= 4 && '🏠'}
          {formData.vibe_touristy_to_local <= 2 && '📸'}
        </div>
      </div>
    </motion.div>
  );
}
