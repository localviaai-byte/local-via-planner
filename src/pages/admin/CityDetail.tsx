import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Settings, MapPin, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCity, useCityZones } from '@/hooks/useCities';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PlaceType, PlaceStatus } from '@/types/database';
import { PLACE_TYPE_OPTIONS } from '@/types/database';
import { DiscoveryPanel } from '@/components/admin/DiscoveryPanel';
import { CityConnectionsPanel } from '@/components/admin/CityConnectionsPanel';
import { ProductsPanel } from '@/components/admin/ProductsPanel';

const STATUS_CONFIG: Record<PlaceStatus, { label: string; color: string }> = {
  draft: { label: 'Bozza', color: 'bg-muted text-muted-foreground' },
  pending_review: { label: 'In revisione', color: 'bg-gold/20 text-gold' },
  approved: { label: 'Approvato', color: 'bg-olive/20 text-olive' },
  rejected: { label: 'Rifiutato', color: 'bg-destructive/20 text-destructive' },
  archived: { label: 'Archiviato', color: 'bg-muted text-muted-foreground' },
};

export default function CityDetail() {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  
  const { data: city, isLoading: cityLoading } = useCity(cityId);
  const { data: zones } = useCityZones(cityId);
  
  // Fetch places for this city
  const { data: places, isLoading: placesLoading } = useQuery({
    queryKey: ['city-places', cityId],
    queryFn: async () => {
      if (!cityId) return [];
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .eq('city_id', cityId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!cityId
  });
  
  // Group places by type
  const placesByType = PLACE_TYPE_OPTIONS.reduce((acc, type) => {
    acc[type.id] = places?.filter(p => p.place_type === type.id) || [];
    return acc;
  }, {} as Record<string, typeof places>);
  
  if (cityLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="h-32 rounded-2xl skeleton-sand mb-4" />
        <div className="h-48 rounded-2xl skeleton-sand" />
      </div>
    );
  }
  
  if (!city) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Città non trovata</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header with cover */}
      <header className="relative">
        <div className="h-40 bg-gradient-to-br from-terracotta/30 to-olive/20">
          {city.cover_image_url && (
            <img 
              src={city.cover_image_url} 
              alt={city.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-overlay" />
        </div>
        
        {/* Nav bar overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-background/80 backdrop-blur-sm"
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="bg-background/80 backdrop-blur-sm"
            onClick={() => navigate(`/admin/cities/${cityId}/edit`)}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
        
        {/* City info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h1 className="font-display text-3xl font-bold">{city.name}</h1>
          {city.region && (
            <p className="text-white/80">{city.region}, {city.country}</p>
          )}
        </div>
      </header>
      
      {/* Quick stats */}
      <div className="p-4 -mt-4">
        <Card className="bg-card shadow-card">
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-2 text-center">
              {PLACE_TYPE_OPTIONS.slice(0, 4).map(type => (
                <div key={type.id} className="p-2">
                  <span className="text-2xl">{type.icon}</span>
                  <p className="text-lg font-semibold">{placesByType[type.id]?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">{type.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* City Connections Panel */}
      <div className="px-4 pt-2">
        <CityConnectionsPanel 
          cityId={cityId!}
          cityName={city.name}
        />
      </div>
      
      {/* Discovery Panel */}
      <div className="px-4 pt-2">
        <DiscoveryPanel 
          cityId={cityId!}
          cityName={city.name}
          region={city.region || undefined}
          country={city.country}
        />
      </div>
      
      {/* Products/Add-ons Panel */}
      <div className="px-4 pt-2">
        <ProductsPanel 
          cityId={cityId!}
          cityName={city.name}
        />
      </div>
      
      {/* Content tabs */}
      <Tabs defaultValue="all" className="p-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">Tutto</TabsTrigger>
          {PLACE_TYPE_OPTIONS.map(type => (
            <TabsTrigger key={type.id} value={type.id}>
              {type.icon} {placesByType[type.id]?.length || 0}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* All content */}
        <TabsContent value="all" className="mt-4 space-y-3">
          {placesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 rounded-xl skeleton-sand" />
              ))}
            </div>
          ) : places && places.length > 0 ? (
            places.map(place => (
              <PlaceRow 
                key={place.id} 
                place={place} 
                onClick={() => navigate(`/admin/places/${place.id}/edit`)}
              />
            ))
          ) : (
            <EmptyState 
              cityId={cityId!} 
              onAdd={() => navigate(`/admin/cities/${cityId}/places/new`)} 
            />
          )}
        </TabsContent>
        
        {/* Type-specific tabs */}
        {PLACE_TYPE_OPTIONS.map(type => (
          <TabsContent key={type.id} value={type.id} className="mt-4 space-y-3">
            {placesByType[type.id]?.length ? (
              placesByType[type.id]?.map(place => (
                <PlaceRow 
                  key={place.id} 
                  place={place} 
                  onClick={() => navigate(`/admin/places/${place.id}/edit`)}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <span className="text-4xl">{type.icon}</span>
                <p className="mt-2">Nessun {type.label.toLowerCase()} ancora</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Zones section */}
      {zones && zones.length > 0 && (
        <div className="p-4 border-t">
          <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-terracotta" />
            Zone / Quartieri
          </h3>
          <div className="flex flex-wrap gap-2">
            {zones.map(zone => (
              <Badge key={zone.id} variant="secondary" className="text-sm">
                {zone.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* FAB */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6"
      >
        <Button
          size="lg"
          className="rounded-full shadow-elevated h-14 px-6"
          onClick={() => navigate(`/admin/cities/${cityId}/places/new`)}
        >
          <Plus className="w-5 h-5 mr-2" />
          Aggiungi contenuto
        </Button>
      </motion.div>
    </div>
  );
}

interface PlaceRowProps {
  place: {
    id: string;
    name: string;
    place_type: PlaceType;
    status: PlaceStatus;
    zone: string | null;
    quality_score: number;
  };
  onClick: () => void;
}

function PlaceRow({ place, onClick }: PlaceRowProps) {
  const typeConfig = PLACE_TYPE_OPTIONS.find(t => t.id === place.place_type);
  const statusConfig = STATUS_CONFIG[place.status];
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-card transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">
            {typeConfig?.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{place.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge className={`text-xs ${statusConfig.color}`}>
                {statusConfig.label}
              </Badge>
              {place.zone && (
                <span className="text-xs text-muted-foreground truncate">
                  {place.zone}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              ⭐ {place.quality_score}
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ cityId, onAdd }: { cityId: string; onAdd: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
        <Plus className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-display text-lg font-medium mb-2">
        Città pronta, contenuti mancanti
      </h3>
      <p className="text-muted-foreground text-sm mb-6">
        Inizia ad aggiungere attrazioni, ristoranti, bar...
      </p>
      <Button onClick={onAdd}>
        <Plus className="w-4 h-4 mr-2" />
        Aggiungi primo contenuto
      </Button>
    </div>
  );
}
