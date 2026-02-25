import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, UserCheck, Users, Mail, Calendar, Building2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type UserRole = Tables<'user_roles'>;

interface CityBasic {
  id: string;
  name: string;
}

interface UserWithRole {
  user_id: string;
  email: string | null;
  role: string;
  assigned_city_id: string | null;
  assigned_city_name?: string;
  created_at: string;
}

export function UsersSection() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [cities, setCities] = useState<CityBasic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<UserWithRole | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsersAndCities();
  }, []);

  const fetchUsersAndCities = async () => {
    try {
      // Fetch all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesError) throw rolesError;

      // Fetch cities for mapping
      const { data: citiesData } = await supabase
        .from('cities')
        .select('id, name');

      setCities(citiesData || []);

      // Fetch emails for each user using the security definer function
      const usersWithEmails: UserWithRole[] = await Promise.all(
        (rolesData || []).map(async (role) => {
          const { data: email } = await supabase
            .rpc('get_user_email', { _user_id: role.user_id });
          
          const city = citiesData?.find(c => c.id === role.assigned_city_id);
          
          return {
            user_id: role.user_id,
            email: email || 'Email non disponibile',
            role: role.role,
            assigned_city_id: role.assigned_city_id,
            assigned_city_name: city?.name,
            created_at: role.created_at,
          };
        })
      );

      setUsers(usersWithEmails);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke('delete-user', {
        body: { user_id: deleteTarget.user_id },
      });
      if (res.error) throw res.error;
      toast.success(`Utente ${deleteTarget.email} eliminato`);
      setUsers(prev => prev.filter(u => u.user_id !== deleteTarget.user_id));
    } catch (err: any) {
      toast.error(err.message || 'Errore durante l\'eliminazione');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const adminUsers = users.filter(u => u.role === 'admin');
  const editorUsers = users.filter(u => u.role === 'editor');
  const contributorUsers = users.filter(u => u.role === 'local_contributor');

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-terracotta text-white">Admin</Badge>;
      case 'editor':
        return <Badge variant="secondary">Editor</Badge>;
      case 'local_contributor':
        return <Badge variant="outline">Contributor</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-terracotta" />;
      case 'editor':
        return <UserCheck className="w-4 h-4 text-primary" />;
      case 'local_contributor':
        return <User className="w-4 h-4 text-muted-foreground" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const UserCard = ({ user }: { user: UserWithRole }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border rounded-xl bg-card hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
            {getRoleIcon(user.role)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium truncate">{user.email}</span>
              {getRoleBadge(user.role)}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(user.created_at).toLocaleDateString('it-IT')}
              </span>
              {user.assigned_city_name && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {user.assigned_city_name}
                </span>
              )}
            </div>
          </div>
        </div>
        {user.role !== 'admin' && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteTarget(user)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );

  const UserList = ({ users, emptyMessage }: { users: UserWithRole[]; emptyMessage: string }) => (
    <div className="space-y-3">
      {users.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>{emptyMessage}</p>
        </div>
      ) : (
        users.map((user) => (
          <UserCard key={`${user.user_id}-${user.role}`} user={user} />
        ))
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-terracotta" />
              <span className="text-2xl font-bold">{adminUsers.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">Admin</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <UserCheck className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold">{editorUsers.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">Editor</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{contributorUsers.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">Contributor</p>
          </CardContent>
        </Card>
      </div>

      {/* User Lists */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="all">Tutti ({users.length})</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="contributor">Contributor</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <UserList users={users} emptyMessage="Nessun utente registrato" />
        </TabsContent>

        <TabsContent value="admin">
          <UserList users={adminUsers} emptyMessage="Nessun admin" />
        </TabsContent>

        <TabsContent value="editor">
          <UserList users={editorUsers} emptyMessage="Nessun editor" />
        </TabsContent>

        <TabsContent value="contributor">
          <UserList users={contributorUsers} emptyMessage="Nessun contributor" />
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare questo utente?</AlertDialogTitle>
            <AlertDialogDescription>
              Stai per eliminare <strong>{deleteTarget?.email}</strong> ({deleteTarget?.role}). 
              Questa azione è irreversibile e rimuoverà l'utente e tutti i suoi ruoli.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Eliminazione...' : 'Elimina'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
