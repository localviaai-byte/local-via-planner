import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HeroSection } from '@/components/landing/HeroSection';
import { PlanningWizard } from '@/components/wizard/PlanningWizard';
import { ItineraryViewer } from '@/components/itinerary/ItineraryViewer';
import { useGenerateItinerary, type GeneratedItinerary } from '@/hooks/useGenerateItinerary';
import { type TripPreferences } from '@/lib/mockData';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SelectedProductsProvider } from '@/contexts/SelectedProductsContext';
import { TripPlanProvider } from '@/contexts/TripPlanContext';

type AppState = 'landing' | 'wizard' | 'generating' | 'itinerary' | 'error';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('landing');
  const [preferences, setPreferences] = useState<TripPreferences | null>(null);
  const [generatedData, setGeneratedData] = useState<GeneratedItinerary | null>(null);
  const { generate, isLoading, error } = useGenerateItinerary();

  const handleStartPlanning = () => {
    setAppState('wizard');
  };

  const handleWizardComplete = async (prefs: TripPreferences) => {
    setPreferences(prefs);
    setAppState('generating');

    const result = await generate(prefs);
    
    if (result) {
      setGeneratedData(result);
      setAppState('itinerary');
    } else {
      setAppState('error');
    }
  };

  const handleRetry = async () => {
    if (preferences) {
      setAppState('generating');
      const result = await generate(preferences);
      
      if (result) {
        setGeneratedData(result);
        setAppState('itinerary');
      } else {
        setAppState('error');
      }
    }
  };

  const handleBackToWizard = () => {
    setAppState('wizard');
  };

  const handleRegenerate = async () => {
    if (preferences) {
      setAppState('generating');
      const result = await generate(preferences);
      
      if (result) {
        setGeneratedData(result);
        setAppState('itinerary');
      } else {
        setAppState('error');
      }
    }
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

      {appState === 'generating' && (
        <motion.div
          key="generating"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-background flex flex-col items-center justify-center px-4"
        >
          <div className="text-center max-w-md">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 mx-auto mb-6"
            >
              <Sparkles className="w-full h-full text-primary" />
            </motion.div>
            
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              Creo il tuo itinerario
            </h2>
            
            <p className="text-muted-foreground mb-2">
              L'AI sta analizzando i luoghi migliori per te...
            </p>
            
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Potrebbero volerci alcuni secondi</span>
            </div>
          </div>
        </motion.div>
      )}

      {appState === 'error' && (
        <motion.div
          key="error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-background flex flex-col items-center justify-center px-4"
        >
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 text-4xl">😕</div>
            
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              Ops, qualcosa è andato storto
            </h2>
            
            <p className="text-muted-foreground mb-6">
              {error === 'rate_limit' && 'Troppe richieste. Riprova tra qualche secondo.'}
              {error === 'credits' && 'I crediti AI sono esauriti.'}
              {error === 'Nessun luogo approvato per questa città' && 
                'Non ci sono ancora luoghi approvati per questa città. Aggiungili dal backoffice!'}
              {!['rate_limit', 'credits', 'Nessun luogo approvato per questa città'].includes(error || '') && 
                'Non siamo riusciti a generare l\'itinerario. Riprova!'}
            </p>
            
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleBackToWizard}>
                Modifica preferenze
              </Button>
              <Button onClick={handleRetry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Riprova
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {appState === 'itinerary' && preferences && generatedData && (
        <motion.div
          key="itinerary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <SelectedProductsProvider>
            <TripPlanProvider>
              <ItineraryViewer 
                preferences={preferences}
                generatedData={generatedData}
                onBack={handleBackToWizard}
                onRegenerate={handleRegenerate}
              />
            </TripPlanProvider>
          </SelectedProductsProvider>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Index;
