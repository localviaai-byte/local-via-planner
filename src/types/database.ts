// =====================================================
// LOCALVIA DATABASE TYPES
// =====================================================

export type AppRole = 'admin' | 'local_contributor' | 'editor';

export type PlaceType = 'attraction' | 'bar' | 'restaurant' | 'club' | 'zone' | 'experience' | 'view';

export type PlaceStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'archived';

export type TargetAudience = 'locals' | 'tourists' | 'mixed' | 'students' | 'couples';

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
  // New city-level data labeling fields
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
  vibe: string[];
  why_go: string | null;
  when_to_go: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// City form data for wizard
export interface CityFormData {
  // Step 1: Identity
  name: string;
  region: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  tags: CityTag[];
  
  // Step 2: Structure
  walkable: CityWalkability | null;
  rhythm: CityRhythm | null;
  best_times: BestTimeOfDay[];
  tourist_errors: string;
  local_warning: string;
  
  // Step 3: Zones (managed separately)
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

// Why people go options
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

// Place type options - expanded
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
  
  // Vibe (1-5)
  vibe_calm_to_energetic: number | null;
  vibe_quiet_to_loud: number | null;
  vibe_empty_to_crowded: number | null;
  vibe_touristy_to_local: number | null;
  
  // Timing
  best_days: BestDay[];
  best_times: BestTime[];
  periods_to_avoid: string | null;
  
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
  created_by: string;
  created_at: string;
  updated_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
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

// Form data for wizard
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
  
  // Step 4: Vibe
  vibe_calm_to_energetic: number;
  vibe_quiet_to_loud: number;
  vibe_empty_to_crowded: number;
  vibe_touristy_to_local: number;
  
  // Step 5: Timing
  best_days: BestDay[];
  best_times: BestTime[];
  periods_to_avoid: string;
  
  // Step 6: Warning
  local_warning: string;
  
  // Step 7: One-liner
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
  vibe_calm_to_energetic: 3,
  vibe_quiet_to_loud: 3,
  vibe_empty_to_crowded: 3,
  vibe_touristy_to_local: 3,
  best_days: [],
  best_times: [],
  periods_to_avoid: '',
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
