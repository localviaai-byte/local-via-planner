import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ActivityLog {
  id: string;
  user_id: string;
  user_email: string | null;
  action_type: 'create' | 'update' | 'delete' | 'link';
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

// Fetch activity logs with optional filtering
export function useActivityLogs(entityType?: string, limit = 50) {
  return useQuery({
    queryKey: ['activity-logs', entityType, limit],
    queryFn: async () => {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (entityType) {
        query = query.eq('entity_type', entityType);
      }
      
      const { data, error } = await query;
      
      // If table doesn't exist yet, return empty array
      if (error) {
        console.warn('Activity logs not available:', error.message);
        return [];
      }
      
      return data as ActivityLog[];
    }
  });
}

// Log an activity
export function useLogActivity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      action_type: 'create' | 'update' | 'delete' | 'link';
      entity_type: string;
      entity_id?: string;
      details?: Record<string, unknown>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          user_email: user.email,
          action_type: data.action_type,
          entity_type: data.entity_type,
          entity_id: data.entity_id || null,
          details: data.details || {},
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
    }
  });
}
