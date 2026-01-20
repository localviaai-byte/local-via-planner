// =====================================================
// LOCALVIA DATABASE TYPES
// =====================================================

export type AppRole = 'admin' | 'local_contributor' | 'editor';

export type PlaceType = 'attraction' | 'bar' | 'restaurant' | 'club' | 'zone' | 'experience' | 'view';

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
  { id: 'zone', label: 'Zona / Area', icon: '🧭', description: 'Quartieri da esplorare' },
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
  { id: 'moderate', label: '€€', description: 'Prezzo medio' },
  { id: 'expensive', label: '€€€', description: 'Costoso' },
  { id: 'luxury', label: '€€€€', description: 'Lusso' },
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
}

export const DEFAULT_PLACE_FORM_DATA: PlaceFormData = {
  city_id: '',
  place_type: null,
  zone_id: null,
  name: '',
  address: '',
  zone: '',
  photo_url: '',
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
};
