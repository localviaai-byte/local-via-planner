import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

type ActionType = 'create' | 'update' | 'delete' | 'link';
type EntityType = 'city' | 'place' | 'zone' | 'connection' | 'product' | 'media' | 'contributor' | 'invite';

interface LogOptions {
  action: ActionType;
  entity: EntityType;
  entityId?: string;
  details?: Json;
}

/**
 * Hook for logging user activities across the admin dashboard.
 * Automatically captures user_id and user_email from the current session.
 */
export function useActivityLogger() {
  const log = useCallback(async (options: LogOptions) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('Cannot log activity: user not authenticated');
        return;
      }
      
      const { error } = await supabase.from('activity_logs').insert([{
        user_id: user.id,
        user_email: user.email,
        action_type: options.action,
        entity_type: options.entity,
        entity_id: options.entityId || null,
        details: options.details || {},
      }]);
      
      if (error) {
        console.error('Failed to log activity:', error);
      }
    } catch (err) {
      console.error('Error in activity logger:', err);
    }
  }, []);
  
  // Convenience methods for common actions
  const logCreate = useCallback((entity: EntityType, entityId?: string, details?: Json) => {
    return log({ action: 'create', entity, entityId, details });
  }, [log]);
  
  const logUpdate = useCallback((entity: EntityType, entityId?: string, details?: Json) => {
    return log({ action: 'update', entity, entityId, details });
  }, [log]);
  
  const logDelete = useCallback((entity: EntityType, entityId?: string, details?: Json) => {
    return log({ action: 'delete', entity, entityId, details });
  }, [log]);
  
  const logLink = useCallback((entity: EntityType, entityId?: string, details?: Json) => {
    return log({ action: 'link', entity, entityId, details });
  }, [log]);
  
  return {
    log,
    logCreate,
    logUpdate,
    logDelete,
    logLink,
  };
}
