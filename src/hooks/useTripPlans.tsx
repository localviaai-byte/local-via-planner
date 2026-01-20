import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { TripPlan, PlanItem, PlanItemType } from '@/types/database';
import type { Json } from '@/integrations/supabase/types';

// =====================================================
// TRIP PLANS
// =====================================================

export function useTripPlans() {
  return useQuery({
    queryKey: ['trip-plans'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from('trip_plans')
        .select(`
          *,
          city:cities(*)
        `)
        .order('created_at', { ascending: false });
      
      // If user is logged in, get their plans
      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        // For anonymous users, we can't query by user_id
        // They would need to store plan_id in localStorage
        return [];
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as TripPlan[];
    },
  });
}

export function useTripPlan(planId: string) {
  return useQuery({
    queryKey: ['trip-plan', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trip_plans')
        .select(`
          *,
          city:cities(*)
        `)
        .eq('id', planId)
        .single();
      
      if (error) throw error;
      return data as TripPlan;
    },
    enabled: !!planId,
  });
}

export function useCreateTripPlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      cityId, 
      title, 
      startDate, 
      days, 
      preferences 
    }: { 
      cityId: string; 
      title?: string; 
      startDate?: string; 
      days?: number;
      preferences?: Json;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('trip_plans')
        .insert([{
          city_id: cityId,
          user_id: user?.id || null,
          title: title || null,
          start_date: startDate || null,
          days: days || 1,
          preferences: preferences || {},
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-plans'] });
      toast.success('Piano creato!');
    },
    onError: (error) => {
      console.error('Error creating trip plan:', error);
      toast.error('Errore nella creazione del piano');
    },
  });
}

export function useUpdateTripPlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      planId, 
      updates 
    }: { 
      planId: string; 
      updates: {
        title?: string | null;
        start_date?: string | null;
        days?: number;
        preferences?: Json;
      };
    }) => {
      const { data, error } = await supabase
        .from('trip_plans')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', planId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trip-plans'] });
      queryClient.invalidateQueries({ queryKey: ['trip-plan', data.id] });
      toast.success('Piano aggiornato!');
    },
    onError: (error) => {
      console.error('Error updating trip plan:', error);
      toast.error('Errore nell\'aggiornamento del piano');
    },
  });
}

export function useDeleteTripPlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('trip_plans')
        .delete()
        .eq('id', planId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-plans'] });
      toast.success('Piano eliminato!');
    },
    onError: (error) => {
      console.error('Error deleting trip plan:', error);
      toast.error('Errore nell\'eliminazione del piano');
    },
  });
}

// =====================================================
// PLAN ITEMS
// =====================================================

export function usePlanItems(planId: string) {
  return useQuery({
    queryKey: ['plan-items', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plan_items')
        .select(`
          *,
          place:places(*),
          product:products(*)
        `)
        .eq('plan_id', planId)
        .order('day_index')
        .order('sort_order');
      
      if (error) throw error;
      return data as PlanItem[];
    },
    enabled: !!planId,
  });
}

export function useAddPlanItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      planId,
      itemType,
      placeId,
      productId,
      dayIndex,
      startTime,
      endTime,
      slotType,
      notes,
      sortOrder,
    }: {
      planId: string;
      itemType: PlanItemType;
      placeId?: string;
      productId?: string;
      dayIndex: number;
      startTime?: string;
      endTime?: string;
      slotType?: string;
      notes?: string;
      sortOrder?: number;
    }) => {
      const { data, error } = await supabase
        .from('plan_items')
        .insert({
          plan_id: planId,
          item_type: itemType,
          place_id: placeId || null,
          product_id: productId || null,
          day_index: dayIndex,
          start_time: startTime || null,
          end_time: endTime || null,
          slot_type: slotType || null,
          notes: notes || null,
          sort_order: sortOrder || 0,
        })
        .select(`
          *,
          place:places(*),
          product:products(*)
        `)
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plan-items', variables.planId] });
      toast.success('Elemento aggiunto al piano!');
    },
    onError: (error) => {
      console.error('Error adding plan item:', error);
      toast.error('Errore nell\'aggiunta dell\'elemento');
    },
  });
}

export function useUpdatePlanItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      itemId,
      planId,
      updates,
    }: {
      itemId: string;
      planId: string;
      updates: Partial<Pick<PlanItem, 'day_index' | 'start_time' | 'end_time' | 'slot_type' | 'notes' | 'is_booked' | 'sort_order'>>;
    }) => {
      const { data, error } = await supabase
        .from('plan_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, planId };
    },
    onSuccess: ({ planId }) => {
      queryClient.invalidateQueries({ queryKey: ['plan-items', planId] });
      toast.success('Elemento aggiornato!');
    },
    onError: (error) => {
      console.error('Error updating plan item:', error);
      toast.error('Errore nell\'aggiornamento dell\'elemento');
    },
  });
}

export function useRemovePlanItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ itemId, planId }: { itemId: string; planId: string }) => {
      const { error } = await supabase
        .from('plan_items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
      return planId;
    },
    onSuccess: (planId) => {
      queryClient.invalidateQueries({ queryKey: ['plan-items', planId] });
      toast.success('Elemento rimosso dal piano!');
    },
    onError: (error) => {
      console.error('Error removing plan item:', error);
      toast.error('Errore nella rimozione dell\'elemento');
    },
  });
}

// =====================================================
// BULK OPERATIONS
// =====================================================

export function useReorderPlanItems() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      planId, 
      items 
    }: { 
      planId: string; 
      items: { id: string; sort_order: number; day_index?: number }[];
    }) => {
      // Update each item's sort_order
      const promises = items.map(item => 
        supabase
          .from('plan_items')
          .update({ 
            sort_order: item.sort_order,
            ...(item.day_index !== undefined && { day_index: item.day_index }),
          })
          .eq('id', item.id)
      );
      
      await Promise.all(promises);
      return planId;
    },
    onSuccess: (planId) => {
      queryClient.invalidateQueries({ queryKey: ['plan-items', planId] });
    },
    onError: (error) => {
      console.error('Error reordering plan items:', error);
      toast.error('Errore nel riordinamento');
    },
  });
}

// =====================================================
// ADD PRODUCT TO PLAN
// =====================================================

export function useAddProductToPlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      planId,
      productId,
      dayIndex,
      slotType,
      anchorPlaceId,
      anchorType,
    }: {
      planId: string;
      productId: string;
      dayIndex: number;
      slotType?: string;
      anchorPlaceId?: string;
      anchorType?: 'before' | 'after' | 'instead';
    }) => {
      // Get product details to determine timing
      const { data: product } = await supabase
        .from('products')
        .select('duration_minutes, preferred_time_buckets')
        .eq('id', productId)
        .single();
      
      // Calculate sort_order based on anchor
      let sortOrder = 0;
      if (anchorPlaceId) {
        const { data: anchorItem } = await supabase
          .from('plan_items')
          .select('sort_order')
          .eq('plan_id', planId)
          .eq('place_id', anchorPlaceId)
          .eq('day_index', dayIndex)
          .single();
        
        if (anchorItem) {
          sortOrder = anchorType === 'before' 
            ? anchorItem.sort_order - 1 
            : anchorItem.sort_order + 1;
        }
      }
      
      const { data, error } = await supabase
        .from('plan_items')
        .insert({
          plan_id: planId,
          item_type: 'product',
          product_id: productId,
          day_index: dayIndex,
          slot_type: slotType || (product?.preferred_time_buckets?.[0] || null),
          sort_order: sortOrder,
        })
        .select(`
          *,
          product:products(*)
        `)
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plan-items', variables.planId] });
      toast.success('Esperienza aggiunta al piano! 🎉');
    },
    onError: (error) => {
      console.error('Error adding product to plan:', error);
      toast.error('Errore nell\'aggiunta dell\'esperienza');
    },
  });
}
