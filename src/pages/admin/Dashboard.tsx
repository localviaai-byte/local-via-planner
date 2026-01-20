import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useContributorPlaces } from '@/hooks/usePlaces';
import { 
  Plus, 
  MapPin, 
  FileEdit, 
  Clock, 
  CheckCircle, 
  Star,
  LogOut,
  ChevronRight
} from 'lucide-react';
import type { Place } from '@/types/database';

function PlaceCard({ place }: { place: Place }) {
  const navigate = useNavigate();
  
  const statusConfig = {
    draft: { label: 'Bozza', color: 'bg-muted text-muted-foreground' },
    pending_review: { label: 'In revisione', color: 'bg-gold/20 text-gold' },
    approved: { label: 'Approvato', color: 'bg-olive/20 text-olive' },
    rejected: { label: 'Da rivedere', color: 'bg-destructive/20 text-destructive' },
    archived: { label: 'Archiviato', color: 'bg-muted text-muted-foreground' },
  };
  
  const status = statusConfig[place.status];

  return (
    <motion.button
      onClick={() => navigate(`/admin/places/${place.id}/edit`)}
      className="w-full text-left card-editorial p-4 hover:shadow-card transition-shadow"
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
          {place.photo_url ? (
            <img 
              src={place.photo_url} 
              alt={place.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <MapPin className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-foreground truncate">{place.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground truncate">
            {place.zone || place.address || 'Nessun indirizzo'}
          </p>
          
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              Qualità: {place.quality_score}/6
            </span>
          </div>
        </div>
        
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      </div>
    </motion.button>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();
  const { data, isLoading } = useContributorPlaces(user?.id);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const draftPlaces = data?.places.filter(p => p.status === 'draft') || [];
  const pendingPlaces = data?.places.filter(p => p.status === 'pending_review') || [];
  const approvedPlaces = data?.places.filter(p => p.status === 'approved') || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-lg font-semibold text-foreground">
              LocalVia
            </h1>
            <p className="text-xs text-muted-foreground capitalize">
              {role?.replace('_', ' ') || 'Contributor'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 pb-24 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card-editorial p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <FileEdit className="w-4 h-4" />
              <span className="text-xs">Bozze</span>
            </div>
            <p className="text-2xl font-display font-semibold">
              {data?.stats.drafts || 0}
            </p>
          </div>
          
          <div className="card-editorial p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">In revisione</span>
            </div>
            <p className="text-2xl font-display font-semibold">
              {data?.stats.pending || 0}
            </p>
          </div>
          
          <div className="card-editorial p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs">Approvati</span>
            </div>
            <p className="text-2xl font-display font-semibold">
              {data?.stats.approved || 0}
            </p>
          </div>
          
          <div className="card-editorial p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Star className="w-4 h-4" />
              <span className="text-xs">Qualità media</span>
            </div>
            <p className="text-2xl font-display font-semibold">
              {data?.stats.avgQuality || 0}
              <span className="text-sm text-muted-foreground">/6</span>
            </p>
          </div>
        </div>

        {/* Needs attention */}
        {draftPlaces.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-semibold mb-3">
              Questi posti hanno bisogno del tuo tocco da local
            </h2>
            <div className="space-y-3">
              {draftPlaces.slice(0, 3).map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </section>
        )}

        {/* Pending review */}
        {pendingPlaces.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-semibold mb-3">
              In attesa di approvazione
            </h2>
            <div className="space-y-3">
              {pendingPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </section>
        )}

        {/* Approved */}
        {approvedPlaces.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-semibold mb-3">
              I tuoi luoghi approvati
            </h2>
            <div className="space-y-3">
              {approvedPlaces.slice(0, 5).map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!isLoading && data?.places.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold mb-2">
              Nessun luogo inserito
            </h2>
            <p className="text-muted-foreground mb-6">
              Inizia a condividere i tuoi posti preferiti con il mondo
            </p>
          </div>
        )}
      </main>

      {/* Floating action button */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={() => navigate('/admin/places/new')}
          className="w-14 h-14 rounded-full shadow-elevated"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
