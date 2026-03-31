import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FOOD_PRIMARY_OPTIONS, 
  FOOD_SECONDARY_OPTIONS, 
  ATMOSPHERE_OPTIONS,
  USER_BUDGET_OPTIONS,
} from '@/types/database';
import { dietaryRestrictions, type TripPreferences } from '@/lib/mockData';
import { useAvailableFoodOptions } from '@/hooks/useAvailableFoodOptions';

interface StepFoodProps {
  preferences: TripPreferences;
  onUpdate: (updates: Partial<TripPreferences>) => void;
}

export function StepFood({ preferences, onUpdate }: StepFoodProps) {
  const [showSecondary, setShowSecondary] = useState(false);
  const { data: availableOptions, isLoading: isLoadingOptions } = useAvailableFoodOptions(preferences.cities?.[0] || preferences.city);

  const isMultiDay = preferences.numDays > 1;

  const filteredPrimaryOptions = useMemo(() => {
    if (!availableOptions) return [];
    return FOOD_PRIMARY_OPTIONS.filter(opt => availableOptions.foodPrimary.includes(opt.id));
  }, [availableOptions]);

  const filteredSecondaryOptions = useMemo(() => {
    if (!availableOptions) return [];
    return FOOD_SECONDARY_OPTIONS.filter(opt => availableOptions.foodSecondary.includes(opt.id));
  }, [availableOptions]);

  const toggleFoodPrimary = (id: string) => {
    const current = [...(preferences.foodPrimary ?? [])];
    if (current.includes(id)) {
      onUpdate({ foodPrimary: current.filter(c => c !== id) });
    } else {
      onUpdate({ foodPrimary: isMultiDay ? [...current, id] : [id] });
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="text-center mb-1">
        <h2 className="font-display text-xl font-semibold text-foreground tracking-tight">
          Cosa ti va di mangiare?
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isMultiDay 
            ? 'Puoi selezionare più opzioni per variare'
            : 'Un viaggio si ricorda anche per quello che si mangia'
          }
        </p>
      </div>

      {/* Food Primary */}
      <div className="space-y-2">
        {isLoadingOptions ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Carico le opzioni...</span>
          </div>
        ) : filteredPrimaryOptions.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">
            Nessuna opzione food disponibile
          </p>
        ) : (
        <div className="grid grid-cols-2 gap-2">
          {filteredPrimaryOptions.map((food) => (
            <button key={food.id} type="button" onClick={() => toggleFoodPrimary(food.id)}
              className={`p-3 rounded-xl text-left transition-all duration-200 cursor-pointer flex items-center gap-2.5 border-2
                ${(preferences.foodPrimary ?? []).includes(food.id)
                  ? 'bg-primary/15 border-primary shadow-md'
                  : 'bg-card border-transparent hover:shadow-soft'
                }`}>
              <span className="text-xl">{food.icon}</span>
              <span className="font-medium text-foreground text-sm">{food.label}</span>
            </button>
          ))}
        </div>
        )}
      </div>

      {/* Food Secondary */}
      <AnimatePresence>
        {hasFoodSelected && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
            <button type="button" onClick={() => setShowSecondary(!showSecondary)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground cursor-pointer">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              Qualcosa di specifico?
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSecondary ? 'rotate-180' : ''}`} />
            </button>
            
            {showSecondary && filteredSecondaryOptions.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-1.5">
                {filteredSecondaryOptions.map((opt) => (
                  <button key={opt.id} type="button" onClick={() => toggleFoodSecondary(opt.id)}
                    className={`px-2.5 py-1.5 rounded-full text-xs transition-all cursor-pointer flex items-center gap-1
                      ${(preferences.foodSecondary ?? []).includes(opt.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-foreground hover:shadow-soft'
                      }`}>
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
      <div className="space-y-2">
        <h3 className="font-display text-base font-semibold text-foreground tracking-tight">
          Che atmosfera preferisci?
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {ATMOSPHERE_OPTIONS.map((atm) => (
            <button key={atm.id} type="button" onClick={() => toggleAtmosphere(atm.id)}
              className={`p-3 rounded-xl text-left transition-all duration-200 cursor-pointer flex items-center gap-2.5 border-2
                ${(preferences.atmospherePreferences ?? []).includes(atm.id)
                  ? 'bg-primary/15 border-primary shadow-md'
                  : 'bg-card border-transparent hover:shadow-soft'
                }`}>
              <span className="text-xl">{atm.icon}</span>
              <span className="font-medium text-foreground text-xs">{atm.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="space-y-2">
        <h3 className="font-display text-base font-semibold text-foreground tracking-tight">
          Quanto vuoi spendere?
        </h3>
        <div className="grid grid-cols-4 gap-1.5">
          {USER_BUDGET_OPTIONS.map((option) => (
            <Button key={option.id} type="button"
              variant={preferences.foodBudget === option.id ? 'default' : 'outline'}
              onClick={() => onUpdate({ foodBudget: option.id as TripPreferences['foodBudget'] })}
              className="h-auto py-3 flex flex-col gap-0.5">
              <span className="text-sm font-semibold">{option.label}</span>
              <span className="text-[9px] opacity-70">{option.description}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Dietary Restrictions */}
      <div className="space-y-2">
        <h3 className="font-display text-base font-semibold text-foreground tracking-tight">
          Esigenze alimentari
        </h3>
        <div className="space-y-1.5">
          {dietaryRestrictions.map((restriction) => (
            <button key={restriction.id} type="button" onClick={() => toggleRestriction(restriction.id)}
              className="flex w-full items-center gap-3 p-3 bg-card rounded-xl cursor-pointer transition-all hover:shadow-soft text-left">
              <Checkbox
                checked={(preferences.dietaryRestrictions ?? []).includes(restriction.id)}
                onClick={(e) => e.stopPropagation()}
                onCheckedChange={() => toggleRestriction(restriction.id)}
              />
              <span className="text-xs font-medium text-foreground">{restriction.label}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
