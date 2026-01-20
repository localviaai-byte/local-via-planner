import { motion } from 'framer-motion';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: { id: string; label: string }[];
}

export function WizardProgress({ currentStep, totalSteps, steps }: WizardProgressProps) {
  const progress = ((currentStep) / (totalSteps - 1)) * 100;

  return (
    <div className="px-4">
      {/* Step indicator - minimal */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">
          Passo {currentStep + 1} di {totalSteps}
        </span>
        <span className="text-sm font-medium text-foreground">
          {steps[currentStep]?.label}
        </span>
      </div>

      {/* Progress bar - subtle, not tech */}
      <div className="h-1 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(progress, 5)}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
