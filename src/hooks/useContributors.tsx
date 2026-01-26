import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AppRole } from '@/types/database';

export interface ContributorInvite {
  id: string;
  email: string;
  role: AppRole;
  assigned_city_id: string | null;
  permissions: string[];
  invite_code: string;
  status: 'pending' | 'accepted' | 'expired';
  created_at: string;
  expires_at: string;
  created_by: string;
}

export interface ActiveUser {
  id: string;
  user_id: string;
  email: string;
  role: AppRole;
  assigned_city_id: string | null;
  created_at: string;
}

// Fetch all contributors and pending invites
export function useContributors() {
  return useQuery({
    queryKey: ['contributors'],
    queryFn: async () => {
      // Get active user roles with user emails
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .neq('role', 'admin')
        .order('created_at', { ascending: false });
      
      if (rolesError) throw rolesError;
      
      // Get pending invites
      const { data: invites, error: invitesError } = await supabase
        .from('contributor_invites')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      // Don't throw on invites error - table might not exist yet
      const pendingInvites = invitesError ? [] : (invites as ContributorInvite[] || []);
      
      // Fetch emails for each user using the RPC function
      const activeUsers: ActiveUser[] = await Promise.all(
        (userRoles || []).map(async (role) => {
          const { data: email } = await supabase.rpc('get_user_email', { 
            _user_id: role.user_id 
          });
          
          return {
            id: role.id,
            user_id: role.user_id,
            email: email || 'Email non disponibile',
            role: role.role,
            assigned_city_id: role.assigned_city_id,
            created_at: role.created_at,
          };
        })
      );
      
      return {
        activeUsers,
        pendingInvites,
      };
    }
  });
}

// Create invite
export function useCreateInvite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      email: string;
      role: AppRole;
      assigned_city_id: string | null;
      permissions: string[];
    }) => {
      // Generate a unique invite code
      const inviteCode = crypto.randomUUID().slice(0, 8);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Set expiration to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      // Use any to bypass type check since table was just created
      const { data: invite, error } = await (supabase
        .from('contributor_invites' as any) as any)
        .insert({
          email: data.email,
          role: data.role,
          assigned_city_id: data.assigned_city_id,
          permissions: data.permissions,
          invite_code: inviteCode,
          status: 'pending',
          expires_at: expiresAt.toISOString(),
          created_by: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return invite as ContributorInvite;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributors'] });
    }
  });
}

// Delete invite
export function useDeleteInvite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (inviteId: string) => {
      const { error } = await (supabase
        .from('contributor_invites' as any) as any)
        .delete()
        .eq('id', inviteId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributors'] });
    }
  });
}

// Delete a contributor (user + role)
export function useDeleteContributor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      // Get current session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      
      // Call the edge function to delete the user
      const response = await fetch(
        `https://uocxfumnfmjauhtgvwly.supabase.co/functions/v1/delete-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete contributor');
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributors'] });
    }
  });
}

// Accept invite (used when contributor signs up)
export function useAcceptInvite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (inviteCode: string) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Find the invite
      const { data: invite, error: findError } = await (supabase
        .from('contributor_invites' as any) as any)
        .select('*')
        .eq('invite_code', inviteCode)
        .eq('status', 'pending')
        .single();
      
      if (findError || !invite) throw new Error('Invito non valido o scaduto');
      
      const typedInvite = invite as ContributorInvite;
      
      // Check if expired
      if (new Date(typedInvite.expires_at) < new Date()) {
        throw new Error('Invito scaduto');
      }
      
      // Check email matches
      if (typedInvite.email !== user.email) {
        throw new Error('Questo invito è per un\'altra email');
      }
      
      // Create user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: typedInvite.role,
          assigned_city_id: typedInvite.assigned_city_id,
        });
      
      if (roleError) throw roleError;
      
      // Update invite status
      const { error: updateError } = await (supabase
        .from('contributor_invites' as any) as any)
        .update({ status: 'accepted' })
        .eq('id', typedInvite.id);
      
      if (updateError) throw updateError;
      
      return typedInvite;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributors'] });
    }
  });
}
