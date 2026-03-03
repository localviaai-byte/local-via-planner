import { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Star, 
  Users, 
  Utensils, 
  ExternalLink,
  Loader2,
  AlertTriangle,
  CalendarDays,
  Shirt,
  Heart,
  Footprints,
  Brain,
  Eye,
  Bookmark,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import type { ItineraryPlace } from '@/hooks/useGenerateItinerary';

interface FullPlaceData {
  id: string;
  name: string;
  place_type: string;
  address: string | null;
  zone: string | null;
  local_one_liner: string | null;
  local_warning: string | null;
  duration_minutes: number | null;
  price_range: string | null;
  cuisine_type: string | null;
  photo_url: string | null;
  indoor_outdoor: string | null;
  crowd_level: string | null;
  vibe_touristy_to_local: number | null;
  vibe_calm_to_energetic: number | null;
  vibe_quiet_to_loud: number | null;
  latitude: number | null;
  longitude: number | null;
  // TripAdvisor
  tripadvisor_rating: number | null;
  tripadvisor_reviews_count: number | null;
  tripadvisor_url: string | null;
  tripadvisor_image_url: string | null;
  tripadvisor_ranking: number | null;
  tripadvisor_ranking_category: string | null;
  tripadvisor_price_level: string | null;
  // Extra details
  why_people_go: string[] | null;
  best_times: string[] | null;
  best_days: string[] | null;
  best_period: string | null;
  periods_to_avoid: string | null;
  needs_booking: boolean | null;
  ideal_for: string[];
  physical_effort: number | null;
  mental_effort: number | null;
  suggested_stay: string | null;
  dress_code: string | null;
  food_primary: string | null;
  food_secondary: string[] | null;
  dietary_options: string[] | null;
  solo_friendly: boolean | null;
  group_friendly: boolean | null;
  tourist_trap: boolean;
  overrated: boolean;
  local_secret: boolean;
  target_audience: string | null;
  format_experience: string | null;
  pace: string | null;
  dead_times_note: string | null;
  // Media
  place_media?: { media_url: string; caption: string | null; sort_order: number }[];
}

interface PlaceDetailSheetProps {
  place: (ItineraryPlace & { time?: string }) | null;
  isOpen: boolean;
  onClose: () => void;
}

const typeLabels: Record<string, string> = {
  attraction: 'Attrazione',
  restaurant: 'Ristorante',
  bar: 'Bar',
  club: 'Club',
  experience: 'Esperienza',
  view: 'Panorama',
  zone: 'Zona',
};

const idealForLabels: Record<string, string> = {
  couple: '💑 Coppia',
  friends: '👯 Amici',
  solo_traveler: '🧳 Solo',
  family: '👨‍👩‍👧 Famiglia',
  first_time: '🌟 Prima volta',
  meet_people: '🤝 Socializzare',
  chill: '😌 Relax',
  party: '🎉 Festa',
  flirt_friendly: '💘 Flirt-friendly',
};

const bestTimeLabels: Record<string, string> = {
  morning: '🌅 Mattina',
  lunch: '🍝 Pranzo',
  afternoon: '☀️ Pomeriggio',
  aperitivo: '🥂 Aperitivo',
  dinner: '🍽️ Cena',
  evening: '🌙 Sera',
  night: '🌃 Notte',
};

function EffortBar({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 w-4 rounded-full ${i < value ? 'bg-primary' : 'bg-muted-foreground/20'}`}
        />
      ))}
    </div>
  );
}

export function PlaceDetailSheet({ place, isOpen, onClose }: PlaceDetailSheetProps) {
  const [fullData, setFullData] = useState<FullPlaceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [partnerLinks, setPartnerLinks] = useState<Array<{ title: string; url: string }>>([]);
  const [partnerDescription, setPartnerDescription] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !place?.id) {
      setFullData(null);
      setMediaIndex(0);
      setPartnerLinks([]);
      setPartnerDescription(null);
      return;
    }

    const fetchFull = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('places')
          .select(`
            id, name, place_type, address, zone, local_one_liner, local_warning,
            duration_minutes, price_range, cuisine_type, photo_url, indoor_outdoor,
            crowd_level, vibe_touristy_to_local, vibe_calm_to_energetic, vibe_quiet_to_loud,
            latitude, longitude,
            tripadvisor_rating, tripadvisor_reviews_count, tripadvisor_url,
            tripadvisor_image_url, tripadvisor_ranking, tripadvisor_ranking_category,
            tripadvisor_price_level,
            why_people_go, best_times, best_days, best_period, periods_to_avoid,
            needs_booking, ideal_for, physical_effort, mental_effort, suggested_stay,
            dress_code, food_primary, food_secondary, dietary_options,
            solo_friendly, group_friendly, tourist_trap, overrated, local_secret,
            target_audience, format_experience, pace, dead_times_note,
            place_media(media_url, caption, sort_order)
          `)
          .eq('id', place.id)
          .single();

        if (!error && data) {
          setFullData(data as unknown as FullPlaceData);
          
          // Fetch partner info for this place
          const { data: partnerData } = await supabase
            .from('partners')
            .select('custom_links, description')
            .eq('linked_place_id', place.id)
            .eq('partner_type', 'affiliate')
            .eq('status', 'active')
            .maybeSingle();
          
          if (partnerData) {
            const links = partnerData.custom_links as any;
            if (Array.isArray(links)) {
              setPartnerLinks(links.filter((l: any) => l.title && l.url));
            }
            if (partnerData.description) {
              setPartnerDescription(partnerData.description);
            }
          }
        }
      } catch (e) {
        console.error('Error fetching place details:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchFull();
  }, [isOpen, place?.id]);

  if (!place) return null;

  // Use full data if loaded, otherwise fall back to itinerary data
  const d = fullData;
  const allMedia = d?.place_media?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const heroImages = d?.photo_url 
    ? [d.photo_url, ...allMedia.map(m => m.media_url).filter(u => u !== d.photo_url)]
    : allMedia.map(m => m.media_url);
  
  if (heroImages.length === 0 && place.photo_url) {
    heroImages.push(place.photo_url);
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[90vh] p-0 rounded-t-2xl overflow-y-auto">
        {loading && !d ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="relative pb-8">
            {/* Photo Gallery */}
            {heroImages.length > 0 ? (
              <div className="relative h-56 w-full overflow-hidden">
                <img
                  src={heroImages[mediaIndex] || heroImages[0]}
                  alt={d?.name || place.name}
                  className="w-full h-full object-cover transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                
                {/* Photo nav */}
                {heroImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setMediaIndex(i => (i - 1 + heroImages.length) % heroImages.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setMediaIndex(i => (i + 1) % heroImages.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {heroImages.map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === mediaIndex ? 'bg-white' : 'bg-white/40'}`} />
                      ))}
                    </div>
                  </>
                )}

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h2 className="font-display text-2xl font-bold leading-tight">{d?.name || place.name}</h2>
                  <p className="text-sm text-white/80 mt-1">{typeLabels[d?.place_type || place.type] || place.type}</p>
                </div>
              </div>
            ) : (
              <SheetHeader className="p-5 pb-3">
                <SheetTitle className="font-display text-xl">{d?.name || place.name}</SheetTitle>
                <SheetDescription>{typeLabels[d?.place_type || place.type] || place.type}</SheetDescription>
              </SheetHeader>
            )}

            <div className="p-5 space-y-5">
              {/* Badges row */}
              <div className="flex flex-wrap gap-2">
                {d?.local_secret && (
                  <span className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                    <Star className="w-3 h-3" /> Segreto locale
                  </span>
                )}
                {d?.tourist_trap && (
                  <span className="text-xs bg-destructive/10 text-destructive px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Trappola turistica
                  </span>
                )}
                {d?.overrated && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full font-medium">
                    ⚠️ Sopravvalutato
                  </span>
                )}
                {d?.needs_booking && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                    <Bookmark className="w-3 h-3" /> Prenotazione consigliata
                  </span>
                )}
              </div>

              {/* Local one-liner */}
              {(d?.local_one_liner || place.local_one_liner) && (
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                  <p className="text-sm italic text-foreground leading-relaxed">
                    "{d?.local_one_liner || place.local_one_liner}"
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">— Consiglio locale</p>
                </div>
              )}

              {/* Local warning */}
              {d?.local_warning && (
                <div className="bg-destructive/5 rounded-xl p-4 border border-destructive/10 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Attenzione</p>
                    <p className="text-sm text-foreground mt-1">{d.local_warning}</p>
                  </div>
                </div>
              )}

              {/* TripAdvisor section */}
              {d?.tripadvisor_rating && (
                <div className="bg-[#f2f0eb] rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#00aa6c] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">TA</span>
                    </div>
                    <span className="font-medium text-sm">TripAdvisor</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-4 h-4 rounded-full ${
                              i < Math.round(d.tripadvisor_rating!) ? 'bg-[#00aa6c]' : 'bg-[#00aa6c]/20'
                            }`}
                          />
                        ))}
                        <span className="text-sm font-bold ml-1">{d.tripadvisor_rating}</span>
                      </div>
                      {d.tripadvisor_reviews_count && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {d.tripadvisor_reviews_count.toLocaleString()} recensioni
                        </p>
                      )}
                    </div>
                    {d.tripadvisor_ranking && d.tripadvisor_ranking_category && (
                      <div className="text-xs text-muted-foreground border-l pl-4">
                        <p>#{d.tripadvisor_ranking}</p>
                        <p className="capitalize">{d.tripadvisor_ranking_category}</p>
                      </div>
                    )}
                  </div>
                  {d.tripadvisor_price_level && (
                    <p className="text-xs text-muted-foreground">
                      Fascia prezzo: <span className="font-medium text-foreground">{d.tripadvisor_price_level}</span>
                    </p>
                  )}
                  {d.tripadvisor_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-white"
                      onClick={() => window.open(d.tripadvisor_url!, '_blank')}
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-2" />
                      Vedi su TripAdvisor
                    </Button>
                  )}
                </div>
              )}

              {/* Why people go */}
              {d?.why_people_go && d.why_people_go.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Perché la gente ci va</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {d.why_people_go.map((reason) => (
                      <span key={reason} className="text-xs bg-muted px-3 py-1.5 rounded-full">
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Ideal for */}
              {d?.ideal_for && d.ideal_for.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Ideale per</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {d.ideal_for.map((tag) => (
                      <span key={tag} className="text-xs bg-primary/5 text-primary px-3 py-1.5 rounded-full">
                        {idealForLabels[tag] || tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                {(d?.duration_minutes || place.duration_minutes) && (
                  <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Durata</p>
                      <p className="text-sm font-medium">{d?.duration_minutes || place.duration_minutes} min</p>
                    </div>
                  </div>
                )}
                {(d?.price_range || place.price_range) && (
                  <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center text-lg">💰</div>
                    <div>
                      <p className="text-xs text-muted-foreground">Prezzo</p>
                      <p className="text-sm font-medium">{d?.price_range || place.price_range}</p>
                    </div>
                  </div>
                )}
                {(d?.cuisine_type || place.cuisine_type) && (
                  <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center">
                      <Utensils className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cucina</p>
                      <p className="text-sm font-medium">{d?.cuisine_type || place.cuisine_type}</p>
                    </div>
                  </div>
                )}
                {(d?.crowd_level || place.crowd_level) && (
                  <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Affollamento</p>
                      <p className="text-sm font-medium">
                        {(d?.crowd_level || place.crowd_level) === 'low' ? 'Basso' : (d?.crowd_level || place.crowd_level) === 'high' ? 'Alto' : 'Medio'}
                      </p>
                    </div>
                  </div>
                )}
                {(d?.indoor_outdoor || place.indoor_outdoor) && (
                  <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center text-lg">
                      {(d?.indoor_outdoor || place.indoor_outdoor) === 'indoor' ? '🏠' : (d?.indoor_outdoor || place.indoor_outdoor) === 'outdoor' ? '🌳' : '🔄'}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ambiente</p>
                      <p className="text-sm font-medium">
                        {(d?.indoor_outdoor || place.indoor_outdoor) === 'indoor' ? 'Indoor' : (d?.indoor_outdoor || place.indoor_outdoor) === 'outdoor' ? 'Outdoor' : 'Misto'}
                      </p>
                    </div>
                  </div>
                )}
                {d?.vibe_touristy_to_local != null && (
                  <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center">
                      <Eye className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Vibe</p>
                      <p className="text-sm font-medium">
                        {d.vibe_touristy_to_local >= 7 ? 'Molto locale' : d.vibe_touristy_to_local >= 4 ? 'Misto' : 'Turistico'}
                      </p>
                    </div>
                  </div>
                )}
                {d?.pace && (
                  <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center">
                      <Footprints className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ritmo</p>
                      <p className="text-sm font-medium capitalize">{d.pace}</p>
                    </div>
                  </div>
                )}
                {d?.target_audience && (
                  <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pubblico</p>
                      <p className="text-sm font-medium capitalize">{d.target_audience}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Effort levels */}
              {(d?.physical_effort || d?.mental_effort) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Livello di impegno</h3>
                  {d?.physical_effort != null && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Footprints className="w-4 h-4" />
                        Fisico
                      </div>
                      <EffortBar value={d.physical_effort} />
                    </div>
                  )}
                  {d?.mental_effort != null && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Brain className="w-4 h-4" />
                        Mentale
                      </div>
                      <EffortBar value={d.mental_effort} />
                    </div>
                  )}
                </div>
              )}

              {/* Best times */}
              {d?.best_times && d.best_times.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Momenti migliori</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {d.best_times.map((t) => (
                      <span key={t} className="text-xs bg-muted px-3 py-1.5 rounded-full">
                        {bestTimeLabels[t] || t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Best period / avoid */}
              {(d?.best_period || d?.periods_to_avoid) && (
                <div className="space-y-2">
                  {d?.best_period && (
                    <div className="flex items-start gap-2 text-sm">
                      <CalendarDays className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-muted-foreground">Periodo migliore: </span>
                        <span className="font-medium">{d.best_period}</span>
                      </div>
                    </div>
                  )}
                  {d?.periods_to_avoid && (
                    <div className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-muted-foreground">Da evitare: </span>
                        <span className="font-medium">{d.periods_to_avoid}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dead times */}
              {d?.dead_times_note && (
                <div className="flex items-start gap-2 text-sm bg-orange-50 rounded-xl p-3">
                  <Clock className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-orange-700">Orari morti: </span>
                    <span className="text-foreground">{d.dead_times_note}</span>
                  </div>
                </div>
              )}

              {/* Food details */}
              {(d?.food_primary || (d?.dietary_options && d.dietary_options.length > 0)) && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Dettagli cucina</h3>
                  <div className="space-y-2">
                    {d?.food_primary && (
                      <p className="text-sm text-muted-foreground">
                        Specialità: <span className="font-medium text-foreground">{d.food_primary}</span>
                        {d.food_secondary && d.food_secondary.length > 0 && (
                          <span>, {d.food_secondary.join(', ')}</span>
                        )}
                      </p>
                    )}
                    {d?.dietary_options && d.dietary_options.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {d.dietary_options.map((opt) => (
                          <span key={opt} className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
                            ✓ {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dress code */}
              {d?.dress_code && (
                <div className="flex items-center gap-2 text-sm">
                  <Shirt className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Dress code: </span>
                  <span className="font-medium">{d.dress_code}</span>
                </div>
              )}

              {/* Format experience */}
              {d?.format_experience && (
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Esperienza: </span>
                  <span className="font-medium">{d.format_experience}</span>
                </div>
              )}

              {/* Solo / Group friendly */}
              {(d?.solo_friendly || d?.group_friendly) && (
                <div className="flex gap-3">
                  {d?.solo_friendly && (
                    <span className="text-xs bg-muted px-3 py-1.5 rounded-full">🧳 Solo-friendly</span>
                  )}
                  {d?.group_friendly && (
                    <span className="text-xs bg-muted px-3 py-1.5 rounded-full">👥 Gruppi OK</span>
                  )}
                </div>
              )}

              {/* Address */}
              {(d?.address || place.address) && (
                <div className="flex items-start gap-3 p-3 bg-muted rounded-xl">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Indirizzo</p>
                    <p className="text-sm font-medium">{d?.address || place.address}</p>
                  </div>
                </div>
              )}

              {/* Zone */}
              {(d?.zone || place.zone) && (
                <div className="text-sm text-muted-foreground">
                  📍 Zona: <span className="font-medium text-foreground">{d?.zone || place.zone}</span>
                </div>
              )}

              {/* Partner description */}
              {partnerDescription && (
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">Dal gestore</h3>
                  <p className="text-sm text-muted-foreground">{partnerDescription}</p>
                </div>
              )}

              {/* Partner custom links */}
              {partnerLinks.length > 0 && (
                <div className="space-y-2">
                  {partnerLinks.map((link, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open(link.url.startsWith('http') ? link.url : `https://${link.url}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2 flex-shrink-0" />
                      {link.title}
                    </Button>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-2">
                {(d?.latitude || place.latitude) && (d?.longitude || place.longitude) && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${d?.latitude || place.latitude},${d?.longitude || place.longitude}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Apri in Google Maps
                  </Button>
                )}
                {d?.tripadvisor_url && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(d.tripadvisor_url!, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Vedi su TripAdvisor
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
