import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Building2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCitiesWithStats } from '@/hooks/useCities';
import type { CityStatus } from '@/types/database';

const STATUS_CONFIG: Record<CityStatus, { label: string; color: string }> = {
  empty: { label: 'Vuota', color: 'bg-muted text-muted-foreground' },
  building: { label: 'In costruzione', color: 'bg-gold/20 text-gold' },
  active: { label: 'Attiva', color: 'bg-olive/20 text-olive' },
};

interface CityCardProps {
  city: {
    id: string;
    name: string;
    region: string | null;
    status: CityStatus;
    cover_image_url: string | null;
    stats: {
      attractions: number;
      restaurants: number;
      bars: number;
      experiences: number;
      views: number;
      zones: number;
      total: number;
    };
  };
  onClick: () => void;
}

function CityCard({ city, onClick }: CityCardProps) {
  const statusConfig = STATUS_CONFIG[city.status] || STATUS_CONFIG.empty;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="cursor-pointer overflow-hidden hover:shadow-card transition-shadow"
        onClick={onClick}
      >
        {/* Cover image or placeholder */}
        <div className="h-32 bg-gradient-to-br from-terracotta/20 to-olive/20 relative">
          {city.cover_image_url && (
            <img 
              src={city.cover_image_url} 
              alt={city.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-overlay opacity-40" />
          <Badge className={`absolute top-3 right-3 ${statusConfig.color}`}>
            {statusConfig.label}
          </Badge>
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-display text-lg font-semibold">{city.name}</h3>
              {city.region && (
                <p className="text-sm text-muted-foreground">{city.region}</p>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground mt-1" />
          </div>
          
          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-secondary/50">
              <span className="text-lg">🏛️</span>
              <p className="text-xs text-muted-foreground mt-1">{city.stats.attractions}</p>
            </div>
            <div className="p-2 rounded-lg bg-secondary/50">
              <span className="text-lg">🍽️</span>
              <p className="text-xs text-muted-foreground mt-1">{city.stats.restaurants}</p>
            </div>
            <div className="p-2 rounded-lg bg-secondary/50">
              <span className="text-lg">🍷</span>
              <p className="text-xs text-muted-foreground mt-1">{city.stats.bars}</p>
            </div>
          </div>
          
          {city.stats.total > 0 && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              {city.stats.total} contenuti totali
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function CitiesSection() {
  const navigate = useNavigate();
  const { data: cities, isLoading } = useCitiesWithStats();
  
  return (
    <div>
      {/* Section header */}
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold flex items-center gap-2">
          <Building2 className="w-6 h-6 text-terracotta" />
          Città
        </h2>
        <p className="text-muted-foreground mt-1">
          Tutto inizia da una città. Seleziona o crea.
        </p>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-2xl skeleton-sand" />
          ))}
        </div>
      )}
      
      {/* Cities list */}
      {!isLoading && cities && cities.length > 0 && (
        <div className="space-y-4">
          {cities.map(city => (
            <CityCard
              key={city.id}
              city={city}
              onClick={() => navigate(`/admin/cities/${city.id}`)}
            />
          ))}
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && (!cities || cities.length === 0) && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-lg font-medium mb-2">
            Nessuna città ancora
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            Inizia creando la prima città per il tuo ecosistema
          </p>
          <Button onClick={() => navigate('/admin/cities/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Aggiungi città
          </Button>
        </div>
      )}
      
      {/* FAB */}
      {cities && cities.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-6"
        >
          <Button
            size="lg"
            className="rounded-full shadow-elevated h-14 px-6"
            onClick={() => navigate('/admin/cities/new')}
          >
            <Plus className="w-5 h-5 mr-2" />
            Aggiungi città
          </Button>
        </motion.div>
      )}
    </div>
  );
}
