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
      {/* Editorial header */}
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-semibold text-foreground mb-3 tracking-tight">
          Cosa ti interessa?
        </h2>
        <p className="text-muted-foreground">
          Rispondi come se stessi parlando a un amico
        </p>
      </div>

      {/* Selected count indicator - subtle */}
      {preferences.interests.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-muted-foreground"
        >
          <span className="font-medium text-primary">{preferences.interests.length}</span>
          {' '}selezionati
          {preferences.topInterests.length > 0 && (
            <span>
              {' '}• Top: {preferences.topInterests.slice(0, 3).map(id => 
                interests.find(i => i.id === id)?.label
              ).join(', ')}
            </span>
          )}
        </motion.div>
      )}

      {/* Interest chips grid - 2 columns for mobile */}
      <div className="grid grid-cols-2 gap-3">
        {interests.map((interest, index) => (
          <motion.div
            key={interest.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
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
