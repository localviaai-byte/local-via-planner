import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useCities, useCreatePlace, usePlace, useUpdatePlace } from '@/hooks/usePlaces';
import { useCity } from '@/hooks/useCities';
import { WizardProgress } from '@/components/ui/WizardProgress';
import { ChevronLeft, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import StepContext from '@/components/admin/wizard/StepContext';
import StepIdentity from '@/components/admin/wizard/StepIdentity';
import StepWhy from '@/components/admin/wizard/StepWhy';
import StepSocial from '@/components/admin/wizard/StepSocial';
import StepVibe from '@/components/admin/wizard/StepVibe';
import StepInsider from '@/components/admin/wizard/StepInsider';
import StepEffort from '@/components/admin/wizard/StepEffort';
import StepTiming from '@/components/admin/wizard/StepTiming';
import StepWarning from '@/components/admin/wizard/StepWarning';
import StepOneLiner from '@/components/admin/wizard/StepOneLiner';

import type { PlaceFormData, Place } from '@/types/database';
import { DEFAULT_PLACE_FORM_DATA } from '@/types/database';

const STEPS = [
  { id: 'context', label: 'Tipo di luogo' },
  { id: 'identity', label: 'Info base' },
  { id: 'why', label: 'Perché ci vai' },
  { id: 'social', label: 'Social & Vibe' },
  { id: 'vibe', label: 'Atmosfera' },
  { id: 'insider', label: 'Insider' },
  { id: 'effort', label: 'Effort' },
  { id: 'timing', label: 'Quando funziona' },
  { id: 'warning', label: 'Segreti local' },
  { id: 'oneliner', label: 'La frase' },
];

// Helper to map Place (DB) to PlaceFormData
function placeToFormData(place: Place): PlaceFormData {
  return {
    city_id: place.city_id,
    place_type: place.place_type,
    zone_id: place.zone_id,
    name: place.name,
    address: place.address || '',
    zone: place.zone || '',
    photo_url: place.photo_url || '',
    latitude: place.latitude ?? null,
    longitude: place.longitude ?? null,
    why_people_go: place.why_people_go || [],
    why_other: place.why_other || '',
    social_level: place.social_level ?? 3,
    solo_friendly: place.solo_friendly ?? false,
    flirt_friendly: place.flirt_friendly ?? false,
    group_friendly: place.group_friendly ?? false,
    target_audience: place.target_audience,
    gender_balance: place.gender_balance,
    mood_primary: place.mood_primary,
    mood_secondary: place.mood_secondary,
    vibe_calm_to_energetic: place.vibe_calm_to_energetic ?? 3,
    vibe_quiet_to_loud: place.vibe_quiet_to_loud ?? 3,
    vibe_empty_to_crowded: place.vibe_empty_to_crowded ?? 3,
    vibe_touristy_to_local: place.vibe_touristy_to_local ?? 3,
    tourist_trap: place.tourist_trap ?? false,
    overrated: place.overrated ?? false,
    local_secret: place.local_secret ?? false,
    ideal_for: place.ideal_for || [],
    physical_effort: place.physical_effort,
    mental_effort: place.mental_effort,
    suggested_stay: place.suggested_stay,
    best_days: place.best_days || [],
    best_times: place.best_times || [],
    periods_to_avoid: place.periods_to_avoid || '',
    dead_times_note: place.dead_times_note || '',
    local_warning: place.local_warning || '',
    local_one_liner: place.local_one_liner || '',
    // Type-specific
    duration_minutes: place.duration_minutes,
    indoor_outdoor: place.indoor_outdoor,
    crowd_level: place.crowd_level,
    pace: place.pace,
    cuisine_type: place.cuisine_type || '',
    price_range: place.price_range,
    meal_time: place.meal_time,
    shared_tables: place.shared_tables ?? false,
    bar_time: place.bar_time,
    standing_ok: place.standing_ok ?? true,
    drink_focus: place.drink_focus,
    real_start_time: place.real_start_time || '',
    dress_code: place.dress_code || '',
    pre_or_post: place.pre_or_post,
    needs_booking: place.needs_booking ?? false,
    is_repeatable: place.is_repeatable ?? false,
    works_solo: place.works_solo ?? false,
    best_light_time: place.best_light_time || '',
    worth_detour: place.worth_detour ?? false,
    time_to_spend: place.time_to_spend || '',
    best_period: place.best_period,
  };
}

export default function PlaceWizard() {
  const navigate = useNavigate();
  const { cityId, id: placeId } = useParams<{ cityId?: string; id?: string }>();
  const { user } = useAuth();
  const { data: cities } = useCities();
  const { data: currentCity } = useCity(cityId);
  const createPlace = useCreatePlace();
  const updatePlace = useUpdatePlace();
  
  // Fetch existing place if editing
  const { data: existingPlace, isLoading: isLoadingPlace } = usePlace(placeId);
  
  const isEditMode = !!placeId;
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PlaceFormData>({
    ...DEFAULT_PLACE_FORM_DATA,
    city_id: cityId || '',
  });
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // Initialize form with existing place data when editing
  useEffect(() => {
    if (isEditMode && existingPlace && !isFormInitialized) {
      setFormData(placeToFormData(existingPlace));
      setIsFormInitialized(true);
    }
  }, [isEditMode, existingPlace, isFormInitialized]);

  // Set city_id when cityId param changes (for new places)
  useEffect(() => {
    if (cityId && !isEditMode) {
      setFormData(prev => ({ ...prev, city_id: cityId }));
    }
  }, [cityId, isEditMode]);

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
        return !!formData.mood_primary; // Require at least primary mood
      case 5: // Insider
        return true; // All optional
      case 6: // Effort
        return true; // All optional
      case 7: // Timing
        return formData.best_times.length >= 1;
      case 8: // Warning
        return true; // Optional
      case 9: // One-liner
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
        if (isEditMode && placeId) {
          // Update existing place
          await updatePlace.mutateAsync({
            id: placeId,
            ...formData,
          });
          toast.success('Luogo aggiornato con successo!');
        } else {
          // Create new place
          await createPlace.mutateAsync({
            ...formData,
            created_by: user.id,
          });
          toast.success('Luogo salvato con successo!');
        }
        // Navigate back
        const targetCityId = formData.city_id || cityId;
        navigate(targetCityId ? `/admin/cities/${targetCityId}` : '/admin');
      } catch (error) {
        console.error('Error saving place:', error);
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
    const targetCityId = formData.city_id || cityId || existingPlace?.city_id;
    navigate(targetCityId ? `/admin/cities/${targetCityId}` : '/admin');
  };

  // Show loading state when fetching existing place
  if (isEditMode && isLoadingPlace) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-muted-foreground">Caricamento luogo...</span>
        </div>
      </div>
    );
  }

  // Show error if place not found
  if (isEditMode && !isLoadingPlace && !existingPlace) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center p-6">
          <span className="text-xl font-semibold">Luogo non trovato</span>
          <span className="text-muted-foreground">Il luogo richiesto non esiste.</span>
          <Button onClick={() => navigate('/admin')}>Torna alla dashboard</Button>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    const commonProps = {
      formData,
      onUpdate: updateFormData,
    };

    switch (currentStep) {
      case 0:
        return <StepContext {...commonProps} cities={cities || []} />;
      case 1:
        const city = currentCity || cities?.find(c => c.id === formData.city_id);
        return (
          <StepIdentity 
            {...commonProps} 
            cityName={city?.name || ''} 
            cityRegion={city?.region}
            cityLatitude={city?.latitude ? Number(city.latitude) : null}
            cityLongitude={city?.longitude ? Number(city.longitude) : null}
          />
        );
      case 2:
        return <StepWhy {...commonProps} />;
      case 3:
        return <StepSocial {...commonProps} />;
      case 4:
        return <StepVibe {...commonProps} />;
      case 5:
        return <StepInsider {...commonProps} />;
      case 6:
        return <StepEffort {...commonProps} />;
      case 7:
        return <StepTiming {...commonProps} />;
      case 8:
        return <StepWarning {...commonProps} />;
      case 9:
        return <StepOneLiner {...commonProps} cityName={cities?.find(c => c.id === formData.city_id)?.name || ''} />;
      default:
        return null;
    }
  };

  const isSaving = createPlace.isPending || updatePlace.isPending;

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
            {isEditMode ? `Modifica: ${existingPlace?.name || 'luogo'}` : 'Nuovo luogo'}
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
          disabled={!canProceed() || isSaving}
          className="w-full"
        >
          {isSaving
            ? 'Salvataggio...'
            : currentStep === STEPS.length - 1
              ? (isEditMode ? 'Salva modifiche' : 'Salva luogo')
              : 'Continua'
          }
        </Button>
      </div>
    </div>
  );
}
