import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AvailableFoodOptions {
  foodPrimary: string[];
  foodSecondary: string[];
}

export function useAvailableFoodOptions(citySlug: string) {
  return useQuery({
    queryKey: ['available-food-options', citySlug],
    queryFn: async (): Promise<AvailableFoodOptions> => {
      // First resolve slug → city_id
      const { data: city } = await supabase
        .from('cities')
        .select('id')
        .eq('slug', citySlug)
        .single();

      if (!city) return { foodPrimary: [], foodSecondary: [] };

      // Fetch all approved restaurant/bar places for this city
      const { data: places } = await supabase
        .from('places')
        .select('food_primary, food_secondary')
        .eq('city_id', city.id)
        .in('place_type', ['restaurant', 'bar'])
        .in('status', ['approved', 'pending_review']);

      if (!places || places.length === 0) return { foodPrimary: [], foodSecondary: [] };

      const primarySet = new Set<string>();
      const secondarySet = new Set<string>();

      for (const p of places) {
        if (p.food_primary) primarySet.add(p.food_primary);
        if (p.food_secondary) {
          for (const s of p.food_secondary) {
            secondarySet.add(s);
          }
        }
      }

      return {
        foodPrimary: Array.from(primarySet),
        foodSecondary: Array.from(secondarySet),
      };
    },
    enabled: !!citySlug,
    staleTime: 5 * 60 * 1000,
  });
}
