import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

// Plan states as defined in the spec
export type PlanStatus = 
  | 'DRAFT'           // In modifica
  | 'SAVED'           // Salvato, senza extra
  | 'SAVED_WITH_EXTRAS' // Salvato, con extra selezionati
  | 'CONFIRMED_WITH_EXTRAS'; // Extra pagati

interface SavePlanParams {
  cityId: string;
  title?: string;
  days?: number;
  preferences?: Record<string, unknown>;
  slots?: Array<{
    place_id?: string;
    product_id?: string;
    item_type: 'place' | 'product';
    day_index: number;
    start_time?: string;
    end_time?: string;
    slot_type?: string;
    sort_order?: number;
  }>;
}

interface TripPlanContextType {
  // Plan state
  planStatus: PlanStatus;
  planId: string | null;
  isSaving: boolean;
  
  // Actions
  savePlan: (params: SavePlanParams) => Promise<boolean>;
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

  const savePlan = useCallback(async (params: SavePlanParams): Promise<boolean> => {
    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create the trip plan
      const { data: plan, error: planError } = await supabase
        .from('trip_plans')
        .insert({
          city_id: params.cityId,
          user_id: user?.id || null,
          title: params.title || null,
          days: params.days || 1,
          preferences: (params.preferences || {}) as Json,
        })
        .select()
        .single();
      
      if (planError) throw planError;
      
      // Insert plan items if provided
      if (params.slots?.length) {
        const items = params.slots.map(slot => ({
          plan_id: plan.id,
          item_type: slot.item_type as 'place' | 'product',
          place_id: slot.place_id || null,
          product_id: slot.product_id || null,
          day_index: slot.day_index,
          start_time: slot.start_time || null,
          end_time: slot.end_time || null,
          slot_type: slot.slot_type || null,
          sort_order: slot.sort_order || 0,
        }));
        
        const { error: itemsError } = await supabase
          .from('plan_items')
          .insert(items);
        
        if (itemsError) console.error('Error saving plan items:', itemsError);
      }
      
      setPlanId(plan.id);
      toast.success('Piano salvato! 🎉', { duration: 2000 });
      return true;
    } catch (error) {
      console.error('Error saving plan:', error);
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
