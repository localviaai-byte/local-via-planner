import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WizardProgress } from '@/components/ui/WizardProgress';
import { StepDestination } from './StepDestination';
import { StepInterests } from './StepInterests';
import { StepRhythm } from './StepRhythm';
import { StepFood } from './StepFood';
import { StepStyle } from './StepStyle';
import { defaultPreferences, type TripPreferences } from '@/lib/mockData';

const steps = [
  { id: 'destination', label: 'Destinazione' },
  { id: 'interests', label: 'Interessi' },
  { id: 'rhythm', label: 'Ritmo' },
  { id: 'food', label: 'Gusti' },
  { id: 'style', label: 'Stile' },
];

interface PlanningWizardProps {
  onComplete: (preferences: TripPreferences) => void;
  onBack?: () => void;
}

export function PlanningWizard({ onComplete, onBack }: PlanningWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<TripPreferences>(defaultPreferences);

  const updatePreferences = (updates: Partial<TripPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return (preferences.cityObjects?.length ?? 0) > 0 || (preferences.cities?.length > 0) || preferences.city !== '';
      case 1:
        return preferences.interests.length > 0;
      case 2:
      case 3:
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete(preferences);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepDestination preferences={preferences} onUpdate={updatePreferences} />;
      case 1:
        return <StepInterests preferences={preferences} onUpdate={updatePreferences} />;
      case 2:
        return <StepRhythm preferences={preferences} onUpdate={updatePreferences} />;
      case 3:
        return <StepFood preferences={preferences} onUpdate={updatePreferences} />;
      case 4:
        return <StepStyle preferences={preferences} onUpdate={updatePreferences} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Header — fixed */}
      <header className="shrink-0 bg-background border-b border-border/40">
        <div className="max-w-lg mx-auto px-4 py-3">
          <WizardProgress currentStep={currentStep} totalSteps={steps.length} steps={steps} />
        </div>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <div className="max-w-lg mx-auto px-4 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer — fixed */}
      <footer className="shrink-0 bg-background border-t border-border/40 pb-safe-bottom">
        <div className="max-w-lg mx-auto px-4 py-3 flex gap-3">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-11"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Indietro
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            variant={currentStep === steps.length - 1 ? 'hero' : 'default'}
            className={`flex-1 h-11 ${currentStep === 0 ? 'w-full' : ''}`}
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Sparkles className="w-4 h-4 mr-1.5" />
                Genera Itinerario
              </>
            ) : (
              <>
                Continua
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
