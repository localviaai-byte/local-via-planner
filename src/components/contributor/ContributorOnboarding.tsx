import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Sparkles, Send, CheckCircle, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ONBOARDING_KEY = 'localvia_contributor_onboarding_completed';

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: string;
}

const steps: OnboardingStep[] = [
  {
    icon: <Sparkles className="w-8 h-8 text-terracotta" />,
    title: 'Benvenuto in LocalVia! 🎉',
    description: 'Sei un Local Contributor: il tuo compito è trasformare i luoghi della tua città in consigli autentici che solo un vero locale può dare.',
    highlight: 'Non cerchiamo recensioni turistiche, ma il consiglio che daresti a un amico.',
  },
  {
    icon: <MapPin className="w-8 h-8 text-terracotta" />,
    title: 'Classifica i luoghi',
    description: 'Nella sezione "Bozze da completare" trovi luoghi già segnalati che hanno bisogno del tuo tocco da local. Clicca su uno di essi per completare le informazioni.',
    highlight: 'Ogni luogo ha bisogno di una "frase da local" che ne catturi l\'essenza.',
  },
  {
    icon: <Send className="w-8 h-8 text-terracotta" />,
    title: 'Aggiungi nuovi posti',
    description: 'Conosci un posto che manca? Usa il pulsante "Aggiungi Luogo" per segnalarlo. Compila il wizard passo-passo con tutte le info che un viaggiatore dovrebbe sapere.',
    highlight: 'Meglio pochi luoghi ben descritti che tanti superficiali!',
  },
  {
    icon: <CheckCircle className="w-8 h-8 text-terracotta" />,
    title: 'Il processo di revisione',
    description: 'Dopo aver completato un luogo, invialo in revisione. Un editor verificherà le informazioni e, se tutto ok, il luogo verrà pubblicato sulla piattaforma.',
    highlight: 'Bozza → In revisione → Approvato ✓',
  },
];

interface ContributorOnboardingProps {
  onComplete?: () => void;
}

export function ContributorOnboarding({ onComplete }: ContributorOnboardingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasCompleted = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompleted) {
      // Small delay to let the page render first
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOpen(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOpen(false);
    onComplete?.();
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleSkip()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Onboarding Contributor</DialogTitle>
        </DialogHeader>
        
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <motion.div
            className="h-full bg-terracotta"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors z-10"
          aria-label="Salta onboarding"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="p-6 pt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-terracotta/10 flex items-center justify-center mx-auto">
                {step.icon}
              </div>

              {/* Title */}
              <h2 className="text-xl font-display font-semibold text-center">
                {step.title}
              </h2>

              {/* Description */}
              <p className="text-muted-foreground text-center leading-relaxed">
                {step.description}
              </p>

              {/* Highlight */}
              {step.highlight && (
                <div className="bg-terracotta/5 border border-terracotta/20 rounded-lg p-3 text-sm text-center">
                  <span className="text-terracotta font-medium">{step.highlight}</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 space-y-4">
          {/* Step indicators */}
          <div className="flex justify-center gap-1.5">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-terracotta'
                    : index < currentStep
                    ? 'bg-terracotta/50'
                    : 'bg-muted'
                }`}
                aria-label={`Vai allo step ${index + 1}`}
              />
            ))}
          </div>

          {/* Action button */}
          <Button
            onClick={handleNext}
            className="w-full bg-terracotta hover:bg-terracotta/90"
          >
            {isLastStep ? (
              <>
                Inizia a contribuire
                <CheckCircle className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Continua
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          {/* Skip link */}
          {!isLastStep && (
            <button
              onClick={handleSkip}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Salta introduzione
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper to reset onboarding (for testing)
export function resetContributorOnboarding() {
  localStorage.removeItem(ONBOARDING_KEY);
}
