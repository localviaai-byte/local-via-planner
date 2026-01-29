import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Building2, Clock, AlertCircle, Plus, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SuggestionsSection } from '@/components/contributor/SuggestionsSection';
import { ContributorOnboarding } from '@/components/contributor/ContributorOnboarding';
import type { Tables } from '@/integrations/supabase/types';

type Place = Tables<'places'>;
type City = Tables<'cities'>;

interface ContributorStats {
  totalPlaces: number;
  pendingReview: number;
  approved: number;
  drafts: number;
}

export default function ContributorDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const [assignedCity, setAssignedCity] = useState<City | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [stats, setStats] = useState<ContributorStats>({ totalPlaces: 0, pendingReview: 0, approved: 0, drafts: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      fetchContributorData();
    }
  }, [user]);
  
  const fetchContributorData = async () => {
    if (!user) return;
    
    try {
      // Fetch user role with assigned city
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('assigned_city_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      let cityId = userRole?.assigned_city_id;
      
      // If user has an assigned city, fetch city details
      if (cityId) {
        const { data: city } = await supabase
          .from('cities')
          .select('*')
          .eq('id', cityId)
          .maybeSingle();
        
        setAssignedCity(city);
      }
      
      // Fetch ALL places in the assigned city (to prevent duplicates)
      if (cityId) {
        const { data: cityPlaces } = await supabase
          .from('places')
          .select('*')
          .eq('city_id', cityId)
          .order('updated_at', { ascending: false });

        if (cityPlaces) {
          setPlaces(cityPlaces);

          // Calculate stats (city-wide)
          setStats({
            totalPlaces: cityPlaces.length,
            pendingReview: cityPlaces.filter(p => p.status === 'pending_review').length,
            approved: cityPlaces.filter(p => p.status === 'approved').length,
            drafts: cityPlaces.filter(p => p.status === 'draft').length,
          });
        } else {
          setPlaces([]);
          setStats({ totalPlaces: 0, pendingReview: 0, approved: 0, drafts: 0 });
        }
      } else {
        setPlaces([]);
        setStats({ totalPlaces: 0, pendingReview: 0, approved: 0, drafts: 0 });
      }
    } catch (error) {
      console.error('Error fetching contributor data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Bozza</Badge>;
      case 'pending_review':
        return <Badge variant="outline" className="border-amber-500 text-amber-600">In revisione</Badge>;
      case 'approved':
        return <Badge className="bg-primary text-primary-foreground">Approvato</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rifiutato</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  
  const getPlaceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      attraction: 'Attrazione',
      bar: 'Bar',
      restaurant: 'Ristorante',
      club: 'Club',
      view: 'Panorama',
      experience: 'Esperienza',
    };
    return labels[type] || type;
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Onboarding modal */}
      <ContributorOnboarding />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-terracotta" />
            <span className="font-display font-semibold">LocalVia</span>
            <Badge variant="outline" className="ml-2">Contributor</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Esci
          </Button>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="font-display text-2xl font-semibold">
            Ciao, Contributor! 👋
          </h1>
          <p className="text-muted-foreground">
            Benvenuto nella tua area personale. Da qui puoi gestire i tuoi luoghi e contribuire a LocalVia.
          </p>
        </motion.div>
        
        {/* Assigned City */}
        {assignedCity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-terracotta/10 to-terracotta/5 border-terracotta/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-terracotta/20 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-terracotta" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">La tua città</p>
                    <h2 className="font-display text-xl font-semibold">{assignedCity.name}</h2>
                    {assignedCity.region && (
                      <p className="text-sm text-muted-foreground">{assignedCity.region}, {assignedCity.country}</p>
                    )}
                  </div>
                  <Button 
                    onClick={() => navigate(`/contributor/places/new`)}
                    className="bg-terracotta hover:bg-terracotta/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi Luogo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{stats.totalPlaces}</p>
              <p className="text-xs text-muted-foreground">Totale luoghi</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{stats.pendingReview}</p>
              <p className="text-xs text-muted-foreground">In revisione</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.approved}</p>
              <p className="text-xs text-muted-foreground">Approvati</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-muted-foreground">{stats.drafts}</p>
              <p className="text-xs text-muted-foreground">Bozze</p>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* AI Suggestions to classify */}
        {assignedCity && user && (
          <SuggestionsSection cityId={assignedCity.id} userId={user.id} />
        )}
        
        {/* Places List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display">Luoghi già segnalati</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {places.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                    <MapPin className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-2">Nessun luogo ancora</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Non risultano luoghi per la tua città (o non hai accesso). Prova a ricaricare.
                  </p>
                  {assignedCity && (
                    <Button 
                      onClick={() => navigate(`/contributor/places/new`)}
                      className="bg-terracotta hover:bg-terracotta/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Aggiungi il primo luogo
                    </Button>
                  )}
                </div>
              ) : (
                <div className="divide-y">
                  {places.map((place) => {
                    const canEdit = !!user && place.status === 'draft' && place.created_by === user.id;
                    return (
                      <div 
                        key={place.id}
                        className={`p-4 transition-colors ${canEdit ? 'hover:bg-muted/50 cursor-pointer' : 'cursor-default'}`}
                        onClick={canEdit ? () => navigate(`/contributor/places/${place.id}/edit`) : undefined}
                        role={canEdit ? 'button' : undefined}
                        tabIndex={canEdit ? 0 : -1}
                        onKeyDown={canEdit ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate(`/contributor/places/${place.id}/edit`);
                          }
                        } : undefined}
                      >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate">{place.name}</h4>
                            {getStatusBadge(place.status)}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{getPlaceTypeLabel(place.place_type)}</span>
                            {place.zone && (
                              <>
                                <span>•</span>
                                <span>{place.zone}</span>
                              </>
                            )}
                          </div>
                          {place.local_one_liner && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                              "{place.local_one_liner}"
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(place.updated_at).toLocaleDateString('it-IT')}
                        </div>
                      </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Call to Action for no assigned city */}
        {!assignedCity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Nessuna città assegnata</h3>
                <p className="text-sm text-muted-foreground">
                  Contatta un amministratore per essere assegnato a una città.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
