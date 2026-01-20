import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check, Lightbulb } from 'lucide-react';
import type { CityFormData, CityWalkability, CityRhythm, BestTimeOfDay } from '@/types/database';
import { CITY_WALKABILITY_OPTIONS, CITY_RHYTHM_OPTIONS, BEST_TIME_OF_DAY_OPTIONS } from '@/types/database';

interface StepCityStructureProps {
  formData: CityFormData;
  onUpdate: (updates: Partial<CityFormData>) => void;
}

export default function StepCityStructure({ formData, onUpdate }: StepCityStructureProps) {
  const toggleBestTime = (time: BestTimeOfDay) => {
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
          Come si vive questa città?
        </h2>
        <p className="text-muted-foreground">
          Informazioni macro per l'AI
        </p>
      </div>
      
      {/* Walkability */}
      <div className="space-y-3">
        <Label>È visitabile a piedi?</Label>
        <div className="space-y-2">
          {CITY_WALKABILITY_OPTIONS.map((option) => {
            const isSelected = formData.walkable === option.id;
            return (
              <Button
                key={option.id}
                variant="outline"
                className={`w-full justify-start h-auto py-3 px-4 ${
                  isSelected ? 'border-primary bg-primary/5' : 'bg-card'
                }`}
                onClick={() => onUpdate({ walkable: option.id as CityWalkability })}
              >
                <span className="flex-1 text-left">{option.label}</span>
                {isSelected && <Check className="w-5 h-5 text-primary" />}
              </Button>
            );
          })}
        </div>
      </div>
      
      {/* Rhythm */}
      <div className="space-y-3">
        <Label>Ritmo medio della città</Label>
        <div className="grid grid-cols-3 gap-2">
          {CITY_RHYTHM_OPTIONS.map((option) => {
            const isSelected = formData.rhythm === option.id;
            return (
              <Button
                key={option.id}
                variant={isSelected ? 'default' : 'outline'}
                className={`h-auto py-3 flex flex-col items-center gap-1 ${!isSelected && 'bg-card'}`}
                onClick={() => onUpdate({ rhythm: option.id as CityRhythm })}
              >
                <span className="text-sm font-medium">{option.label}</span>
                <span className="text-xs opacity-70">{option.description}</span>
              </Button>
            );
          })}
        </div>
      </div>
      
      {/* Best times */}
      <div className="space-y-3">
        <Label>Quando dà il meglio?</Label>
        <div className="flex flex-wrap gap-2">
          {BEST_TIME_OF_DAY_OPTIONS.map((time) => {
            const isSelected = formData.best_times.includes(time.id);
            return (
              <Button
                key={time.id}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                className={`h-auto py-2 px-3 ${!isSelected && 'bg-card'}`}
                onClick={() => toggleBestTime(time.id)}
              >
                <span className="mr-1.5">{time.icon}</span>
                {time.label}
                {isSelected && <Check className="w-3 h-3 ml-1.5" />}
              </Button>
            );
          })}
        </div>
      </div>
      
      {/* Tourist errors */}
      <div className="space-y-2">
        <Label htmlFor="tourist_errors" className="flex items-center gap-2">
          Errori tipici dei turisti
        </Label>
        <Textarea
          id="tourist_errors"
          value={formData.tourist_errors}
          onChange={(e) => onUpdate({ tourist_errors: e.target.value })}
          placeholder="Es: Vanno tutti nello stesso posto, non sanno che..."
          className="bg-card resize-none min-h-[80px]"
          maxLength={500}
        />
      </div>
      
      {/* Local warning */}
      <div className="space-y-2">
        <Label htmlFor="local_warning" className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-gold" />
          Warning da local
        </Label>
        <Textarea
          id="local_warning"
          value={formData.local_warning}
          onChange={(e) => onUpdate({ local_warning: e.target.value })}
          placeholder="Es: Tutto chiude presto, meglio non andarci il lunedì..."
          className="bg-card resize-none min-h-[80px]"
          maxLength={300}
        />
        <p className="text-xs text-muted-foreground">
          Un consiglio generale che vale per tutta la città
        </p>
      </div>
    </motion.div>
  );
}
