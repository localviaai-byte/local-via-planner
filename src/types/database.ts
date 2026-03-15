// =====================================================
// LOCALVIA DATABASE TYPES
// =====================================================

export type AppRole = 'admin' | 'local_contributor' | 'editor' | 'referral_partner' | 'affiliate_partner';

export type PartnerType = 'referral' | 'affiliate';
export type PartnerStatus = 'pending' | 'active' | 'suspended' | 'churned';

export type PlaceType = 'attraction' | 'bar' | 'restaurant' | 'club' | 'zone' | 'experience' | 'view' | 'shopping';

// Shopping-specific types
export type ShopCategory = 
  | 'fast_fashion' | 'luxury_fashion' | 'calzature' | 'gioielleria'
  | 'ottica' | 'profumeria_cosmetica' | 'enoteca' | 'gastronomia_tipici'
  | 'souvenir' | 'artigianato_locale' | 'cartoleria_regalo'
  | 'libri_librerie' | 'elettronica_telefonia' | 'casa_arredamento';

export type ShopFormat = 'shopping_mall' | 'shopping_point';

export type PlaceStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'archived';

export type TargetAudience = 'locals' | 'tourists' | 'mixed' | 'students' | 'couples';

// =====================================================
// NEW ENUMS FROM SCHEMA UPGRADE
// =====================================================

export type VibeLabel = 'easy' | 'energetic' | 'romantic' | 'chaotic' | 'chic' | 'underground' | 'authentic';

export type WhyGoEnum = 'have_fun' | 'socialize' | 'date_spot' | 'eat_drink_well' | 'relax' | 'do_something_different' | 'culture' | 'scenic';

export type IdealFor = 'couple' | 'friends' | 'solo_traveler' | 'family' | 'first_time' | 'meet_people' | 'chill' | 'party' | 'flirt_friendly';

export type TimeBucket = 'morning' | 'lunch' | 'afternoon' | 'aperitivo' | 'dinner' | 'evening' | 'night';

export type CrowdType = 'low' | 'medium' | 'high' | 'variable';

export type PriceLevel = 'budget' | 'moderate' | 'expensive' | 'luxury';

export type YesNoMaybe = 'yes' | 'no' | 'depends';

export type GenderBalance = 'balanced' | 'more_men' | 'more_women' | 'unknown';

export type SuggestedStay = 'short' | 'medium' | 'long';

export type ReviewDecision = 'approve' | 'reject' | 'request_changes';

// =====================================================
// CITY CONNECTIONS TYPES
// =====================================================

export type ConnectionType = 'day_trip' | 'metro' | 'nearby_city' | 'multi_city';

export type TransportMode = 'car' | 'train' | 'bus' | 'ferry' | 'walk' | 'mixed';

export const CONNECTION_TYPE_OPTIONS = [
  { id: 'day_trip', label: 'Gita in giornata', icon: '🚃', description: 'Visita completa e rientro in giornata' },
  { id: 'metro', label: 'Area metropolitana', icon: '🏙️', description: 'Quasi stessa base, spostamento veloce' },
  { id: 'nearby_city', label: 'Città vicina', icon: '🗺️', description: 'Raggiungibile ma non per tutti i ritmi' },
  { id: 'multi_city', label: 'Multi-città', icon: '✈️', description: 'Tappa di un viaggio più lungo' },
] as const;

export const TRANSPORT_MODE_OPTIONS = [
  { id: 'car', label: 'Auto', icon: '🚗' },
  { id: 'train', label: 'Treno', icon: '🚃' },
  { id: 'bus', label: 'Bus', icon: '🚌' },
  { id: 'ferry', label: 'Traghetto', icon: '⛴️' },
  { id: 'walk', label: 'A piedi', icon: '🚶' },
  { id: 'mixed', label: 'Misto', icon: '🔄' },
] as const;

export interface CityConnection {
  id: string;
  city_id_from: string;
  city_id_to: string;
  connection_type: ConnectionType;
  primary_mode: TransportMode;
  typical_min_minutes: number | null;
  typical_max_minutes: number | null;
  cost_note: string | null;
  reliability_score: number;
  friction_score: number;
  best_departure_time: TimeBucket[] | null;
  best_return_time: TimeBucket[] | null;
  local_tip: string | null;
  warning: string | null;
  seasonality_note: string | null;
  day_worth: DayWorthType | null;
  distance_km: number | null;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
  // Joined data
  to_city?: City;
  from_city?: City;
}

export interface PlaceCoverage {
  place_id: string;
  base_city_id: string;
  relevance: number;
  note: string | null;
  created_at: string;
  created_by: string | null;
  // Joined data
  place?: Place;
  base_city?: City;
}

export interface CityCluster {
  id: string;
  name: string;
  country: string;
  description: string | null;
  created_at: string;
  created_by: string | null;
}

export interface CityClusterMember {
  cluster_id: string;
  city_id: string;
  role: 'core' | 'satellite';
  created_at: string;
  // Joined data
  city?: City;
  cluster?: CityCluster;
}

export type DayWorthType = 'full_day' | 'half_day' | 'combine_with_other';

export const DAY_WORTH_OPTIONS = [
  { id: 'full_day', label: 'Vale la giornata', icon: '🌅', description: 'Destinazione che merita un giorno intero' },
  { id: 'half_day', label: 'Mezza giornata', icon: '⏰', description: 'Bastano 3-4 ore per vedere tutto' },
  { id: 'combine_with_other', label: 'Meglio combinata', icon: '🔗', description: 'Da abbinare ad altra tappa vicina' },
] as const;

export const FRICTION_LABELS: Record<number, string> = {
  1: 'Scorrevole',
  2: 'Semplice',
  3: 'Qualche sbatti',
  4: 'Impegnativo',
  5: 'Stressante',
};

export const RELIABILITY_LABELS: Record<number, string> = {
  1: 'Inaffidabile',
  2: 'A volte ritardi',
  3: 'Nella media',
  4: 'Affidabile',
  5: 'Puntualissimo',
};

export interface CityConnectionFormData {
  city_id_to: string;
  connection_type: ConnectionType;
  primary_mode: TransportMode;
  typical_min_minutes: number | null;
  typical_max_minutes: number | null;
  cost_note: string;
  reliability_score: number;
  friction_score: number;
  best_departure_time: TimeBucket[];
  best_return_time: TimeBucket[];
  local_tip: string;
  warning: string;
  seasonality_note: string;
  day_worth: DayWorthType | null;
  distance_km: number | null;
}

export const DEFAULT_CONNECTION_FORM_DATA: CityConnectionFormData = {
  city_id_to: '',
  connection_type: 'day_trip',
  primary_mode: 'train',
  typical_min_minutes: null,
  typical_max_minutes: null,
  cost_note: '',
  reliability_score: 3,
  friction_score: 3,
  best_departure_time: [],
  best_return_time: [],
  local_tip: '',
  warning: '',
  seasonality_note: '',
  day_worth: null,
  distance_km: null,
};

// =====================================================
// VIBE LABEL OPTIONS
// =====================================================

export const VIBE_LABEL_OPTIONS = [
  { id: 'easy', label: 'Easy', icon: '😌' },
  { id: 'energetic', label: 'Energetico', icon: '⚡' },
  { id: 'romantic', label: 'Romantico', icon: '💕' },
  { id: 'chaotic', label: 'Caotico', icon: '🔥' },
  { id: 'chic', label: 'Chic', icon: '✨' },
  { id: 'underground', label: 'Underground', icon: '🎸' },
  { id: 'authentic', label: 'Autentico', icon: '🏛️' },
] as const;

export const IDEAL_FOR_OPTIONS = [
  { id: 'couple', label: 'Coppia', icon: '💑' },
  { id: 'friends', label: 'Amici', icon: '👥' },
  { id: 'solo_traveler', label: 'Solo traveler', icon: '🎒' },
  { id: 'family', label: 'Famiglia', icon: '👨‍👩‍👧‍👦' },
  { id: 'first_time', label: 'Prima volta', icon: '🌟' },
  { id: 'meet_people', label: 'Conoscere gente', icon: '🤝' },
  { id: 'chill', label: 'Chill', icon: '🧘' },
  { id: 'party', label: 'Party', icon: '🎉' },
  { id: 'flirt_friendly', label: 'Flirt friendly', icon: '😏' },
] as const;

export const TIME_BUCKET_OPTIONS = [
  { id: 'morning', label: 'Mattina', icon: '🌅' },
  { id: 'lunch', label: 'Pranzo', icon: '🍽️' },
  { id: 'afternoon', label: 'Pomeriggio', icon: '☀️' },
  { id: 'aperitivo', label: 'Aperitivo', icon: '🥂' },
  { id: 'dinner', label: 'Cena', icon: '🌙' },
  { id: 'evening', label: 'Sera', icon: '🌆' },
  { id: 'night', label: 'Notte', icon: '🌃' },
] as const;

export const SUGGESTED_STAY_OPTIONS = [
  { id: 'short', label: 'Breve (< 1h)' },
  { id: 'medium', label: 'Media (1-3h)' },
  { id: 'long', label: 'Lunga (> 3h)' },
] as const;

// =====================================================
// CITY TYPES
// =====================================================

export type CityTag = 'archeology' | 'sea' | 'nightlife' | 'food' | 'romantic' | 'chaotic' | 'slow' | 'art' | 'nature' | 'shopping';
export type CityWalkability = 'yes' | 'no' | 'depends';
export type CityRhythm = 'very_slow' | 'medium' | 'intense';
export type CityStatus = 'empty' | 'building' | 'active';
export type BestTimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export const CITY_TAG_OPTIONS = [
  { id: 'archeology', label: 'Archeologia', icon: '🏛️' },
  { id: 'sea', label: 'Mare', icon: '🌊' },
  { id: 'nightlife', label: 'Nightlife', icon: '🌙' },
  { id: 'food', label: 'Food', icon: '🍝' },
  { id: 'romantic', label: 'Romantica', icon: '💕' },
  { id: 'chaotic', label: 'Caotica', icon: '🔥' },
  { id: 'slow', label: 'Slow', icon: '🧘' },
  { id: 'art', label: 'Arte', icon: '🎨' },
  { id: 'nature', label: 'Natura', icon: '🌿' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
] as const;

export const CITY_WALKABILITY_OPTIONS = [
  { id: 'yes', label: 'Sì, tutta a piedi' },
  { id: 'no', label: 'No, serve muoversi' },
  { id: 'depends', label: 'Dipende dalla zona' },
] as const;

export const CITY_RHYTHM_OPTIONS = [
  { id: 'very_slow', label: 'Molto slow', description: 'Tutto con calma' },
  { id: 'medium', label: 'Medio', description: 'Ritmo normale' },
  { id: 'intense', label: 'Intenso', description: 'Tanto da fare' },
] as const;

export const BEST_TIME_OF_DAY_OPTIONS = [
  { id: 'morning', label: 'Mattina', icon: '🌅' },
  { id: 'afternoon', label: 'Pomeriggio', icon: '☀️' },
  { id: 'evening', label: 'Sera', icon: '🌆' },
  { id: 'night', label: 'Notte', icon: '🌙' },
] as const;

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  assigned_city_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: string;
  name: string;
  region: string | null;
  country: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  cover_image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  status: CityStatus;
  tags: CityTag[];
  walkable: CityWalkability | null;
  rhythm: CityRhythm | null;
  best_times: BestTimeOfDay[];
  tourist_errors: string | null;
  local_warning: string | null;
}

export interface CityZone {
  id: string;
  city_id: string;
  name: string;
  description: string | null;
  vibe: string[] | null;
  vibe_primary: VibeLabel | null;
  vibe_secondary: VibeLabel | null;
  best_time: TimeBucket | null;
  touristy_score: number | null;
  safety_note: string | null;
  local_tip: string | null;
  why_go: string | null;
  when_to_go: string | null;
  status: PlaceStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// City form data for wizard
export interface CityFormData {
  name: string;
  region: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  tags: CityTag[];
  walkable: CityWalkability | null;
  rhythm: CityRhythm | null;
  best_times: BestTimeOfDay[];
  tourist_errors: string;
  local_warning: string;
}

export const DEFAULT_CITY_FORM_DATA: CityFormData = {
  name: '',
  region: '',
  country: 'Italia',
  latitude: null,
  longitude: null,
  tags: [],
  walkable: null,
  rhythm: null,
  best_times: [],
  tourist_errors: '',
  local_warning: '',
};

// =====================================================
// PLACE OPTIONS
// =====================================================

// Why people go options (legacy, kept for backward compatibility)
export const WHY_PEOPLE_GO_OPTIONS = [
  { id: 'fun', label: 'Divertirti', icon: '🎉' },
  { id: 'meet_people', label: 'Conoscere gente', icon: '👥' },
  { id: 'bring_someone', label: 'Portare qualcuno', icon: '💑' },
  { id: 'relax', label: 'Rilassarti', icon: '☕' },
  { id: 'eat_drink_well', label: 'Bere / mangiare bene', icon: '🍝' },
  { id: 'something_different', label: 'Fare qualcosa di diverso', icon: '✨' },
  { id: 'other', label: 'Altro', icon: '📝' },
] as const;

export type WhyPeopleGo = typeof WHY_PEOPLE_GO_OPTIONS[number]['id'];

// Best times options
export const BEST_TIMES_OPTIONS = [
  { id: 'morning', label: 'Mattina', icon: '🌅' },
  { id: 'lunch', label: 'Pranzo', icon: '🍽️' },
  { id: 'aperitivo', label: 'Aperitivo', icon: '🥂' },
  { id: 'dinner', label: 'Cena', icon: '🌙' },
  { id: 'night', label: 'Sera', icon: '🌃' },
  { id: 'late_night', label: 'Notte fonda', icon: '🌌' },
] as const;

export type BestTime = typeof BEST_TIMES_OPTIONS[number]['id'];

// Best days options
export const BEST_DAYS_OPTIONS = [
  { id: 'mon', label: 'Lun' },
  { id: 'tue', label: 'Mar' },
  { id: 'wed', label: 'Mer' },
  { id: 'thu', label: 'Gio' },
  { id: 'fri', label: 'Ven' },
  { id: 'sat', label: 'Sab' },
  { id: 'sun', label: 'Dom' },
] as const;

export type BestDay = typeof BEST_DAYS_OPTIONS[number]['id'];

// Place type options
export const PLACE_TYPE_OPTIONS = [
  { id: 'attraction', label: 'Attrazione', icon: '🏛️', description: 'Musei, monumenti, siti archeologici' },
  { id: 'restaurant', label: 'Ristorante', icon: '🍽️', description: 'Dove mangiare bene' },
  { id: 'bar', label: 'Bar', icon: '🍷', description: 'Aperitivo, cocktail, vino' },
  { id: 'club', label: 'Club / Nightlife', icon: '🎶', description: 'Disco, live music, notte' },
  { id: 'experience', label: 'Esperienza', icon: '✨', description: 'Tour, workshop, attività' },
  { id: 'view', label: 'Vista / Panorama', icon: '🌅', description: 'Punti panoramici' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', description: 'Negozi, boutique, centri commerciali' },
  { id: 'zone', label: 'Zona / Area', icon: '🧭', description: 'Quartieri da esplorare' },
] as const;

export const SHOP_CATEGORY_OPTIONS = [
  { id: 'fast_fashion', label: 'Fast Fashion', icon: '👕' },
  { id: 'luxury_fashion', label: 'Luxury Fashion', icon: '👗' },
  { id: 'calzature', label: 'Calzature', icon: '👟' },
  { id: 'gioielleria', label: 'Gioielleria', icon: '💎' },
  { id: 'ottica', label: 'Ottica', icon: '👓' },
  { id: 'profumeria_cosmetica', label: 'Profumeria e cosmetica', icon: '💄' },
  { id: 'enoteca', label: 'Enoteca', icon: '🍷' },
  { id: 'gastronomia_tipici', label: 'Gastronomia / prodotti tipici', icon: '🧀' },
  { id: 'souvenir', label: 'Souvenir', icon: '🎁' },
  { id: 'artigianato_locale', label: 'Artigianato locale', icon: '🏺' },
  { id: 'cartoleria_regalo', label: 'Cartoleria e articoli regalo', icon: '🎀' },
  { id: 'libri_librerie', label: 'Libri e librerie', icon: '📚' },
  { id: 'elettronica_telefonia', label: 'Elettronica e telefonia', icon: '📱' },
  { id: 'casa_arredamento', label: 'Casa e arredamento', icon: '🏠' },
] as const;

export const SHOP_FORMAT_OPTIONS = [
  { id: 'shopping_mall', label: 'Centro commerciale', icon: '🏬', description: 'Mall, outlet, grandi superfici' },
  { id: 'shopping_point', label: 'Punto vendita', icon: '🏪', description: 'Singolo negozio, boutique' },
] as const;

// Indoor/Outdoor options
export const INDOOR_OUTDOOR_OPTIONS = [
  { id: 'indoor', label: 'Al chiuso' },
  { id: 'outdoor', label: 'All\'aperto' },
  { id: 'both', label: 'Entrambi' },
] as const;

// Crowd level options
export const CROWD_LEVEL_OPTIONS = [
  { id: 'low', label: 'Poco affollato', icon: '🧘' },
  { id: 'medium', label: 'Affollamento medio', icon: '👥' },
  { id: 'high', label: 'Molto affollato', icon: '🎪' },
] as const;

// Price range options
export const PRICE_RANGE_OPTIONS = [
  { id: 'budget', label: '€', description: 'Economico' },
  { id: 'moderate', label: '€€', description: 'Medio' },
  { id: 'expensive', label: '€€€', description: 'Curato' },
  { id: 'luxury', label: '€€€€', description: 'Esperienza premium' },
] as const;

// =====================================================
// STRUCTURED FOOD DIMENSIONS
// =====================================================

export type FoodPrimary = 
  | 'carne' | 'pesce' | 'pizza' | 'pasta'
  | 'vegetariano_vegano' | 'street_food' | 'internazionale' | 'dessert_caffe';

export type FoodSecondary = 
  | 'alla_brace' | 'crudo_mare' | 'sushi' | 'hamburger' | 'bistecca'
  | 'cucina_tradizionale' | 'cucina_moderna' | 'degustazione' | 'tapas'
  | 'bbq' | 'fritti' | 'cucina_regionale';

export type FormatExperience = 
  | 'trattoria' | 'ristorante_classico' | 'fine_dining' | 'pub'
  | 'wine_bar' | 'street_food' | 'fast_casual'
  | 'vista_panoramica' | 'romantico' | 'tavoli_condivisi';

export const FOOD_PRIMARY_OPTIONS = [
  { id: 'carne', label: 'Carne', icon: '🥩' },
  { id: 'pesce', label: 'Pesce', icon: '🐟' },
  { id: 'pizza', label: 'Pizza', icon: '🍕' },
  { id: 'pasta', label: 'Pasta', icon: '🍝' },
  { id: 'vegetariano_vegano', label: 'Vegetariano / Vegano', icon: '🥗' },
  { id: 'street_food', label: 'Street Food', icon: '🌮' },
  { id: 'internazionale', label: 'Internazionale', icon: '🌍' },
  { id: 'dessert_caffe', label: 'Dessert / Caffè', icon: '☕' },
] as const;

export const FOOD_SECONDARY_OPTIONS = [
  { id: 'alla_brace', label: 'Alla brace', icon: '🔥' },
  { id: 'crudo_mare', label: 'Crudo di mare', icon: '🦐' },
  { id: 'sushi', label: 'Sushi', icon: '🍣' },
  { id: 'hamburger', label: 'Hamburger', icon: '🍔' },
  { id: 'bistecca', label: 'Bistecca', icon: '🥩' },
  { id: 'cucina_tradizionale', label: 'Cucina tradizionale', icon: '🏠' },
  { id: 'cucina_moderna', label: 'Cucina moderna', icon: '✨' },
  { id: 'degustazione', label: 'Degustazione', icon: '🍷' },
  { id: 'tapas', label: 'Tapas', icon: '🫒' },
  { id: 'bbq', label: 'BBQ', icon: '🍖' },
  { id: 'fritti', label: 'Fritti', icon: '🍟' },
  { id: 'cucina_regionale', label: 'Cucina regionale', icon: '🗺️' },
] as const;

export const FORMAT_EXPERIENCE_OPTIONS = [
  { id: 'trattoria', label: 'Trattoria / Osteria', icon: '🏡' },
  { id: 'ristorante_classico', label: 'Ristorante classico', icon: '🍽️' },
  { id: 'fine_dining', label: 'Fine dining', icon: '⭐' },
  { id: 'pub', label: 'Pub', icon: '🍺' },
  { id: 'wine_bar', label: 'Wine bar', icon: '🍷' },
  { id: 'street_food', label: 'Street food', icon: '🌮' },
  { id: 'fast_casual', label: 'Fast casual', icon: '🥪' },
  { id: 'vista_panoramica', label: 'Vista panoramica', icon: '🌅' },
  { id: 'romantico', label: 'Romantico', icon: '💕' },
  { id: 'tavoli_condivisi', label: 'Tavoli condivisi', icon: '🤝' },
] as const;

// User-facing atmosphere mappings (UI label → internal format_experience)
export const ATMOSPHERE_OPTIONS = [
  { id: 'informale', label: 'Informale e autentico', icon: '🏡', mapsTo: ['trattoria', 'fast_casual'] },
  { id: 'curato', label: 'Curato e tranquillo', icon: '✨', mapsTo: ['ristorante_classico'] },
  { id: 'elegante', label: 'Elegante / romantico', icon: '💕', mapsTo: ['fine_dining', 'romantico'] },
  { id: 'vista', label: 'Vista panoramica', icon: '🌅', mapsTo: ['vista_panoramica'] },
  { id: 'vivace', label: 'Vivace e sociale', icon: '🎉', mapsTo: ['pub', 'wine_bar'] },
  { id: 'condiviso', label: 'Tavoli condivisi', icon: '🤝', mapsTo: ['tavoli_condivisi'] },
  { id: 'pub', label: 'Pub style', icon: '🍺', mapsTo: ['pub'] },
  { id: 'fine_dining', label: 'Fine dining', icon: '⭐', mapsTo: ['fine_dining'] },
] as const;

export const USER_BUDGET_OPTIONS = [
  { id: 'budget', label: '€', description: 'Economico' },
  { id: 'moderate', label: '€€', description: 'Medio' },
  { id: 'expensive', label: '€€€', description: 'Curato' },
  { id: 'luxury', label: '€€€€', description: 'Esperienza premium' },
] as const;

// Meal time options
export const MEAL_TIME_OPTIONS = [
  { id: 'lunch', label: 'Pranzo' },
  { id: 'dinner', label: 'Cena' },
  { id: 'both', label: 'Entrambi' },
] as const;

// Bar time options
export const BAR_TIME_OPTIONS = [
  { id: 'aperitivo', label: 'Aperitivo' },
  { id: 'after_dinner', label: 'Dopo cena' },
  { id: 'both', label: 'Tutto il giorno' },
] as const;

// Drink focus options
export const DRINK_FOCUS_OPTIONS = [
  { id: 'wine', label: 'Vino', icon: '🍷' },
  { id: 'cocktails', label: 'Cocktail', icon: '🍸' },
  { id: 'beer', label: 'Birra', icon: '🍺' },
  { id: 'mixed', label: 'Un po\' di tutto', icon: '🥃' },
] as const;

// Target audience options
export const TARGET_AUDIENCE_OPTIONS = [
  { id: 'locals', label: 'Solo locals', icon: '🏠' },
  { id: 'tourists', label: 'Turisti', icon: '📸' },
  { id: 'mixed', label: 'Misto', icon: '🌍' },
  { id: 'students', label: 'Studenti', icon: '📚' },
  { id: 'couples', label: 'Coppie', icon: '💑' },
] as const;

// Gender balance options
export const GENDER_BALANCE_OPTIONS = [
  { id: 'balanced', label: 'Equilibrato' },
  { id: 'more_men', label: 'Più uomini' },
  { id: 'more_women', label: 'Più donne' },
  { id: 'unknown', label: 'Variabile' },
] as const;

// =====================================================
// PLACE INTERFACE
// =====================================================

export interface Place {
  id: string;
  city_id: string;
  place_type: PlaceType;
  zone_id: string | null;
  
  // Identity
  name: string;
  address: string | null;
  zone: string | null;
  latitude: number | null;
  longitude: number | null;
  photo_url: string | null;
  google_place_id: string | null;
  
  // Why people go
  why_people_go: WhyPeopleGo[];
  why_other: string | null;
  
  // Social
  social_level: number | null;
  solo_friendly: boolean;
  flirt_friendly: boolean;
  group_friendly: boolean;
  target_audience: TargetAudience | null;
  
  // NEW: Enhanced mood/vibe
  mood_primary: VibeLabel | null;
  mood_secondary: VibeLabel | null;
  gender_balance: GenderBalance | null;
  
  // Vibe sliders (1-5)
  vibe_calm_to_energetic: number | null;
  vibe_quiet_to_loud: number | null;
  vibe_empty_to_crowded: number | null;
  vibe_touristy_to_local: number | null;
  
  // NEW: Insider insights
  tourist_trap: boolean;
  overrated: boolean;
  local_secret: boolean;
  
  // NEW: Effort levels
  physical_effort: number | null;
  mental_effort: number | null;
  suggested_stay: SuggestedStay | null;
  
  // NEW: Ideal for (matching)
  ideal_for: IdealFor[];
  
  // Timing
  best_days: BestDay[];
  best_times: BestTime[];
  periods_to_avoid: string | null;
  dead_times_note: string | null;
  
  // Local secrets
  local_warning: string | null;
  local_one_liner: string | null;
  
  // --- TYPE-SPECIFIC FIELDS ---
  
  // General (all types)
  duration_minutes: number | null;
  indoor_outdoor: 'indoor' | 'outdoor' | 'both' | null;
  crowd_level: 'low' | 'medium' | 'high' | null;
  pace: 'slow' | 'fast' | 'flexible' | null;
  
  // Restaurant-specific
  cuisine_type: string | null;
  price_range: 'budget' | 'moderate' | 'expensive' | 'luxury' | null;
  meal_time: 'lunch' | 'dinner' | 'both' | null;
  shared_tables: boolean;
  food_primary: FoodPrimary[];
  food_secondary: FoodSecondary[];
  format_experience: FormatExperience[];
  
  // Chi siamo
  about_us: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  contact_website: string | null;
  
  // Bar-specific
  bar_time: 'aperitivo' | 'after_dinner' | 'both' | null;
  standing_ok: boolean;
  drink_focus: 'wine' | 'cocktails' | 'beer' | 'mixed' | null;
  
  // Club-specific
  real_start_time: string | null;
  dress_code: string | null;
  pre_or_post: 'pre' | 'post' | 'both' | null;
  
  // Experience-specific
  needs_booking: boolean;
  is_repeatable: boolean;
  works_solo: boolean;
  
  // View-specific
  best_light_time: string | null;
  worth_detour: boolean;
  
  // Zone-specific
  time_to_spend: string | null;
  best_period: 'day' | 'evening' | 'night' | 'anytime' | null;
  
  // Shopping-specific
  shop_category: ShopCategory | null;
  shop_format: ShopFormat | null;
  
  // Metadata
  status: PlaceStatus;
  quality_score: number;
  notes_internal: string | null;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  
  // TripAdvisor enrichment
  tripadvisor_id: string | null;
  tripadvisor_rating: number | null;
  tripadvisor_reviews_count: number | null;
  tripadvisor_ranking: number | null;
  tripadvisor_ranking_category: string | null;
  tripadvisor_price_level: string | null;
  tripadvisor_url: string | null;
  tripadvisor_image_url: string | null;
  tripadvisor_enriched_at: string | null;
}

// =====================================================
// TAGS SYSTEM
// =====================================================

export type TagGroup = 'interest' | 'experience_style' | 'social_scene' | 'nightlife' | 'food' | 'logistics' | 'crowd_risk' | 'seasonality';

export interface Tag {
  id: string;
  tag_group: TagGroup;
  tag_key: string;
  label_it: string;
  label_en: string | null;
  created_at: string;
}

export interface PlaceTag {
  place_id: string;
  tag_id: string;
  weight: number;
  created_at: string;
}

// =====================================================
// OPENING HOURS
// =====================================================

export interface PlaceOpeningHours {
  id: string;
  place_id: string;
  day_of_week: number; // 1=Mon, 7=Sun
  open_time: string;
  close_time: string;
  is_closed: boolean;
  note: string | null;
  created_at: string;
}

// =====================================================
// MEDIA
// =====================================================

export interface PlaceMedia {
  id: string;
  place_id: string;
  media_url: string;
  caption: string | null;
  sort_order: number;
  created_by: string | null;
  created_at: string;
}

// =====================================================
// EDITORIAL WORKFLOW
// =====================================================

export interface PlaceReview {
  id: string;
  place_id: string;
  editor_id: string;
  decision: ReviewDecision;
  comment: string | null;
  created_at: string;
}

export interface PlaceVersion {
  id: string;
  place_id: string;
  version_number: number;
  data: Record<string, unknown>;
  created_by: string;
  created_at: string;
  change_summary: string | null;
}

export interface PlaceFlag {
  id: string;
  place_id: string;
  flag_type: 'too_touristy' | 'unclear' | 'duplicate' | 'needs_rewrite';
  notes: string | null;
  created_by: string;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

// =====================================================
// FORM DATA FOR WIZARD
// =====================================================

export interface PlaceFormData {
  // Step 0: Context
  city_id: string;
  place_type: PlaceType | null;
  zone_id: string | null;
  
  // Step 1: Identity
  name: string;
  address: string;
  zone: string;
  photo_url: string;
  latitude: number | null;
  longitude: number | null;
  
  // Step 2: Why
  why_people_go: WhyPeopleGo[];
  why_other: string;
  
  // Step 3: Social
  social_level: number;
  solo_friendly: boolean;
  flirt_friendly: boolean;
  group_friendly: boolean;
  target_audience: TargetAudience | null;
  gender_balance: GenderBalance | null;
  
  // Step 4: Vibe
  mood_primary: VibeLabel | null;
  mood_secondary: VibeLabel | null;
  vibe_calm_to_energetic: number;
  vibe_quiet_to_loud: number;
  vibe_empty_to_crowded: number;
  vibe_touristy_to_local: number;
  
  // Step 5: Insider insights
  tourist_trap: boolean;
  overrated: boolean;
  local_secret: boolean;
  ideal_for: IdealFor[];
  
  // Step 6: Effort
  physical_effort: number | null;
  mental_effort: number | null;
  suggested_stay: SuggestedStay | null;
  
  // Step 7: Timing
  best_days: BestDay[];
  best_times: BestTime[];
  periods_to_avoid: string;
  dead_times_note: string;
  
  // Step 8: Warning
  local_warning: string;
  
  // Step 9: One-liner
  local_one_liner: string;
  
  // --- TYPE-SPECIFIC FIELDS ---
  
  // General
  duration_minutes: number | null;
  indoor_outdoor: 'indoor' | 'outdoor' | 'both' | null;
  crowd_level: 'low' | 'medium' | 'high' | null;
  pace: 'slow' | 'fast' | 'flexible' | null;
  
  // Restaurant
  cuisine_type: string;
  price_range: 'budget' | 'moderate' | 'expensive' | 'luxury' | null;
  meal_time: 'lunch' | 'dinner' | 'both' | null;
  shared_tables: boolean;
  food_primary: FoodPrimary[];
  food_secondary: FoodSecondary[];
  format_experience: FormatExperience[];
  dietary_options: string[];
  
  // Chi siamo
  about_us: string;
  contact_phone: string;
  contact_email: string;
  contact_website: string;
  
  // Bar
  bar_time: 'aperitivo' | 'after_dinner' | 'both' | null;
  standing_ok: boolean;
  drink_focus: 'wine' | 'cocktails' | 'beer' | 'mixed' | null;
  
  // Club
  real_start_time: string;
  dress_code: string;
  pre_or_post: 'pre' | 'post' | 'both' | null;
  
  // Experience
  needs_booking: boolean;
  is_repeatable: boolean;
  works_solo: boolean;
  
  // View
  best_light_time: string;
  worth_detour: boolean;
  
  // Zone
  time_to_spend: string;
  best_period: 'day' | 'evening' | 'night' | 'anytime' | null;
  
  // Shopping
  shop_category: ShopCategory | null;
  shop_format: ShopFormat | null;
}

export const DEFAULT_PLACE_FORM_DATA: PlaceFormData = {
  city_id: '',
  place_type: null,
  zone_id: null,
  name: '',
  address: '',
  zone: '',
  photo_url: '',
  latitude: null,
  longitude: null,
  why_people_go: [],
  why_other: '',
  social_level: 3,
  solo_friendly: false,
  flirt_friendly: false,
  group_friendly: false,
  target_audience: null,
  gender_balance: null,
  mood_primary: null,
  mood_secondary: null,
  vibe_calm_to_energetic: 3,
  vibe_quiet_to_loud: 3,
  vibe_empty_to_crowded: 3,
  vibe_touristy_to_local: 3,
  tourist_trap: false,
  overrated: false,
  local_secret: false,
  ideal_for: [],
  physical_effort: null,
  mental_effort: null,
  suggested_stay: null,
  best_days: [],
  best_times: [],
  periods_to_avoid: '',
  dead_times_note: '',
  local_warning: '',
  local_one_liner: '',
  // Type-specific defaults
  duration_minutes: null,
  indoor_outdoor: null,
  crowd_level: null,
  pace: null,
  cuisine_type: '',
  price_range: null,
  meal_time: null,
  shared_tables: false,
  food_primary: [],
  food_secondary: [],
  format_experience: [],
  about_us: '',
  contact_phone: '',
  contact_email: '',
  contact_website: '',
  dietary_options: [],
  bar_time: null,
  standing_ok: true,
  drink_focus: null,
  real_start_time: '',
  dress_code: '',
  pre_or_post: null,
  needs_booking: false,
  is_repeatable: true,
  works_solo: true,
  best_light_time: '',
  worth_detour: true,
  time_to_spend: '',
  best_period: null,
  shop_category: null,
  shop_format: null,
};

// =====================================================
// PRODUCTS & ADD-ONS SYSTEM
// =====================================================

export type ProductType = 
  | 'guided_tour'
  | 'tasting'
  | 'workshop'
  | 'dining_experience'
  | 'transport'
  | 'photo_experience'
  | 'ticket';

export type PlanItemType = 'place' | 'product';

export type AnchorType = 'before' | 'after' | 'instead' | 'standalone';

export const PRODUCT_TYPE_OPTIONS = [
  { id: 'guided_tour', label: 'Tour Guidato', icon: '🎤', description: 'Guida professionale per gruppi o privati' },
  { id: 'tasting', label: 'Degustazione', icon: '🍷', description: 'Vino, olio, prodotti tipici' },
  { id: 'workshop', label: 'Workshop', icon: '🎨', description: 'Corsi, laboratori, esperienze hands-on' },
  { id: 'dining_experience', label: 'Esperienza Culinaria', icon: '🍝', description: 'Cene speciali, cooking class' },
  { id: 'transport', label: 'Trasporto', icon: '🚗', description: 'Transfer, noleggio, tour in barca' },
  { id: 'photo_experience', label: 'Photo Experience', icon: '📸', description: 'Shooting, tour fotografici' },
  { id: 'ticket', label: 'Biglietto', icon: '🎟️', description: 'Ingressi, skip-the-line, combo' },
] as const;

export const ANCHOR_TYPE_OPTIONS = [
  { id: 'before', label: 'Prima di', description: 'Mostra prima di un place' },
  { id: 'after', label: 'Dopo', description: 'Mostra dopo un place' },
  { id: 'instead', label: 'Al posto di', description: 'Sostituisce uno slot (es. cena)' },
  { id: 'standalone', label: 'Autonomo', description: 'Non legato a un place specifico' },
] as const;

export interface Product {
  id: string;
  city_id: string;
  zone_id: string | null;
  
  product_type: ProductType;
  title: string;
  short_pitch: string;
  description: string | null;
  
  duration_minutes: number | null;
  price_cents: number | null;
  currency: string;
  
  // Logistics
  meeting_point: string | null;
  latitude: number | null;
  longitude: number | null;
  capacity_note: string | null;
  booking_url: string | null;
  vendor_name: string | null;
  vendor_contact: string | null;
  photo_url: string | null;
  
  // Timing preferences
  preferred_time_buckets: TimeBucket[];
  
  status: PlaceStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined data
  city?: City;
  zone?: CityZone;
  rules?: ProductRule[];
  tags?: ProductTag[];
}

export interface ProductTag {
  product_id: string;
  tag_id: string;
  weight: number;
  created_at: string;
  tag?: Tag;
}

export interface ProductRule {
  id: string;
  product_id: string;
  
  // Trigger context
  trigger_place_types: PlaceType[];
  trigger_interest_keys: string[];
  trigger_time_buckets: TimeBucket[];
  trigger_zone_ids: string[];
  
  // Trip constraints
  min_trip_days: number | null;
  max_trip_days: number | null;
  
  // User compatibility
  requires_pace_max: number | null;
  suitable_for: IdealFor[];
  min_social_level: number | null;
  
  // Display settings
  anchor_type: AnchorType | null;
  requires_booking: boolean;
  priority: number;
  
  note_internal: string | null;
  created_at: string;
}

export interface TripPlan {
  id: string;
  user_id: string | null;
  city_id: string;
  
  title: string | null;
  start_date: string | null;
  days: number;
  
  preferences: Record<string, unknown>;
  
  created_at: string;
  updated_at: string;
  
  // Joined data
  city?: City;
  items?: PlanItem[];
}

export interface PlanItem {
  id: string;
  plan_id: string;
  
  item_type: PlanItemType;
  place_id: string | null;
  product_id: string | null;
  
  day_index: number;
  start_time: string | null;
  end_time: string | null;
  slot_type: string | null;
  
  notes: string | null;
  is_booked: boolean;
  
  sort_order: number;
  created_at: string;
  
  // Joined data
  place?: Place;
  product?: Product;
}

// Form data for product wizard
export interface ProductFormData {
  city_id: string;
  zone_id: string | null;
  
  product_type: ProductType | null;
  title: string;
  short_pitch: string;
  description: string;
  
  duration_minutes: number | null;
  price_cents: number | null;
  currency: string;
  
  meeting_point: string;
  latitude: number | null;
  longitude: number | null;
  capacity_note: string;
  booking_url: string;
  vendor_name: string;
  vendor_contact: string;
  photo_url: string;
  
  preferred_time_buckets: TimeBucket[];
}

export const DEFAULT_PRODUCT_FORM_DATA: ProductFormData = {
  city_id: '',
  zone_id: null,
  product_type: null,
  title: '',
  short_pitch: '',
  description: '',
  duration_minutes: null,
  price_cents: null,
  currency: 'EUR',
  meeting_point: '',
  latitude: null,
  longitude: null,
  capacity_note: '',
  booking_url: '',
  vendor_name: '',
  vendor_contact: '',
  photo_url: '',
  preferred_time_buckets: [],
};

// Form data for product rules
export interface ProductRuleFormData {
  trigger_place_types: PlaceType[];
  trigger_interest_keys: string[];
  trigger_time_buckets: TimeBucket[];
  trigger_zone_ids: string[];
  
  min_trip_days: number | null;
  max_trip_days: number | null;
  
  requires_pace_max: number | null;
  suitable_for: IdealFor[];
  min_social_level: number | null;
  
  anchor_type: AnchorType | null;
  requires_booking: boolean;
  priority: number;
  
  note_internal: string;
}

export const DEFAULT_PRODUCT_RULE_FORM_DATA: ProductRuleFormData = {
  trigger_place_types: [],
  trigger_interest_keys: [],
  trigger_time_buckets: [],
  trigger_zone_ids: [],
  min_trip_days: null,
  max_trip_days: null,
  requires_pace_max: null,
  suitable_for: [],
  min_social_level: null,
  anchor_type: null,
  requires_booking: true,
  priority: 3,
  note_internal: '',
};

// =====================================================
// TRIP PREFERENCES TYPES
// =====================================================

export type TravelWith = 'couple' | 'family' | 'friends' | 'solo';
export type StartTimePreference = 'early' | 'normal' | 'late';
export type LunchStyle = 'long' | 'quick';
export type ActivityStyle = 'highlights' | 'maximize';
export type WalkingTolerance = 'low' | 'medium' | 'high';
export type TransportPreference = 'walking' | 'car' | 'public' | 'taxi';
export type BudgetLevel = 1 | 2 | 3;
export type MaxTravelMinutes = 0 | 30 | 60 | 90;

export const CUISINE_TYPE_OPTIONS = [
  { id: 'tradizionale', label: 'Cucina tradizionale' },
  { id: 'street-food', label: 'Street food' },
  { id: 'fine-dining', label: 'Fine dining' },
  { id: 'pizza', label: 'Pizzerie' },
  { id: 'pesce', label: 'Ristoranti di pesce' },
  { id: 'vegetariano', label: 'Vegetariano' },
] as const;

export const DIETARY_RESTRICTION_OPTIONS = [
  { id: 'vegetariano', label: 'Vegetariano' },
  { id: 'vegano', label: 'Vegano' },
  { id: 'gluten-free', label: 'Senza glutine' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' },
  { id: 'allergie', label: 'Allergie alimentari' },
] as const;

export const BUDGET_OPTIONS = [
  { value: 1, label: '€', description: 'Economico' },
  { value: 2, label: '€€', description: 'Medio' },
  { value: 3, label: '€€€', description: 'Alto' },
] as const;

export type CuisineType = typeof CUISINE_TYPE_OPTIONS[number]['id'];
export type DietaryRestriction = typeof DIETARY_RESTRICTION_OPTIONS[number]['id'];

/**
 * TripPreferences - Preferenze complete del viaggiatore
 * Salvate nel campo JSONB `preferences` della tabella `trip_plans`
 */
export interface TripPreferencesDB {
  city?: string;
  nearbyAreas?: boolean;
  maxTravelMinutes?: MaxTravelMinutes;
  dates?: { start: string; end: string } | null;
  numDays?: number;
  travelers?: {
    adults: number;
    children: number;
    seniors: number;
  };
  travelWith?: TravelWith;
  interests?: string[];
  topInterests?: string[];
  rhythm?: number; // 1-5 (calm to intense)
  startTime?: StartTimePreference;
  lunchStyle?: LunchStyle;
  
  // Food preferences - CRITICAL for recommendations
  cuisinePreferences?: CuisineType[];
  budget?: BudgetLevel;
  dietaryRestrictions?: DietaryRestriction[];
  
  activityStyle?: ActivityStyle;
  guidedTours?: boolean;
  walkingTolerance?: WalkingTolerance;
  accommodation?: { zone: string } | null;
  transport?: TransportPreference;
  constraints?: string[];
  wishes?: string;
  avoid?: string[];
}
