import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { City, CityFormData, CityZone } from '@/types/database';

// Fetch all cities with content counts
export function useCitiesWithStats() {
  return useQuery({
    queryKey: ['cities-with-stats'],
    queryFn: async () => {
      // First get cities
      const { data: cities, error: citiesError } = await supabase
        .from('cities')
        .select('*')
        .order('name');
      
      if (citiesError) throw citiesError;
      
      // Then get place counts per city grouped by type
      const { data: placeCounts, error: countsError } = await supabase
        .from('places')
        .select('city_id, place_type, status');
      
      if (countsError) throw countsError;
      
      // Calculate stats per city
      const statsMap = new Map<string, {
        attractions: number;
        restaurants: number;
        bars: number;
        clubs: number;
        experiences: number;
        views: number;
        zones: number;
        total: number;
        approved: number;
      }>();
      
      placeCounts?.forEach(place => {
        const current = statsMap.get(place.city_id) || {
          attractions: 0,
          restaurants: 0,
          bars: 0,
          clubs: 0,
          experiences: 0,
          views: 0,
          zones: 0,
          total: 0,
          approved: 0,
        };
        
        current.total++;
        if (place.status === 'approved') current.approved++;
        
        switch (place.place_type) {
          case 'attraction': current.attractions++; break;
          case 'restaurant': current.restaurants++; break;
          case 'bar': current.bars++; break;
          case 'club': current.clubs++; break;
          case 'experience': current.experiences++; break;
          case 'view': current.views++; break;
          case 'zone': current.zones++; break;
        }
        
        statsMap.set(place.city_id, current);
      });
      
      // Merge cities with stats
      return (cities as City[]).map(city => ({
        ...city,
        stats: statsMap.get(city.id) || {
          attractions: 0,
          restaurants: 0,
          bars: 0,
          clubs: 0,
          experiences: 0,
          views: 0,
          zones: 0,
          total: 0,
          approved: 0,
        }
      }));
    }
  });
}

// Fetch a single city
export function useCity(cityId: string | undefined) {
  return useQuery({
    queryKey: ['city', cityId],
    queryFn: async () => {
      if (!cityId) return null;
      
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('id', cityId)
        .maybeSingle();
      
      if (error) throw error;
      return data as City | null;
    },
    enabled: !!cityId
  });
}

// Fetch zones for a city
export function useCityZones(cityId: string | undefined) {
  return useQuery({
    queryKey: ['city-zones', cityId],
    queryFn: async () => {
      if (!cityId) return [];
      
      const { data, error } = await supabase
        .from('city_zones')
        .select('*')
        .eq('city_id', cityId)
        .order('name');
      
      if (error) throw error;
      return data as CityZone[];
    },
    enabled: !!cityId
  });
}

// Create a new city
export function useCreateCity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: CityFormData & { created_by: string }) => {
      // Generate slug from name
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      const { data, error } = await supabase
        .from('cities')
        .insert({
          name: formData.name,
          region: formData.region || null,
          country: formData.country,
          slug,
          latitude: formData.latitude,
          longitude: formData.longitude,
          tags: formData.tags,
          walkable: formData.walkable,
          rhythm: formData.rhythm,
          best_times: formData.best_times,
          tourist_errors: formData.tourist_errors || null,
          local_warning: formData.local_warning || null,
          created_by: formData.created_by,
          status: 'empty',
          is_active: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities-with-stats'] });
    }
  });
}

// Update a city
export function useUpdateCity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ cityId, updates }: { cityId: string; updates: Partial<City> }) => {
      const { data, error } = await supabase
        .from('cities')
        .update(updates)
        .eq('id', cityId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { cityId }) => {
      queryClient.invalidateQueries({ queryKey: ['cities-with-stats'] });
      queryClient.invalidateQueries({ queryKey: ['city', cityId] });
    }
  });
}

// Create a zone
export function useCreateZone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (zone: Omit<CityZone, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('city_zones')
        .insert(zone)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['city-zones', variables.city_id] });
    }
  });
}

// Update a zone
export function useUpdateZone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ zoneId, updates }: { zoneId: string; updates: Partial<CityZone> }) => {
      const { data, error } = await supabase
        .from('city_zones')
        .update(updates)
        .eq('id', zoneId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['city-zones', data.city_id] });
    }
  });
}

// Delete a zone
export function useDeleteZone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ zoneId, cityId }: { zoneId: string; cityId: string }) => {
      const { error } = await supabase
        .from('city_zones')
        .delete()
        .eq('id', zoneId);
      
      if (error) throw error;
      return { zoneId, cityId };
    },
    onSuccess: (_, { cityId }) => {
      queryClient.invalidateQueries({ queryKey: ['city-zones', cityId] });
    }
  });
}
