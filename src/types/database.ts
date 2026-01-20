// =====================================================
// LOCALVIA DATABASE TYPES
// =====================================================

export type AppRole = 'admin' | 'local_contributor' | 'editor';

export type PlaceType = 'attraction' | 'bar' | 'restaurant' | 'club' | 'zone' | 'experience';

export type PlaceStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'archived';

export type TargetAudience = 'locals' | 'tourists' | 'mixed' | 'students' | 'couples';

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
}

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

// Place type options
export const PLACE_TYPE_OPTIONS = [
  { id: 'attraction', label: 'Attrazione', icon: '🏛️' },
  { id: 'bar', label: 'Bar', icon: '🍸' },
  { id: 'restaurant', label: 'Ristorante', icon: '🍝' },
  { id: 'club', label: 'Club', icon: '🎵' },
  { id: 'zone', label: 'Zona', icon: '📍' },
  { id: 'experience', label: 'Esperienza', icon: '🎭' },
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
}

export const DEFAULT_PLACE_FORM_DATA: PlaceFormData = {
  city_id: '',
  place_type: null,
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
};
