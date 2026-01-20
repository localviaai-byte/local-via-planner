import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HeroSection } from '@/components/landing/HeroSection';
import { PlanningWizard } from '@/components/wizard/PlanningWizard';
import { ItineraryViewer } from '@/components/itinerary/ItineraryViewer';
import { type TripPreferences } from '@/lib/mockData';

type AppState = 'landing' | 'wizard' | 'itinerary';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('landing');
  const [preferences, setPreferences] = useState<TripPreferences | null>(null);

  const handleStartPlanning = () => {
    setAppState('wizard');
  };

  const handleWizardComplete = (prefs: TripPreferences) => {
    setPreferences(prefs);
    setAppState('itinerary');
  };

  const handleBackToWizard = () => {
    setAppState('wizard');
  };

  return (
    <AnimatePresence mode="wait">
      {appState === 'landing' && (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <HeroSection onStart={handleStartPlanning} />
        </motion.div>
      )}

      {appState === 'wizard' && (
        <motion.div
          key="wizard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <PlanningWizard onComplete={handleWizardComplete} />
        </motion.div>
      )}

      {appState === 'itinerary' && preferences && (
        <motion.div
          key="itinerary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ItineraryViewer 
            preferences={preferences} 
            onBack={handleBackToWizard} 
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Index;
