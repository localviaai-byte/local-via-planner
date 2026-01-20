import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
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
}

export function PlanningWizard({ onComplete }: PlanningWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<TripPreferences>(defaultPreferences);

  const updatePreferences = (updates: Partial<TripPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return preferences.city !== '';
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Progress - clean, minimal */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="container max-w-2xl py-4">
          <WizardProgress currentStep={currentStep} totalSteps={steps.length} steps={steps} />
        </div>
      </header>

      {/* Step Content */}
      <main className="flex-1 container max-w-2xl py-6 px-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation Footer - Sticky CTA, thumb-friendly */}
      <footer className="sticky bottom-0 bg-background/95 backdrop-blur-sm pb-safe-bottom">
        <div className="container max-w-2xl py-4 px-5 flex gap-3">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Indietro
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            variant={currentStep === steps.length - 1 ? 'hero' : 'default'}
            className={`flex-1 ${currentStep === 0 ? 'w-full' : ''}`}
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Genera Itinerario
              </>
            ) : (
              <>
                Continua
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
