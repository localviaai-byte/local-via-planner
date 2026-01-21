import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Place, PlaceFormData, City } from '@/types/database';

// Fetch contributor's places with stats
export function useContributorPlaces(userId: string | undefined) {
  return useQuery({
    queryKey: ['contributor-places', userId],
    queryFn: async () => {
      if (!userId) return { places: [], stats: { total: 0, drafts: 0, pending: 0, approved: 0, avgQuality: 0 } };
      
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .eq('created_by', userId)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      const places = (data || []) as Place[];
      const stats = {
        total: places.length,
        drafts: places.filter(p => p.status === 'draft').length,
        pending: places.filter(p => p.status === 'pending_review').length,
        approved: places.filter(p => p.status === 'approved').length,
        avgQuality: places.length > 0 
          ? Math.round(places.reduce((sum, p) => sum + p.quality_score, 0) / places.length * 10) / 10
          : 0,
      };
      
      return { places, stats };
    },
    enabled: !!userId,
  });
}

// Fetch all cities
export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return (data || []) as City[];
    },
  });
}

// Fetch single place
export function usePlace(placeId: string | undefined) {
  return useQuery({
    queryKey: ['place', placeId],
    queryFn: async () => {
      if (!placeId) return null;
      
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .eq('id', placeId)
        .maybeSingle();
      
      if (error) throw error;
      return data as Place | null;
    },
    enabled: !!placeId,
  });
}

// Create place mutation
export function useCreatePlace() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: PlaceFormData & { created_by: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const insertData: any = {
        city_id: formData.city_id,
        place_type: formData.place_type,
        name: formData.name,
        address: formData.address || null,
        zone: formData.zone || null,
        photo_url: formData.photo_url || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        why_people_go: formData.why_people_go,
        why_other: formData.why_other || null,
        social_level: formData.social_level,
        solo_friendly: formData.solo_friendly,
        flirt_friendly: formData.flirt_friendly,
        group_friendly: formData.group_friendly,
        target_audience: formData.target_audience,
        vibe_calm_to_energetic: formData.vibe_calm_to_energetic,
        vibe_quiet_to_loud: formData.vibe_quiet_to_loud,
        vibe_empty_to_crowded: formData.vibe_empty_to_crowded,
        vibe_touristy_to_local: formData.vibe_touristy_to_local,
        best_days: formData.best_days,
        best_times: formData.best_times,
        periods_to_avoid: formData.periods_to_avoid || null,
        local_warning: formData.local_warning || null,
        local_one_liner: formData.local_one_liner,
        created_by: formData.created_by,
        status: 'draft',
        // New fields from schema upgrade
        mood_primary: formData.mood_primary || null,
        mood_secondary: formData.mood_secondary || null,
        gender_balance: formData.gender_balance || 'unknown',
        tourist_trap: formData.tourist_trap || false,
        overrated: formData.overrated || false,
        local_secret: formData.local_secret || false,
        ideal_for: formData.ideal_for || [],
        physical_effort: formData.physical_effort || null,
        mental_effort: formData.mental_effort || null,
        suggested_stay: formData.suggested_stay || null,
        dead_times_note: formData.dead_times_note || null,
      };
      
      const { data, error } = await supabase
        .from('places')
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      return data as Place;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributor-places'] });
    },
  });
}

// Update place mutation
export function useUpdatePlace() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...formData }: Partial<PlaceFormData> & { id: string }) => {
      const { data, error } = await supabase
        .from('places')
        .update({
          ...formData,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Place;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contributor-places'] });
      queryClient.invalidateQueries({ queryKey: ['place', data.id] });
    },
  });
}

// Submit place for review
export function useSubmitForReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (placeId: string) => {
      const { data, error } = await supabase
        .from('places')
        .update({ status: 'pending_review' })
        .eq('id', placeId)
        .select()
        .single();
      
      if (error) throw error;
      return data as Place;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contributor-places'] });
      queryClient.invalidateQueries({ queryKey: ['place', data.id] });
    },
  });
}
