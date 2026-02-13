import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FOOD_PRIMARY_OPTIONS, 
  FOOD_SECONDARY_OPTIONS, 
  ATMOSPHERE_OPTIONS,
  USER_BUDGET_OPTIONS,
} from '@/types/database';
import { dietaryRestrictions, type TripPreferences } from '@/lib/mockData';

interface StepFoodProps {
  preferences: TripPreferences;
  onUpdate: (updates: Partial<TripPreferences>) => void;
}

export function StepFood({ preferences, onUpdate }: StepFoodProps) {
  const [showSecondary, setShowSecondary] = useState(false);

  const isMultiDay = preferences.numDays > 1;

  const toggleFoodPrimary = (id: string) => {
    const current = [...(preferences.foodPrimary ?? [])];
    if (current.includes(id)) {
      onUpdate({ foodPrimary: current.filter(c => c !== id) });
    } else {
      if (isMultiDay) {
        onUpdate({ foodPrimary: [...current, id] });
      } else {
        onUpdate({ foodPrimary: [id] });
      }
    }
  };

  const toggleFoodSecondary = (id: string) => {
    const current = [...(preferences.foodSecondary ?? [])];
    if (current.includes(id)) {
      onUpdate({ foodSecondary: current.filter(c => c !== id) });
    } else {
      onUpdate({ foodSecondary: [...current, id] });
    }
  };

  const toggleAtmosphere = (id: string) => {
    const current = [...(preferences.atmospherePreferences ?? [])];
    if (current.includes(id)) {
      onUpdate({ atmospherePreferences: current.filter(c => c !== id) });
    } else {
      onUpdate({ atmospherePreferences: [...current, id] });
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

  const hasFoodSelected = (preferences.foodPrimary ?? []).length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-semibold text-foreground mb-3 tracking-tight">
          Cosa ti va di mangiare?
        </h2>
        <p className="text-muted-foreground">
          {isMultiDay 
            ? 'Puoi selezionare più opzioni per variare durante il viaggio'
            : 'Un viaggio si ricorda anche per quello che si mangia'
          }
        </p>
      </div>

      {/* Food Primary */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {FOOD_PRIMARY_OPTIONS.map((food) => (
            <button
              key={food.id}
              type="button"
              onClick={() => toggleFoodPrimary(food.id)}
              className={`
                p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer flex items-center gap-3 border-2
                ${(preferences.foodPrimary ?? []).includes(food.id)
                  ? 'bg-primary/15 border-primary shadow-md'
                  : 'bg-card border-transparent hover:shadow-soft'
                }
              `}
            >
              <span className="text-2xl">{food.icon}</span>
              <span className="font-medium text-foreground">{food.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Food Secondary - conditional */}
      <AnimatePresence>
        {hasFoodSelected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <button
              type="button"
              onClick={() => setShowSecondary(!showSecondary)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground cursor-pointer"
            >
              <UtensilsCrossed className="w-4 h-4" />
              Vuoi qualcosa di specifico?
              <ChevronDown className={`w-4 h-4 transition-transform ${showSecondary ? 'rotate-180' : ''}`} />
            </button>
            
            {showSecondary && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-wrap gap-2"
              >
                {FOOD_SECONDARY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleFoodSecondary(opt.id)}
                    className={`
                      px-3 py-2 rounded-full text-sm transition-all cursor-pointer flex items-center gap-1
                      ${(preferences.foodSecondary ?? []).includes(opt.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-foreground hover:shadow-soft'
                      }
                    `}
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Atmosphere */}
      <div className="space-y-4">
        <h3 className="font-display text-xl font-semibold text-foreground tracking-tight">
          Che atmosfera preferisci?
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {ATMOSPHERE_OPTIONS.map((atm) => (
            <button
              key={atm.id}
              type="button"
              onClick={() => toggleAtmosphere(atm.id)}
              className={`
                p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer flex items-center gap-3 border-2
                ${(preferences.atmospherePreferences ?? []).includes(atm.id)
                  ? 'bg-primary/15 border-primary shadow-md'
                  : 'bg-card border-transparent hover:shadow-soft'
                }
              `}
            >
              <span className="text-2xl">{atm.icon}</span>
              <span className="font-medium text-foreground text-sm">{atm.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="space-y-4">
        <h3 className="font-display text-xl font-semibold text-foreground tracking-tight">
          Quanto vuoi spendere?
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {USER_BUDGET_OPTIONS.map((option) => (
            <Button
              key={option.id}
              type="button"
              variant={preferences.foodBudget === option.id ? 'default' : 'outline'}
              onClick={() => onUpdate({ foodBudget: option.id as TripPreferences['foodBudget'] })}
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
        <h3 className="font-display text-xl font-semibold text-foreground tracking-tight">
          Esigenze alimentari
        </h3>
        <div className="space-y-2">
          {dietaryRestrictions.map((restriction) => (
            <button
              key={restriction.id}
              type="button"
              onClick={() => toggleRestriction(restriction.id)}
              className="flex w-full items-center gap-3 p-4 bg-card rounded-2xl cursor-pointer transition-all hover:shadow-soft text-left"
            >
              <Checkbox
                checked={(preferences.dietaryRestrictions ?? []).includes(restriction.id)}
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
