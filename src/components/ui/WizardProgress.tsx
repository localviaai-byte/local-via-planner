import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: { id: string; label: string }[];
}

export function WizardProgress({ currentStep, totalSteps, steps }: WizardProgressProps) {
  return (
    <div className="w-full px-4">
      {/* Progress bar */}
      <div className="relative h-1 bg-secondary rounded-full overflow-hidden mb-6">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-hero rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Step indicators - mobile: just numbers, desktop: with labels */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center">
              <motion.div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  transition-colors duration-300
                  ${isCompleted 
                    ? 'bg-primary text-primary-foreground' 
                    : isCurrent 
                      ? 'bg-gradient-hero text-primary-foreground shadow-card' 
                      : 'bg-secondary text-muted-foreground'
                  }
                `}
                initial={false}
                animate={isCurrent ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </motion.div>
              <span className="hidden md:block mt-2 text-xs text-muted-foreground max-w-[80px] text-center">
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
