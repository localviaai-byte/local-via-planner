import { motion } from 'framer-motion';
import { interests, type TripPreferences } from '@/lib/mockData';
import { InterestChip } from '@/components/ui/InterestChip';

interface StepInterestsProps {
  preferences: TripPreferences;
  onUpdate: (updates: Partial<TripPreferences>) => void;
}

export function StepInterests({ preferences, onUpdate }: StepInterestsProps) {
  const toggleInterest = (id: string) => {
    const currentInterests = [...preferences.interests];
    
    if (currentInterests.includes(id)) {
      const newInterests = currentInterests.filter(i => i !== id);
      onUpdate({ interests: newInterests, topInterests: newInterests.slice(0, 3) });
    } else {
      const newInterests = [...currentInterests, id];
      onUpdate({ interests: newInterests, topInterests: newInterests.slice(0, 3) });
    }
  };

  const getPriority = (id: string) => {
    const index = preferences.interests.indexOf(id);
    return index === -1 ? 0 : index + 1;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="text-center mb-1">
        <h2 className="font-display text-xl font-semibold text-foreground tracking-tight">
          Cosa ti interessa?
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Rispondi come se stessi parlando a un amico
        </p>
      </div>

      {/* Selected count */}
      {preferences.interests.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-xs text-muted-foreground"
        >
          <span className="font-medium text-primary">{preferences.interests.length}</span>
          {' '}selezionati
          {preferences.topInterests.length > 0 && (
            <span>
              {' '}· Top: {preferences.topInterests.slice(0, 3).map(id => 
                interests.find(i => i.id === id)?.label
              ).join(', ')}
            </span>
          )}
        </motion.div>
      )}

      {/* Interest chips */}
      <div className="grid grid-cols-2 gap-2">
        {interests.map((interest, index) => (
          <motion.div
            key={interest.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
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
        <p className="text-center text-xs text-muted-foreground">
          Seleziona almeno un interesse per continuare
        </p>
      )}
    </motion.div>
  );
}
