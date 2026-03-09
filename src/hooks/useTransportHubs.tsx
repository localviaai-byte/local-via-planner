import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type HubType = 'airport' | 'train_station' | 'bus_station' | 'port';

export interface TransportHub {
  id: string;
  city_id: string;
  hub_type: HubType;
  name: string;
  code: string | null;
  latitude: number | null;
  longitude: number | null;
  distance_from_center_km: number | null;
  travel_time_to_center_minutes: number | null;
  transport_to_center: string | null;
  ncc_taxi_note: string | null;
  ncc_contact_url: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

export const HUB_TYPE_OPTIONS = [
  { id: 'airport' as HubType, label: 'Aeroporto', icon: '✈️' },
  { id: 'train_station' as HubType, label: 'Stazione treni', icon: '🚂' },
  { id: 'bus_station' as HubType, label: 'Stazione bus', icon: '🚌' },
  { id: 'port' as HubType, label: 'Porto', icon: '⛴️' },
] as const;

export function useTransportHubs(cityId: string | undefined) {
  return useQuery({
    queryKey: ['transport-hubs', cityId],
    queryFn: async () => {
      if (!cityId) return [];
      const { data, error } = await (supabase as any)
        .from('city_transport_hubs')
        .select('*')
        .eq('city_id', cityId)
        .eq('is_active', true)
        .order('hub_type');
      if (error) throw error;
      return (data || []) as TransportHub[];
    },
    enabled: !!cityId,
  });
}

export function useCreateTransportHub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (hub: Omit<TransportHub, 'id' | 'created_at' | 'is_active'> & { created_by?: string | null }) => {
      const { data, error } = await (supabase as any)
        .from('city_transport_hubs')
        .insert(hub)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['transport-hubs', vars.city_id] });
    },
  });
}

export function useDeleteTransportHub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, cityId }: { id: string; cityId: string }) => {
      const { error } = await (supabase as any)
        .from('city_transport_hubs')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
      return { id, cityId };
    },
    onSuccess: (_, { cityId }) => {
      qc.invalidateQueries({ queryKey: ['transport-hubs', cityId] });
    },
  });
}
