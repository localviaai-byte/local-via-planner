import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';

// Plan states as defined in the spec
export type PlanStatus = 
  | 'DRAFT'           // In modifica
  | 'SAVED'           // Salvato, senza extra
  | 'SAVED_WITH_EXTRAS' // Salvato, con extra selezionati
  | 'CONFIRMED_WITH_EXTRAS'; // Extra pagati

interface TripPlanContextType {
  // Plan state
  planStatus: PlanStatus;
  planId: string | null;
  isSaving: boolean;
  
  // Actions
  savePlan: () => Promise<boolean>;
  setPlanStatus: (status: PlanStatus) => void;
  
  // Flow control
  hasShownPostSaveSheet: boolean;
  setHasShownPostSaveSheet: (shown: boolean) => void;
  
  // Checkout state
  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  completeCheckout: () => Promise<boolean>;
}

const TripPlanContext = createContext<TripPlanContextType | null>(null);

interface TripPlanProviderProps {
  children: ReactNode;
}

export function TripPlanProvider({ children }: TripPlanProviderProps) {
  const [planStatus, setPlanStatus] = useState<PlanStatus>('DRAFT');
  const [planId, setPlanId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasShownPostSaveSheet, setHasShownPostSaveSheet] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const savePlan = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    
    try {
      // Simulate saving to DB (in real implementation, use useTripPlans hooks)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate a mock plan ID
      const newPlanId = `plan_${Date.now()}`;
      setPlanId(newPlanId);
      
      // Plan saved successfully
      toast.success('Piano salvato', {
        duration: 2000,
      });
      
      return true;
    } catch (error) {
      toast.error('Errore nel salvataggio');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const openCheckout = useCallback(() => {
    setIsCheckoutOpen(true);
  }, []);

  const closeCheckout = useCallback(() => {
    setIsCheckoutOpen(false);
  }, []);

  const completeCheckout = useCallback(async (): Promise<boolean> => {
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPlanStatus('CONFIRMED_WITH_EXTRAS');
      setIsCheckoutOpen(false);
      
      toast.success('Esperienze confermate! 🎉', {
        description: 'Riceverai una email con tutti i dettagli',
        duration: 4000,
      });
      
      return true;
    } catch (error) {
      toast.error('Errore nel pagamento');
      return false;
    }
  }, []);

  const value: TripPlanContextType = {
    planStatus,
    planId,
    isSaving,
    savePlan,
    setPlanStatus,
    hasShownPostSaveSheet,
    setHasShownPostSaveSheet,
    isCheckoutOpen,
    openCheckout,
    closeCheckout,
    completeCheckout,
  };

  return (
    <TripPlanContext.Provider value={value}>
      {children}
    </TripPlanContext.Provider>
  );
}

export function useTripPlan() {
  const context = useContext(TripPlanContext);
  if (!context) {
    throw new Error('useTripPlan must be used within a TripPlanProvider');
  }
  return context;
}
