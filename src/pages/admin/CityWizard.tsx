import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WizardProgress } from '@/components/ui/WizardProgress';
import { useAuth } from '@/hooks/useAuth';
import { useCreateCity } from '@/hooks/useCities';
import { useToast } from '@/hooks/use-toast';
import StepCityIdentity from '@/components/admin/city-wizard/StepCityIdentity';
import StepCityStructure from '@/components/admin/city-wizard/StepCityStructure';
import StepCityZones from '@/components/admin/city-wizard/StepCityZones';
import type { CityFormData } from '@/types/database';
import { DEFAULT_CITY_FORM_DATA } from '@/types/database';

const STEPS = [
  { id: 'identity', label: 'Identità' },
  { id: 'structure', label: 'Struttura' },
  { id: 'zones', label: 'Zone' },
];

export default function CityWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const createCity = useCreateCity();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CityFormData>(DEFAULT_CITY_FORM_DATA);
  const [createdCityId, setCreatedCityId] = useState<string | null>(null);
  
  const handleUpdate = (updates: Partial<CityFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };
  
  const canProceed = () => {
    switch (currentStep) {
      case 0: // Identity
        return formData.name.trim().length >= 2;
      case 1: // Structure
        return true; // Optional fields
      case 2: // Zones
        return true; // Optional
      default:
        return false;
    }
  };
  
  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      // If finishing identity step, create the city
      if (currentStep === 0 && !createdCityId) {
        try {
          const newCity = await createCity.mutateAsync({
            ...formData,
            created_by: user!.id,
          });
          setCreatedCityId(newCity.id);
          toast({
            title: 'Città creata!',
            description: 'Ora puoi aggiungere dettagli sulla struttura e le zone.',
          });
        } catch (error) {
          toast({
            title: 'Errore',
            description: 'Non è stato possibile creare la città.',
            variant: 'destructive',
          });
          return;
        }
      }
      setCurrentStep(prev => prev + 1);
    } else {
      // Final step - go to city detail
      navigate(`/admin/cities/${createdCityId}`);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate('/admin');
    }
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepCityIdentity formData={formData} onUpdate={handleUpdate} />;
      case 1:
        return <StepCityStructure formData={formData} onUpdate={handleUpdate} />;
      case 2:
        return <StepCityZones cityId={createdCityId} cityName={formData.name} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b">
        <div className="px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-terracotta" />
              <h1 className="font-display text-lg font-semibold">
                {createdCityId ? 'Configura città' : 'Nuova città'}
              </h1>
            </div>
          </div>
        </div>
        
        <WizardProgress 
          steps={STEPS} 
          currentStep={currentStep}
          totalSteps={STEPS.length}
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
      
      {/* Footer navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-sm border-t p-4">
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleBack}
          >
            Indietro
          </Button>
          <Button 
            className="flex-1"
            onClick={handleNext}
            disabled={!canProceed() || createCity.isPending}
          >
            {createCity.isPending ? (
              'Salvataggio...'
            ) : currentStep === STEPS.length - 1 ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Vai alla città
              </>
            ) : (
              <>
                Avanti
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
