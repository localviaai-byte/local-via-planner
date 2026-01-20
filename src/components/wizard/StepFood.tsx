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
    const current = [...preferences.cuisinePreferences];
    if (current.includes(id)) {
      onUpdate({ cuisinePreferences: current.filter(c => c !== id) });
    } else {
      onUpdate({ cuisinePreferences: [...current, id] });
    }
  };

  const toggleRestriction = (id: string) => {
    const current = [...preferences.dietaryRestrictions];
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
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-bold text-foreground mb-2">
          Gusti e preferenze
        </h2>
        <p className="text-muted-foreground">
          Un viaggio si ricorda anche per quello che si mangia
        </p>
      </div>

      {/* Cuisine Preferences */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <UtensilsCrossed className="w-4 h-4 text-primary" />
          Tipo di cucina
        </label>
        <div className="grid grid-cols-2 gap-3">
          {cuisineTypes.map((cuisine) => (
            <motion.button
              key={cuisine.id}
              type="button"
              onClick={() => toggleCuisine(cuisine.id)}
              className={`
                p-4 rounded-xl border-2 text-left transition-all
                ${preferences.cuisinePreferences.includes(cuisine.id)
                  ? 'border-primary bg-terracotta-light'
                  : 'border-border bg-card hover:border-primary/50'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="font-medium">{cuisine.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Euro className="w-4 h-4 text-primary" />
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
              className={`h-auto py-4 flex flex-col gap-1 ${
                preferences.budget === option.value ? 'bg-gradient-hero border-0' : ''
              }`}
            >
              <span className="text-lg font-bold">{option.label}</span>
              <span className="text-xs opacity-80">{option.description}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Dietary Restrictions */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <AlertCircle className="w-4 h-4 text-primary" />
          Esigenze alimentari
        </label>
        <div className="space-y-3">
          {dietaryRestrictions.map((restriction) => (
            <label
              key={restriction.id}
              className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/30 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={preferences.dietaryRestrictions.includes(restriction.id)}
                onCheckedChange={() => toggleRestriction(restriction.id)}
              />
              <span className="text-sm font-medium">{restriction.label}</span>
            </label>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
