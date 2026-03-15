import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, ExternalLink, MapPin, Clock, Users, Heart, AlertTriangle, Star, Image, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { usePlace, useUpdatePlace } from '@/hooks/usePlaces';
import { useCity } from '@/hooks/useCities';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { TripAdvisorBadge } from '@/components/admin/wizard/TripAdvisorBadge';
import {
  PLACE_TYPE_OPTIONS,
  WHY_PEOPLE_GO_OPTIONS,
  VIBE_LABEL_OPTIONS,
  IDEAL_FOR_OPTIONS,
  BEST_TIMES_OPTIONS,
  BEST_DAYS_OPTIONS,
  TARGET_AUDIENCE_OPTIONS,
  SUGGESTED_STAY_OPTIONS,
  PRICE_RANGE_OPTIONS,
  GENDER_BALANCE_OPTIONS,
} from '@/types/database';
import type { PlaceStatus } from '@/types/database';

const STATUS_CONFIG: Record<PlaceStatus, { label: string; color: string }> = {
  draft: { label: 'Bozza', color: 'bg-muted text-muted-foreground' },
  pending_review: { label: 'In revisione', color: 'bg-gold/20 text-gold' },
  approved: { label: 'Approvato', color: 'bg-olive/20 text-olive' },
  rejected: { label: 'Rifiutato', color: 'bg-destructive/20 text-destructive' },
  archived: { label: 'Archiviato', color: 'bg-muted text-muted-foreground' },
};

function VibeBar({ label, value }: { label: string; value: number | null }) {
  if (value == null) return null;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground w-32 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-terracotta/70 rounded-full transition-all"
          style={{ width: `${((value - 1) / 4) * 100}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-4 text-right">{value}</span>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      {icon && <div className="mt-0.5 text-muted-foreground">{icon}</div>}
      <div className="flex-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

function ChipList({ items, optionsList }: { items: string[]; optionsList: readonly { id: string; label: string; icon?: string }[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(item => {
        const opt = optionsList.find(o => o.id === item);
        return (
          <Badge key={item} variant="secondary" className="text-xs">
            {opt?.icon && <span className="mr-1">{opt.icon}</span>}
            {opt?.label || item}
          </Badge>
        );
      })}
    </div>
  );
}

export default function PlaceDetail() {
  const navigate = useNavigate();
  const { id: placeId } = useParams<{ id: string }>();
  const { role } = useAuth();
  const { data: place, isLoading } = usePlace(placeId);
  const { data: city } = useCity(place?.city_id);
  const updatePlace = useUpdatePlace();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState<string | null>(null);

  const handleGenerateDescription = async () => {
    if (!place || !city) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-place-description', {
        body: {
          placeName: place.name,
          placeType: place.place_type,
          cityName: city.name,
          cityRegion: city.region,
          zone: place.zone,
          whyPeopleGo: place.why_people_go,
          localOneLiner: place.local_one_liner,
          moodPrimary: place.mood_primary,
          moodSecondary: place.mood_secondary,
          idealFor: place.ideal_for,
          bestTimes: place.best_times,
          localWarning: place.local_warning,
          cuisineType: place.cuisine_type,
          priceRange: place.price_range,
          soloFriendly: place.solo_friendly,
          groupFriendly: place.group_friendly,
          localSecret: place.local_secret,
          touristTrap: place.tourist_trap,
          vibeCalm: place.vibe_calm_to_energetic,
          vibeTouristy: place.vibe_touristy_to_local,
        },
      });
      if (error) throw error;
      if (data?.description) {
        setGeneratedDescription(data.description);
      } else {
        throw new Error('Nessuna descrizione generata');
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Errore nella generazione della descrizione');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDescription = async (description: string) => {
    if (!place) return;
    updatePlace.mutate(
      { id: place.id, description } as any,
      {
        onSuccess: () => {
          toast.success('Descrizione salvata');
          setGeneratedDescription(null);
          queryClient.invalidateQueries({ queryKey: ['place', place.id] });
        },
        onError: () => toast.error('Errore nel salvataggio'),
      }
    );
  };

  // Fetch place media
  const { data: media } = useQuery({
    queryKey: ['place-media', placeId],
    queryFn: async () => {
      if (!placeId) return [];
      const { data, error } = await supabase
        .from('place_media')
        .select('*')
        .eq('place_id', placeId)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
    enabled: !!placeId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-6">
          <span className="text-xl font-semibold">Luogo non trovato</span>
          <br />
          <Button className="mt-4" onClick={() => navigate(-1)}>Indietro</Button>
        </div>
      </div>
    );
  }

  const typeConfig = PLACE_TYPE_OPTIONS.find(t => t.id === place.place_type);
  const statusConfig = STATUS_CONFIG[place.status];
  const isAdmin = role === 'admin';
  const isEditor = role === 'editor';
  const canEdit = isAdmin || isEditor;

  const allPhotos = [
    ...(place.photo_url ? [place.photo_url] : []),
    ...(media?.map(m => m.media_url) || []),
  ].filter((v, i, a) => a.indexOf(v) === i); // deduplicate

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with photo */}
      <header className="relative">
        <div className="h-52 bg-gradient-to-br from-terracotta/20 to-olive/10">
          {allPhotos[0] && (
            <img src={allPhotos[0]} alt={place.name} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="bg-background/80 backdrop-blur-sm"
            onClick={() => navigate(place.city_id ? `/admin/cities/${place.city_id}` : '/admin')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          {canEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/80 backdrop-blur-sm"
              onClick={() => navigate(`/admin/places/${place.id}/edit`)}
            >
              <Edit className="w-5 h-5" />
            </Button>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{typeConfig?.icon}</span>
            <Badge className={`text-xs ${statusConfig.color}`}>{statusConfig.label}</Badge>
          </div>
          <h1 className="font-display text-2xl font-bold">{place.name}</h1>
          {city && <p className="text-white/80 text-sm">{city.name}{city.region ? `, ${city.region}` : ''}</p>}
        </div>
      </header>

      {/* Photo gallery thumbnails */}
      {allPhotos.length > 1 && (
        <div className="px-4 pt-3 flex gap-2 overflow-x-auto">
          {allPhotos.slice(1, 6).map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`${place.name} foto ${i + 2}`}
              className="w-20 h-16 rounded-lg object-cover shrink-0 border border-border"
            />
          ))}
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* TripAdvisor */}
        {place.tripadvisor_rating && (
          <TripAdvisorBadge
            rating={place.tripadvisor_rating}
            reviewsCount={place.tripadvisor_reviews_count}
            ranking={place.tripadvisor_ranking}
            rankingCategory={place.tripadvisor_ranking_category}
            url={place.tripadvisor_url}
            enrichedAt={place.tripadvisor_enriched_at}
          />
        )}

        {/* Quick info card */}
        <Card>
          <CardContent className="p-4 space-y-1">
            {place.address && (
              <InfoRow icon={<MapPin className="w-4 h-4" />} label="Indirizzo" value={place.address} />
            )}
            {place.zone && (
              <InfoRow label="Zona" value={place.zone} />
            )}
            {place.local_one_liner && (
              <div className="py-3 px-4 -mx-4 bg-secondary/30 rounded-xl my-2 italic text-sm">
                "{place.local_one_liner}"
              </div>
            )}
            {place.price_range && (
              <InfoRow label="Fascia di prezzo" value={
                PRICE_RANGE_OPTIONS.find(p => p.id === place.price_range)?.label || place.price_range
              } />
            )}
            {place.cuisine_type && (
              <InfoRow label="Cucina" value={place.cuisine_type} />
            )}
            {place.suggested_stay && (
              <InfoRow icon={<Clock className="w-4 h-4" />} label="Durata consigliata" value={
                SUGGESTED_STAY_OPTIONS.find(s => s.id === place.suggested_stay)?.label
              } />
            )}
          </CardContent>
        </Card>

        {/* Why people go */}
        {place.why_people_go && place.why_people_go.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-2">Perché ci vai</h3>
              <ChipList items={place.why_people_go} optionsList={WHY_PEOPLE_GO_OPTIONS} />
              {place.why_other && (
                <p className="text-sm text-muted-foreground mt-2">{place.why_other}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Social & Audience */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold">Social & Pubblico</h3>
            {place.social_level && (
              <InfoRow icon={<Users className="w-4 h-4" />} label="Livello sociale" value={`${place.social_level}/5`} />
            )}
            {place.target_audience && (
              <InfoRow label="Pubblico" value={
                TARGET_AUDIENCE_OPTIONS.find(t => t.id === place.target_audience)?.label
              } />
            )}
            {place.gender_balance && place.gender_balance !== 'unknown' && (
              <InfoRow label="Bilancio genere" value={
                GENDER_BALANCE_OPTIONS.find(g => g.id === place.gender_balance)?.label
              } />
            )}
            <div className="flex flex-wrap gap-1.5">
              {place.solo_friendly && <Badge variant="secondary" className="text-xs">🎒 Solo friendly</Badge>}
              {place.group_friendly && <Badge variant="secondary" className="text-xs">👥 Per gruppi</Badge>}
              {place.flirt_friendly && <Badge variant="secondary" className="text-xs">😏 Flirt friendly</Badge>}
            </div>
          </CardContent>
        </Card>

        {/* Ideal for */}
        {place.ideal_for && place.ideal_for.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-2">Ideale per</h3>
              <ChipList items={place.ideal_for} optionsList={IDEAL_FOR_OPTIONS} />
            </CardContent>
          </Card>
        )}

        {/* Vibe / Atmosphere */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold">Atmosfera</h3>
            {place.mood_primary && (
              <div className="flex gap-2">
                <Badge variant="outline">
                  {VIBE_LABEL_OPTIONS.find(v => v.id === place.mood_primary)?.icon}{' '}
                  {VIBE_LABEL_OPTIONS.find(v => v.id === place.mood_primary)?.label}
                </Badge>
                {place.mood_secondary && (
                  <Badge variant="outline">
                    {VIBE_LABEL_OPTIONS.find(v => v.id === place.mood_secondary)?.icon}{' '}
                    {VIBE_LABEL_OPTIONS.find(v => v.id === place.mood_secondary)?.label}
                  </Badge>
                )}
              </div>
            )}
            <div className="space-y-2">
              <VibeBar label="Calmo → Energetico" value={place.vibe_calm_to_energetic} />
              <VibeBar label="Silenzioso → Rumoroso" value={place.vibe_quiet_to_loud} />
              <VibeBar label="Vuoto → Affollato" value={place.vibe_empty_to_crowded} />
              <VibeBar label="Turistico → Local" value={place.vibe_touristy_to_local} />
            </div>
          </CardContent>
        </Card>

        {/* Insider */}
        {(place.tourist_trap || place.overrated || place.local_secret) && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-2">Insider</h3>
              <div className="flex flex-wrap gap-1.5">
                {place.tourist_trap && <Badge variant="destructive" className="text-xs">⚠️ Trappola turisti</Badge>}
                {place.overrated && <Badge variant="secondary" className="text-xs">👎 Sopravvalutato</Badge>}
                {place.local_secret && <Badge className="text-xs bg-olive/20 text-olive">🤫 Segreto locale</Badge>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timing */}
        {(place.best_times?.length > 0 || place.best_days?.length > 0) && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold">Quando andare</h3>
              {place.best_times?.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground">Orari migliori</span>
                  <ChipList items={place.best_times} optionsList={BEST_TIMES_OPTIONS} />
                </div>
              )}
              {place.best_days?.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground">Giorni migliori</span>
                  <ChipList items={place.best_days} optionsList={BEST_DAYS_OPTIONS} />
                </div>
              )}
              {place.periods_to_avoid && (
                <InfoRow icon={<AlertTriangle className="w-4 h-4" />} label="Da evitare" value={place.periods_to_avoid} />
              )}
              {place.dead_times_note && (
                <InfoRow label="Tempi morti" value={place.dead_times_note} />
              )}
            </CardContent>
          </Card>
        )}

        {/* Warnings */}
        {place.local_warning && (
          <Card className="border-gold/30">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-1 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-gold" /> Avvertenza locale
              </h3>
              <p className="text-sm text-muted-foreground">{place.local_warning}</p>
            </CardContent>
          </Card>
        )}

        {/* Quality score */}
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Quality score</span>
            <Badge variant="outline" className="text-sm">
              <Star className="w-3.5 h-3.5 mr-1" /> {place.quality_score ?? 0}/100
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Fixed bottom edit button */}
      {canEdit && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 pb-safe-bottom">
          <Button
            className="w-full"
            onClick={() => navigate(`/admin/places/${place.id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifica luogo
          </Button>
        </div>
      )}
    </div>
  );
}
