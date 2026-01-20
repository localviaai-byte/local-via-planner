import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CityConnection, CityConnectionFormData, PlaceCoverage, TimeBucket, ConnectionType, TransportMode } from '@/types/database';

// Fetch connections FROM a city (outbound)
export function useCityConnections(cityId: string | undefined) {
  return useQuery({
    queryKey: ['city-connections', cityId],
    queryFn: async () => {
      if (!cityId) return [];
      
      const { data, error } = await supabase
        .from('city_connections')
        .select(`
          *,
          to_city:cities!city_connections_city_id_to_fkey(id, name, slug, region, country, cover_image_url)
        `)
        .eq('city_id_from', cityId)
        .eq('is_active', true)
        .order('typical_min_minutes', { ascending: true });
      
      if (error) throw error;
      return (data || []) as unknown as CityConnection[];
    },
    enabled: !!cityId
  });
}

// Fetch connections TO a city (inbound - who can reach this city)
export function useInboundConnections(cityId: string | undefined) {
  return useQuery({
    queryKey: ['city-connections-inbound', cityId],
    queryFn: async () => {
      if (!cityId) return [];
      
      const { data, error } = await supabase
        .from('city_connections')
        .select(`
          *,
          from_city:cities!city_connections_city_id_from_fkey(id, name, slug, region, country, cover_image_url)
        `)
        .eq('city_id_to', cityId)
        .eq('is_active', true)
        .order('typical_min_minutes', { ascending: true });
      
      if (error) throw error;
      return (data || []) as unknown as CityConnection[];
    },
    enabled: !!cityId
  });
}

// Fetch reachable cities within time constraint
export function useReachableCities(
  baseCityId: string | undefined, 
  maxTravelMinutes: number = 60,
  connectionTypes?: ConnectionType[]
) {
  return useQuery({
    queryKey: ['reachable-cities', baseCityId, maxTravelMinutes, connectionTypes],
    queryFn: async () => {
      if (!baseCityId) return [];
      
      let query = supabase
        .from('city_connections')
        .select(`
          *,
          to_city:cities!city_connections_city_id_to_fkey(id, name, slug, region, country, cover_image_url, tags, rhythm)
        `)
        .eq('city_id_from', baseCityId)
        .eq('is_active', true)
        .lte('typical_min_minutes', maxTravelMinutes)
        .order('typical_min_minutes', { ascending: true });
      
      if (connectionTypes && connectionTypes.length > 0) {
        query = query.in('connection_type', connectionTypes);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return (data || []) as unknown as CityConnection[];
    },
    enabled: !!baseCityId
  });
}

// Create a city connection
export function useCreateConnection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ cityIdFrom, formData, userId }: { 
      cityIdFrom: string; 
      formData: CityConnectionFormData;
      userId: string;
    }) => {
      const { data, error } = await supabase
        .from('city_connections')
        .insert({
          city_id_from: cityIdFrom,
          city_id_to: formData.city_id_to,
          connection_type: formData.connection_type,
          primary_mode: formData.primary_mode,
          typical_min_minutes: formData.typical_min_minutes,
          typical_max_minutes: formData.typical_max_minutes,
          cost_note: formData.cost_note || null,
          reliability_score: formData.reliability_score,
          friction_score: formData.friction_score,
          best_departure_time: formData.best_departure_time.length > 0 ? formData.best_departure_time : null,
          best_return_time: formData.best_return_time.length > 0 ? formData.best_return_time : null,
          local_tip: formData.local_tip || null,
          warning: formData.warning || null,
          seasonality_note: formData.seasonality_note || null,
          day_worth: formData.day_worth || null,
          created_by: userId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { cityIdFrom }) => {
      queryClient.invalidateQueries({ queryKey: ['city-connections', cityIdFrom] });
      queryClient.invalidateQueries({ queryKey: ['reachable-cities'] });
    }
  });
}

// Update a city connection
export function useUpdateConnection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ connectionId, updates }: { 
      connectionId: string; 
      updates: Partial<CityConnection>;
    }) => {
      const { data, error } = await supabase
        .from('city_connections')
        .update(updates)
        .eq('id', connectionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['city-connections', data.city_id_from] });
      queryClient.invalidateQueries({ queryKey: ['reachable-cities'] });
    }
  });
}

// Delete (soft) a city connection
export function useDeleteConnection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ connectionId, cityIdFrom }: { connectionId: string; cityIdFrom: string }) => {
      const { error } = await supabase
        .from('city_connections')
        .update({ is_active: false })
        .eq('id', connectionId);
      
      if (error) throw error;
      return { connectionId, cityIdFrom };
    },
    onSuccess: (_, { cityIdFrom }) => {
      queryClient.invalidateQueries({ queryKey: ['city-connections', cityIdFrom] });
      queryClient.invalidateQueries({ queryKey: ['reachable-cities'] });
    }
  });
}

// =====================================================
// PLACE COVERAGE HOOKS
// =====================================================

// Fetch places covered by a base city (places from other cities relevant here)
export function usePlaceCoverage(baseCityId: string | undefined) {
  return useQuery({
    queryKey: ['place-coverage', baseCityId],
    queryFn: async () => {
      if (!baseCityId) return [];
      
      const { data, error } = await supabase
        .from('place_coverage')
        .select(`
          *,
          place:place_id(id, name, place_type, city_id, zone, photo_url, local_one_liner)
        `)
        .eq('base_city_id', baseCityId)
        .order('relevance', { ascending: false });
      
      if (error) throw error;
      return (data || []) as PlaceCoverage[];
    },
    enabled: !!baseCityId
  });
}

// Add place coverage
export function useAddPlaceCoverage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ placeId, baseCityId, relevance, note, userId }: {
      placeId: string;
      baseCityId: string;
      relevance: number;
      note?: string;
      userId: string;
    }) => {
      const { data, error } = await supabase
        .from('place_coverage')
        .insert({
          place_id: placeId,
          base_city_id: baseCityId,
          relevance,
          note: note || null,
          created_by: userId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { baseCityId }) => {
      queryClient.invalidateQueries({ queryKey: ['place-coverage', baseCityId] });
    }
  });
}

// Remove place coverage
export function useRemovePlaceCoverage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ placeId, baseCityId }: { placeId: string; baseCityId: string }) => {
      const { error } = await supabase
        .from('place_coverage')
        .delete()
        .eq('place_id', placeId)
        .eq('base_city_id', baseCityId);
      
      if (error) throw error;
      return { placeId, baseCityId };
    },
    onSuccess: (_, { baseCityId }) => {
      queryClient.invalidateQueries({ queryKey: ['place-coverage', baseCityId] });
    }
  });
}

// =====================================================
// UTILITY: Get candidates from nearby cities
// =====================================================

export interface NearbyCandidate {
  place_id: string;
  city_id: string;
  city_name: string;
  travel_min_minutes: number;
  travel_max_minutes: number;
  connection_type: ConnectionType;
  place: {
    id: string;
    name: string;
    place_type: string;
    zone: string | null;
    photo_url: string | null;
    local_one_liner: string | null;
  };
}

export function useNearbyCandidates(
  baseCityId: string | undefined,
  maxTravelMinutes: number = 60
) {
  return useQuery({
    queryKey: ['nearby-candidates', baseCityId, maxTravelMinutes],
    queryFn: async () => {
      if (!baseCityId) return [];
      
      // First get reachable cities
      const { data: connections, error: connError } = await supabase
        .from('city_connections')
        .select('city_id_to, typical_min_minutes, typical_max_minutes, connection_type')
        .eq('city_id_from', baseCityId)
        .eq('is_active', true)
        .lte('typical_min_minutes', maxTravelMinutes);
      
      if (connError) throw connError;
      if (!connections || connections.length === 0) return [];
      
      const reachableCityIds = connections.map(c => c.city_id_to);
      
      // Then get approved places from those cities
      const { data: places, error: placesError } = await supabase
        .from('places')
        .select('id, name, place_type, city_id, zone, photo_url, local_one_liner')
        .in('city_id', reachableCityIds)
        .eq('status', 'approved')
        .limit(100);
      
      if (placesError) throw placesError;
      
      // Get city names
      const { data: cities, error: citiesError } = await supabase
        .from('cities')
        .select('id, name')
        .in('id', reachableCityIds);
      
      if (citiesError) throw citiesError;
      
      const cityMap = new Map(cities?.map(c => [c.id, c.name]) || []);
      const connectionMap = new Map(connections.map(c => [c.city_id_to, c]));
      
      // Combine data
      return (places || []).map(place => {
        const conn = connectionMap.get(place.city_id);
        return {
          place_id: place.id,
          city_id: place.city_id,
          city_name: cityMap.get(place.city_id) || 'Unknown',
          travel_min_minutes: conn?.typical_min_minutes || 0,
          travel_max_minutes: conn?.typical_max_minutes || 0,
          connection_type: conn?.connection_type || 'day_trip',
          place,
        } as NearbyCandidate;
      });
    },
    enabled: !!baseCityId
  });
}
