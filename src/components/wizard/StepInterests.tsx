import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { interests, type TripPreferences } from '@/lib/mockData';
import { InterestChip } from '@/components/ui/InterestChip';

interface StepInterestsProps {
  preferences: TripPreferences;
  onUpdate: (updates: Partial<TripPreferences>) => void;
}

export function StepInterests({ preferences, onUpdate }: StepInterestsProps) {
  const toggleInterest = (id: string) => {
    const currentInterests = [...preferences.interests];
    const currentTop = [...preferences.topInterests];
    
    if (currentInterests.includes(id)) {
      // Remove from both lists
      onUpdate({
        interests: currentInterests.filter(i => i !== id),
        topInterests: currentTop.filter(i => i !== id),
      });
    } else {
      // Add to interests
      const newInterests = [...currentInterests, id];
      // Auto-add to top 3 if less than 3 selected
      const newTop = currentTop.length < 3 ? [...currentTop, id] : currentTop;
      onUpdate({
        interests: newInterests,
        topInterests: newTop,
      });
    }
  };

  const getPriority = (id: string) => {
    const index = preferences.topInterests.indexOf(id);
    return index === -1 ? 0 : index + 1;
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
          Cosa ti interessa?
        </h2>
        <p className="text-muted-foreground">
          Seleziona i tuoi interessi. I primi 3 avranno priorità.
        </p>
      </div>

      {/* Selected count indicator */}
      <div className="flex items-center justify-center gap-2 p-3 bg-secondary rounded-xl">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm">
          <span className="font-semibold text-primary">{preferences.interests.length}</span>
          {' '}interessi selezionati
          {preferences.topInterests.length > 0 && (
            <span className="text-muted-foreground">
              {' '}• Top {preferences.topInterests.length}: {preferences.topInterests.map(id => 
                interests.find(i => i.id === id)?.label
              ).join(', ')}
            </span>
          )}
        </span>
      </div>

      {/* Interest chips grid */}
      <div className="grid grid-cols-2 gap-3">
        {interests.map((interest, index) => (
          <motion.div
            key={interest.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <InterestChip
              id={interest.id}
              label={interest.label}
              icon={interest.icon}
              selected={preferences.interests.includes(interest.id)}
              priority={getPriority(interest.id)}
              onToggle={toggleInterest}
            />
          </motion.div>
        ))}
      </div>

      {preferences.interests.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-muted-foreground"
        >
          Seleziona almeno un interesse per continuare
        </motion.p>
      )}
    </motion.div>
  );
}
