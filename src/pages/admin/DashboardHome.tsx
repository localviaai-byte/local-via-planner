import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Users, UserCog, MapPin, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalCities: number;
  activeCities: number;
  totalPlaces: number;
  pendingPlaces: number;
  totalUsers: number;
  pendingInvites: number;
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        { count: totalCities },
        { count: activeCities },
        { count: totalPlaces },
        { count: pendingPlaces },
        { count: totalUsers },
        { count: pendingInvites }
      ] = await Promise.all([
        supabase.from('cities').select('*', { count: 'exact', head: true }),
        supabase.from('cities').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('places').select('*', { count: 'exact', head: true }),
        supabase.from('places').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }),
        supabase.from('contributor_invites').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      setStats({
        totalCities: totalCities || 0,
        activeCities: activeCities || 0,
        totalPlaces: totalPlaces || 0,
        pendingPlaces: pendingPlaces || 0,
        totalUsers: totalUsers || 0,
        pendingInvites: pendingInvites || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      setRecentActivity(data || []);
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: 'Creazione',
      update: 'Modifica',
      delete: 'Eliminazione',
      approve: 'Approvazione',
      reject: 'Rifiuto',
      link: 'Collegamento'
    };
    return labels[action] || action;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Panoramica generale della piattaforma</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card 
            className="cursor-pointer hover:border-terracotta/50 transition-colors"
            onClick={() => navigate('/admin/cities')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-terracotta/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-terracotta" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalCities}</p>
                  <p className="text-xs text-muted-foreground">Città totali</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {stats?.activeCities} attive
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalPlaces}</p>
                  <p className="text-xs text-muted-foreground">Luoghi totali</p>
                </div>
              </div>
              {(stats?.pendingPlaces ?? 0) > 0 && (
                <p className="text-xs text-amber-600 mt-2">
                  {stats?.pendingPlaces} in attesa di revisione
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate('/admin/users')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <UserCog className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalUsers}</p>
                  <p className="text-xs text-muted-foreground">Utenti</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate('/admin/contributors')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Users className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.pendingInvites}</p>
                  <p className="text-xs text-muted-foreground">Inviti in attesa</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Attività recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nessuna attività recente
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {getActionLabel(activity.action_type)} {activity.entity_type}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.user_email}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground shrink-0 ml-4">
                      {new Date(activity.created_at).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
