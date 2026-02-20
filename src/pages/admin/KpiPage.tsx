import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Users, ShoppingBag, MapPin, Building2, 
  UserCog, Clock, TrendingUp, Eye, FileEdit,
  CheckCircle, XCircle, AlertTriangle, Package, Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

interface KpiData {
  // Content
  totalCities: number;
  activeCities: number;
  totalPlaces: number;
  approvedPlaces: number;
  pendingPlaces: number;
  rejectedPlaces: number;
  draftPlaces: number;
  totalZones: number;
  totalConnections: number;
  totalProducts: number;
  approvedProducts: number;

  // Users & Team
  totalUsers: number;
  admins: number;
  editors: number;
  contributors: number;
  pendingInvites: number;
  acceptedInvites: number;

  // Activity
  totalLogs: number;
  logsLast7d: number;
  logsLast30d: number;

  // Plans
  totalPlans: number;
  totalPlanItems: number;
  plansLast7d: number;
  plansLast30d: number;

  // Discovery
  totalSuggestions: number;
  pendingSuggestions: number;
  acceptedSuggestions: number;

  // Flags
  totalFlags: number;
  unresolvedFlags: number;

  // Quality
  avgQualityScore: number;
  placesWithPhotos: number;
}

export default function KpiPage() {
  const [data, setData] = useState<KpiData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchKpis();
  }, []);

  const fetchKpis = async () => {
    try {
      const now = new Date();
      const d7 = new Date(now.getTime() - 7 * 86400000).toISOString();
      const d30 = new Date(now.getTime() - 30 * 86400000).toISOString();

      const [
        { count: totalCities },
        { count: activeCities },
        { count: totalPlaces },
        { count: approvedPlaces },
        { count: pendingPlaces },
        { count: rejectedPlaces },
        { count: draftPlaces },
        { count: totalZones },
        { count: totalConnections },
        { count: totalProducts },
        { count: approvedProducts },
        { count: totalUsers },
        { count: admins },
        { count: editors },
        { count: contributors },
        { count: pendingInvites },
        { count: acceptedInvites },
        { count: totalLogs },
        { count: logsLast7d },
        { count: logsLast30d },
        { count: totalPlans },
        { count: totalPlanItems },
        { count: plansLast7d },
        { count: plansLast30d },
        { count: totalSuggestions },
        { count: pendingSuggestions },
        { count: acceptedSuggestions },
        { count: totalFlags },
        { count: unresolvedFlags },
        { count: placesWithPhotos },
        { data: qualityData },
      ] = await Promise.all([
        supabase.from('cities').select('*', { count: 'exact', head: true }),
        supabase.from('cities').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('places').select('*', { count: 'exact', head: true }),
        supabase.from('places').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('places').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
        supabase.from('places').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('places').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('city_zones').select('*', { count: 'exact', head: true }),
        supabase.from('city_connections').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'editor'),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'local_contributor'),
        supabase.from('contributor_invites').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('contributor_invites').select('*', { count: 'exact', head: true }).eq('status', 'accepted'),
        supabase.from('activity_logs').select('*', { count: 'exact', head: true }),
        supabase.from('activity_logs').select('*', { count: 'exact', head: true }).gte('created_at', d7),
        supabase.from('activity_logs').select('*', { count: 'exact', head: true }).gte('created_at', d30),
        supabase.from('trip_plans').select('*', { count: 'exact', head: true }),
        supabase.from('plan_items').select('*', { count: 'exact', head: true }),
        supabase.from('trip_plans').select('*', { count: 'exact', head: true }).gte('created_at', d7),
        supabase.from('trip_plans').select('*', { count: 'exact', head: true }).gte('created_at', d30),
        supabase.from('place_suggestions').select('*', { count: 'exact', head: true }),
        supabase.from('place_suggestions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('place_suggestions').select('*', { count: 'exact', head: true }).eq('status', 'accepted'),
        supabase.from('place_flags').select('*', { count: 'exact', head: true }),
        supabase.from('place_flags').select('*', { count: 'exact', head: true }).is('resolved_at', null),
        supabase.from('places').select('*', { count: 'exact', head: true }).not('photo_url', 'is', null),
        supabase.from('places').select('quality_score').not('quality_score', 'is', null),
      ]);

      const avgQuality = qualityData && qualityData.length > 0
        ? qualityData.reduce((s, p) => s + (p.quality_score || 0), 0) / qualityData.length
        : 0;

      setData({
        totalCities: totalCities || 0,
        activeCities: activeCities || 0,
        totalPlaces: totalPlaces || 0,
        approvedPlaces: approvedPlaces || 0,
        pendingPlaces: pendingPlaces || 0,
        rejectedPlaces: rejectedPlaces || 0,
        draftPlaces: draftPlaces || 0,
        totalZones: totalZones || 0,
        totalConnections: totalConnections || 0,
        totalProducts: totalProducts || 0,
        approvedProducts: approvedProducts || 0,
        totalUsers: totalUsers || 0,
        admins: admins || 0,
        editors: editors || 0,
        contributors: contributors || 0,
        pendingInvites: pendingInvites || 0,
        acceptedInvites: acceptedInvites || 0,
        totalLogs: totalLogs || 0,
        logsLast7d: logsLast7d || 0,
        logsLast30d: logsLast30d || 0,
        totalPlans: totalPlans || 0,
        totalPlanItems: totalPlanItems || 0,
        plansLast7d: plansLast7d || 0,
        plansLast30d: plansLast30d || 0,
        totalSuggestions: totalSuggestions || 0,
        pendingSuggestions: pendingSuggestions || 0,
        acceptedSuggestions: acceptedSuggestions || 0,
        totalFlags: totalFlags || 0,
        unresolvedFlags: unresolvedFlags || 0,
        avgQualityScore: Math.round(avgQuality * 10) / 10,
        placesWithPhotos: placesWithPhotos || 0,
      });
    } catch (error) {
      console.error('Error fetching KPIs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const sections = [
    {
      title: 'Contenuti',
      icon: Layers,
      cards: [
        { label: 'Città totali', value: data.totalCities, sub: `${data.activeCities} attive`, icon: Building2, color: 'text-terracotta' },
        { label: 'Luoghi totali', value: data.totalPlaces, sub: `${data.approvedPlaces} approvati`, icon: MapPin, color: 'text-emerald-600' },
        { label: 'In revisione', value: data.pendingPlaces, sub: `${data.draftPlaces} bozze`, icon: Clock, color: 'text-amber-600' },
        { label: 'Zone', value: data.totalZones, sub: `${data.totalConnections} connessioni`, icon: Eye, color: 'text-blue-600' },
      ]
    },
    {
      title: 'Prodotti',
      icon: Package,
      cards: [
        { label: 'Prodotti totali', value: data.totalProducts, sub: `${data.approvedProducts} approvati`, icon: Package, color: 'text-violet-600' },
      ]
    },
    {
      title: 'Team & Utenti',
      icon: Users,
      cards: [
        { label: 'Utenti totali', value: data.totalUsers, icon: UserCog, color: 'text-foreground' },
        { label: 'Admin', value: data.admins, icon: Users, color: 'text-terracotta' },
        { label: 'Editor', value: data.editors, icon: FileEdit, color: 'text-blue-600' },
        { label: 'Contributors', value: data.contributors, sub: `${data.pendingInvites} inviti pending`, icon: Users, color: 'text-emerald-600' },
      ]
    },
    {
      title: 'Itinerari Generati',
      icon: TrendingUp,
      cards: [
        { label: 'Piani totali', value: data.totalPlans, sub: `${data.totalPlanItems} slot`, icon: Search, color: 'text-terracotta' },
        { label: 'Ultimi 7 giorni', value: data.plansLast7d, icon: TrendingUp, color: 'text-emerald-600' },
        { label: 'Ultimi 30 giorni', value: data.plansLast30d, icon: TrendingUp, color: 'text-blue-600' },
      ]
    },
    {
      title: 'Attività Piattaforma',
      icon: Clock,
      cards: [
        { label: 'Log totali', value: data.totalLogs, icon: Clock, color: 'text-muted-foreground' },
        { label: 'Ultimi 7 giorni', value: data.logsLast7d, icon: TrendingUp, color: 'text-emerald-600' },
        { label: 'Ultimi 30 giorni', value: data.logsLast30d, icon: TrendingUp, color: 'text-blue-600' },
      ]
    },
    {
      title: 'Discovery & Qualità',
      icon: Search,
      cards: [
        { label: 'Suggerimenti AI', value: data.totalSuggestions, sub: `${data.pendingSuggestions} pending`, icon: Search, color: 'text-violet-600' },
        { label: 'Quality Score medio', value: data.avgQualityScore, sub: `su 9 punti`, icon: CheckCircle, color: 'text-emerald-600' },
        { label: 'Luoghi con foto', value: data.placesWithPhotos, sub: `su ${data.totalPlaces}`, icon: Eye, color: 'text-blue-600' },
        { label: 'Flag aperti', value: data.unresolvedFlags, sub: `${data.totalFlags} totali`, icon: AlertTriangle, color: data.unresolvedFlags > 0 ? 'text-amber-600' : 'text-muted-foreground' },
      ]
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-semibold">KPI</h1>
        <p className="text-muted-foreground">Metriche chiave della piattaforma</p>
      </div>

      {sections.map((section, si) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * si }}
          className="space-y-3"
        >
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <section.icon className="w-5 h-5 text-terracotta" />
            {section.title}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {section.cards.map((card) => (
              <Card key={card.label}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <card.icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-2xl font-bold">{card.value}</p>
                      <p className="text-xs text-muted-foreground truncate">{card.label}</p>
                    </div>
                  </div>
                  {card.sub && (
                    <p className="text-xs text-muted-foreground mt-2">{card.sub}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

