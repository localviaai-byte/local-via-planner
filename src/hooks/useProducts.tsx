import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  Product, 
  ProductFormData, 
  ProductRule, 
  ProductRuleFormData,
  ProductTag,
  PlaceStatus 
} from '@/types/database';

// =====================================================
// FETCH PRODUCTS
// =====================================================

export function useProducts(cityId?: string) {
  return useQuery({
    queryKey: ['products', cityId],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          city:cities(*),
          zone:city_zones(*)
        `)
        .order('created_at', { ascending: false });
      
      if (cityId) {
        query = query.eq('city_id', cityId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Product[];
    },
    enabled: true,
  });
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          city:cities(*),
          zone:city_zones(*)
        `)
        .eq('id', productId)
        .single();
      
      if (error) throw error;
      return data as Product;
    },
    enabled: !!productId,
  });
}

// =====================================================
// CREATE PRODUCT
// =====================================================

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: ProductFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('products')
        .insert({
          city_id: formData.city_id,
          zone_id: formData.zone_id,
          product_type: formData.product_type!,
          title: formData.title,
          short_pitch: formData.short_pitch,
          description: formData.description || null,
          duration_minutes: formData.duration_minutes,
          price_cents: formData.price_cents,
          currency: formData.currency,
          meeting_point: formData.meeting_point || null,
          latitude: formData.latitude,
          longitude: formData.longitude,
          capacity_note: formData.capacity_note || null,
          booking_url: formData.booking_url || null,
          vendor_name: formData.vendor_name || null,
          vendor_contact: formData.vendor_contact || null,
          photo_url: formData.photo_url || null,
          preferred_time_buckets: formData.preferred_time_buckets,
          status: 'draft' as PlaceStatus,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Prodotto creato con successo!');
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      toast.error('Errore nella creazione del prodotto');
    },
  });
}

// =====================================================
// UPDATE PRODUCT
// =====================================================

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, formData }: { productId: string; formData: Partial<ProductFormData> & { status?: PlaceStatus } }) => {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', data.id] });
      toast.success('Prodotto aggiornato!');
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast.error('Errore nell\'aggiornamento del prodotto');
    },
  });
}

// =====================================================
// UPDATE PRODUCT STATUS
// =====================================================

export function useUpdateProductStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, status }: { productId: string; status: PlaceStatus }) => {
      const { data, error } = await supabase
        .from('products')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', productId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Stato aggiornato!');
    },
    onError: (error) => {
      console.error('Error updating product status:', error);
      toast.error('Errore nell\'aggiornamento dello stato');
    },
  });
}

// =====================================================
// DELETE PRODUCT
// =====================================================

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Prodotto eliminato!');
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      toast.error('Errore nell\'eliminazione del prodotto');
    },
  });
}

// =====================================================
// PRODUCT RULES
// =====================================================

export function useProductRules(productId: string) {
  return useQuery({
    queryKey: ['product-rules', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_rules')
        .select('*')
        .eq('product_id', productId)
        .order('priority', { ascending: false });
      
      if (error) throw error;
      return data as ProductRule[];
    },
    enabled: !!productId,
  });
}

export function useCreateProductRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, formData }: { productId: string; formData: ProductRuleFormData }) => {
      const { data, error } = await supabase
        .from('product_rules')
        .insert({
          product_id: productId,
          trigger_place_types: formData.trigger_place_types,
          trigger_interest_keys: formData.trigger_interest_keys,
          trigger_time_buckets: formData.trigger_time_buckets,
          trigger_zone_ids: formData.trigger_zone_ids,
          min_trip_days: formData.min_trip_days,
          max_trip_days: formData.max_trip_days,
          requires_pace_max: formData.requires_pace_max,
          suitable_for: formData.suitable_for,
          min_social_level: formData.min_social_level,
          anchor_type: formData.anchor_type,
          requires_booking: formData.requires_booking,
          priority: formData.priority,
          note_internal: formData.note_internal || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-rules', variables.productId] });
      toast.success('Regola aggiunta!');
    },
    onError: (error) => {
      console.error('Error creating product rule:', error);
      toast.error('Errore nella creazione della regola');
    },
  });
}

export function useDeleteProductRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ ruleId, productId }: { ruleId: string; productId: string }) => {
      const { error } = await supabase
        .from('product_rules')
        .delete()
        .eq('id', ruleId);
      
      if (error) throw error;
      return productId;
    },
    onSuccess: (productId) => {
      queryClient.invalidateQueries({ queryKey: ['product-rules', productId] });
      toast.success('Regola eliminata!');
    },
    onError: (error) => {
      console.error('Error deleting product rule:', error);
      toast.error('Errore nell\'eliminazione della regola');
    },
  });
}

// =====================================================
// PRODUCT TAGS
// =====================================================

export function useProductTags(productId: string) {
  return useQuery({
    queryKey: ['product-tags', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_tags')
        .select(`
          *,
          tag:tags(*)
        `)
        .eq('product_id', productId);
      
      if (error) throw error;
      return data as ProductTag[];
    },
    enabled: !!productId,
  });
}

export function useAddProductTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, tagId, weight = 3 }: { productId: string; tagId: string; weight?: number }) => {
      const { data, error } = await supabase
        .from('product_tags')
        .insert({
          product_id: productId,
          tag_id: tagId,
          weight,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-tags', variables.productId] });
      toast.success('Tag aggiunto!');
    },
    onError: (error) => {
      console.error('Error adding product tag:', error);
      toast.error('Errore nell\'aggiunta del tag');
    },
  });
}

export function useRemoveProductTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, tagId }: { productId: string; tagId: string }) => {
      const { error } = await supabase
        .from('product_tags')
        .delete()
        .eq('product_id', productId)
        .eq('tag_id', tagId);
      
      if (error) throw error;
      return productId;
    },
    onSuccess: (productId) => {
      queryClient.invalidateQueries({ queryKey: ['product-tags', productId] });
      toast.success('Tag rimosso!');
    },
    onError: (error) => {
      console.error('Error removing product tag:', error);
      toast.error('Errore nella rimozione del tag');
    },
  });
}

// =====================================================
// ADD-ON RECOMMENDER (MVP Algorithm)
// =====================================================

interface RecommendationContext {
  cityId: string;
  placeTypes: string[];
  interestTags: string[];
  timeBuckets: string[];
  zoneIds: string[];
  tripDays: number;
  userPace?: number;
  idealFor?: string[];
  socialLevel?: number;
}

export function useRecommendedProducts(context: RecommendationContext) {
  return useQuery({
    queryKey: ['recommended-products', context],
    queryFn: async () => {
      // Fetch all approved products for this city
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          city:cities(*),
          zone:city_zones(*)
        `)
        .eq('city_id', context.cityId)
        .eq('status', 'approved');
      
      if (productsError) throw productsError;
      if (!products?.length) return [];
      
      // Fetch all rules for these products
      const productIds = products.map(p => p.id);
      const { data: rules, error: rulesError } = await supabase
        .from('product_rules')
        .select('*')
        .in('product_id', productIds);
      
      if (rulesError) throw rulesError;
      
      // Score and filter products based on rules
      const scoredProducts = products.map(product => {
        const productRules = rules?.filter(r => r.product_id === product.id) || [];
        
        if (productRules.length === 0) {
          // No rules = always show with base score
          return { product, score: 1, matchedRule: null };
        }
        
        let bestScore = 0;
        let bestRule: ProductRule | null = null;
        
        for (const rule of productRules) {
          let score = 0;
          
          // Check place type match
          if (rule.trigger_place_types?.length > 0) {
            const matches = rule.trigger_place_types.filter(t => 
              context.placeTypes.includes(t)
            ).length;
            score += matches * 2;
          }
          
          // Check interest match
          if (rule.trigger_interest_keys?.length > 0) {
            const matches = rule.trigger_interest_keys.filter(t => 
              context.interestTags.includes(t)
            ).length;
            score += matches * 2;
          }
          
          // Check time bucket match
          if (rule.trigger_time_buckets?.length > 0) {
            const matches = rule.trigger_time_buckets.filter(t => 
              context.timeBuckets.includes(t)
            ).length;
            score += matches;
          }
          
          // Check zone match
          if (rule.trigger_zone_ids?.length > 0) {
            const matches = rule.trigger_zone_ids.filter(z => 
              context.zoneIds.includes(z)
            ).length;
            score += matches * 1.5;
          }
          
          // Check trip days constraint
          if (rule.min_trip_days && context.tripDays < rule.min_trip_days) {
            continue; // Skip this rule
          }
          if (rule.max_trip_days && context.tripDays > rule.max_trip_days) {
            continue; // Skip this rule
          }
          
          // Check pace compatibility
          if (rule.requires_pace_max && context.userPace && context.userPace > rule.requires_pace_max) {
            score -= 1; // Penalize but don't exclude
          }
          
          // Check suitable_for match
          if (rule.suitable_for?.length > 0 && context.idealFor?.length) {
            const matches = rule.suitable_for.filter(s => 
              context.idealFor?.includes(s)
            ).length;
            score += matches * 1.5;
          }
          
          // Add priority bonus
          score += (rule.priority || 3) * 0.5;
          
          if (score > bestScore) {
            bestScore = score;
            bestRule = rule as ProductRule;
          }
        }
        
        return { product: product as Product, score: bestScore, matchedRule: bestRule };
      });
      
      // Filter and sort
      return scoredProducts
        .filter(sp => sp.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5); // Max 5 recommendations
    },
    enabled: !!context.cityId,
  });
}
