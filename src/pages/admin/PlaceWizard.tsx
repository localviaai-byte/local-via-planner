import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useCities, useCreatePlace } from '@/hooks/usePlaces';
import { useCity } from '@/hooks/useCities';
import { WizardProgress } from '@/components/ui/WizardProgress';
import { ChevronLeft, X } from 'lucide-react';
import { toast } from 'sonner';

import StepContext from '@/components/admin/wizard/StepContext';
import StepIdentity from '@/components/admin/wizard/StepIdentity';
import StepWhy from '@/components/admin/wizard/StepWhy';
import StepSocial from '@/components/admin/wizard/StepSocial';
import StepVibe from '@/components/admin/wizard/StepVibe';
import StepTiming from '@/components/admin/wizard/StepTiming';
import StepWarning from '@/components/admin/wizard/StepWarning';
import StepOneLiner from '@/components/admin/wizard/StepOneLiner';

import type { PlaceFormData } from '@/types/database';
import { DEFAULT_PLACE_FORM_DATA } from '@/types/database';

const STEPS = [
  { id: 'context', label: 'Tipo di luogo' },
  { id: 'identity', label: 'Info base' },
  { id: 'why', label: 'Perché ci vai' },
  { id: 'social', label: 'Social & Vibe' },
  { id: 'vibe', label: 'Atmosfera' },
  { id: 'timing', label: 'Quando funziona' },
  { id: 'warning', label: 'Segreti local' },
  { id: 'oneliner', label: 'La frase' },
];

export default function PlaceWizard() {
  const navigate = useNavigate();
  const { cityId } = useParams<{ cityId: string }>();
  const { user } = useAuth();
  const { data: cities } = useCities();
  const { data: currentCity } = useCity(cityId);
  const createPlace = useCreatePlace();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PlaceFormData>({
    ...DEFAULT_PLACE_FORM_DATA,
    city_id: cityId || '',
  });

  // Set city_id when cityId param changes
  useEffect(() => {
    if (cityId) {
      setFormData(prev => ({ ...prev, city_id: cityId }));
    }
  }, [cityId]);

  const updateFormData = (updates: Partial<PlaceFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0: // Context
        return !!formData.city_id && !!formData.place_type;
      case 1: // Identity
        return formData.name.trim().length >= 2;
      case 2: // Why
        return formData.why_people_go.length >= 1;
      case 3: // Social
        return formData.social_level >= 1 && formData.social_level <= 5;
      case 4: // Vibe
        return true; // All have defaults
      case 5: // Timing
        return formData.best_times.length >= 1;
      case 6: // Warning
        return true; // Optional
      case 7: // One-liner
        return formData.local_one_liner.trim().length >= 10 && formData.local_one_liner.length <= 140;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Submit form
      if (!user?.id) {
        toast.error('Devi essere autenticato');
        return;
      }
      
      try {
        await createPlace.mutateAsync({
          ...formData,
          created_by: user.id,
        });
        toast.success('Luogo salvato con successo!');
        navigate(cityId ? `/admin/cities/${cityId}` : '/admin');
      } catch (error) {
        console.error('Error creating place:', error);
        toast.error('Errore nel salvataggio');
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    navigate(cityId ? `/admin/cities/${cityId}` : '/admin');
  };


  const renderStep = () => {
    const commonProps = {
      formData,
      onUpdate: updateFormData,
    };

    switch (currentStep) {
      case 0:
        return <StepContext {...commonProps} cities={cities || []} />;
      case 1:
        return <StepIdentity {...commonProps} />;
      case 2:
        return <StepWhy {...commonProps} />;
      case 3:
        return <StepSocial {...commonProps} />;
      case 4:
        return <StepVibe {...commonProps} />;
      case 5:
        return <StepTiming {...commonProps} />;
      case 6:
        return <StepWarning {...commonProps} />;
      case 7:
        return <StepOneLiner {...commonProps} cityName={cities?.find(c => c.id === formData.city_id)?.name || ''} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => currentStep > 0 ? handleBack() : handleClose()}
          >
            {currentStep > 0 ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
          </Button>
          <span className="text-sm text-muted-foreground">
            Nuovo luogo
          </span>
          <div className="w-10" /> {/* Spacer */}
        </div>
        <WizardProgress
          currentStep={currentStep}
          totalSteps={STEPS.length}
          steps={STEPS}
        />
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 pb-safe-bottom">
        <Button
          onClick={handleNext}
          disabled={!canProceed() || createPlace.isPending}
          className="w-full"
        >
          {createPlace.isPending
            ? 'Salvataggio...'
            : currentStep === STEPS.length - 1
              ? 'Salva luogo'
              : 'Continua'
          }
        </Button>
      </div>
    </div>
  );
}
