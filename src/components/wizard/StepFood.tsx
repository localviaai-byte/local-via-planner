import { motion } from 'framer-motion';
import { UtensilsCrossed, Euro, AlertCircle } from 'lucide-react';
import { cuisineTypes, dietaryRestrictions, type TripPreferences } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface StepFoodProps {
  preferences: TripPreferences;
  onUpdate: (updates: Partial<TripPreferences>) => void;
}

export function StepFood({ preferences, onUpdate }: StepFoodProps) {
  const toggleCuisine = (id: string) => {
    const current = [...(preferences.cuisinePreferences ?? [])];
    if (current.includes(id)) {
      onUpdate({ cuisinePreferences: current.filter(c => c !== id) });
    } else {
      onUpdate({ cuisinePreferences: [...current, id] });
    }
  };

  const toggleRestriction = (id: string) => {
    const current = [...(preferences.dietaryRestrictions ?? [])];
    if (current.includes(id)) {
      onUpdate({ dietaryRestrictions: current.filter(r => r !== id) });
    } else {
      onUpdate({ dietaryRestrictions: [...current, id] });
    }
  };

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
          Gusti e preferenze
        </h2>
        <p className="text-muted-foreground">
          Un viaggio si ricorda anche per quello che si mangia
        </p>
      </div>

      {/* Cuisine Preferences */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <UtensilsCrossed className="w-4 h-4" />
          Tipo di cucina
        </label>
        <div className="grid grid-cols-2 gap-3">
          {cuisineTypes.map((cuisine) => (
            <button
              key={cuisine.id}
              type="button"
              onClick={() => toggleCuisine(cuisine.id)}
              onPointerDown={(e) => {
                // Mobile Safari reliability: ensure tap registers even during scroll/animation
                e.preventDefault();
                toggleCuisine(cuisine.id);
              }}
              className={`
                p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer relative z-10
                pointer-events-auto select-none touch-manipulation
                ${preferences.cuisinePreferences.includes(cuisine.id)
                  ? 'bg-card ring-2 ring-primary shadow-card'
                  : 'bg-card hover:shadow-soft'
                }
              `}
            >
              <span className="font-medium text-foreground">{cuisine.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Euro className="w-4 h-4" />
          Budget per i pasti
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 1, label: '€', description: 'Economico' },
            { value: 2, label: '€€', description: 'Medio' },
            { value: 3, label: '€€€', description: 'Alto' },
          ].map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={preferences.budget === option.value ? 'default' : 'outline'}
              onClick={() => onUpdate({ budget: option.value as 1 | 2 | 3 })}
              className="h-auto py-4 flex flex-col gap-1"
            >
              <span className="text-lg font-semibold">{option.label}</span>
              <span className="text-xs opacity-70">{option.description}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Dietary Restrictions */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <AlertCircle className="w-4 h-4" />
          Esigenze alimentari
        </label>
        <div className="space-y-2">
          {dietaryRestrictions.map((restriction) => (
            <button
              key={restriction.id}
              type="button"
              onClick={() => toggleRestriction(restriction.id)}
              className="flex w-full items-center gap-3 p-4 bg-card rounded-2xl cursor-pointer transition-all hover:shadow-soft text-left"
            >
              <Checkbox
                checked={preferences.dietaryRestrictions.includes(restriction.id)}
                onClick={(e) => e.stopPropagation()}
                onCheckedChange={() => toggleRestriction(restriction.id)}
              />
              <span className="text-sm font-medium text-foreground">{restriction.label}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
