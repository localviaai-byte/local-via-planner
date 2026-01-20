export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cities: {
        Row: {
          best_times: Database["public"]["Enums"]["best_time_of_day"][] | null
          country: string
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          latitude: number | null
          local_warning: string | null
          longitude: number | null
          name: string
          region: string | null
          rhythm: Database["public"]["Enums"]["city_rhythm"] | null
          slug: string
          status: Database["public"]["Enums"]["city_status"] | null
          tags: Database["public"]["Enums"]["city_tag"][] | null
          tourist_errors: string | null
          updated_at: string
          walkable: Database["public"]["Enums"]["city_walkability"] | null
        }
        Insert: {
          best_times?: Database["public"]["Enums"]["best_time_of_day"][] | null
          country?: string
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          local_warning?: string | null
          longitude?: number | null
          name: string
          region?: string | null
          rhythm?: Database["public"]["Enums"]["city_rhythm"] | null
          slug: string
          status?: Database["public"]["Enums"]["city_status"] | null
          tags?: Database["public"]["Enums"]["city_tag"][] | null
          tourist_errors?: string | null
          updated_at?: string
          walkable?: Database["public"]["Enums"]["city_walkability"] | null
        }
        Update: {
          best_times?: Database["public"]["Enums"]["best_time_of_day"][] | null
          country?: string
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          local_warning?: string | null
          longitude?: number | null
          name?: string
          region?: string | null
          rhythm?: Database["public"]["Enums"]["city_rhythm"] | null
          slug?: string
          status?: Database["public"]["Enums"]["city_status"] | null
          tags?: Database["public"]["Enums"]["city_tag"][] | null
          tourist_errors?: string | null
          updated_at?: string
          walkable?: Database["public"]["Enums"]["city_walkability"] | null
        }
        Relationships: []
      }
      city_cluster_members: {
        Row: {
          city_id: string
          cluster_id: string
          created_at: string | null
          role: string | null
        }
        Insert: {
          city_id: string
          cluster_id: string
          created_at?: string | null
          role?: string | null
        }
        Update: {
          city_id?: string
          cluster_id?: string
          created_at?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "city_cluster_members_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_cluster_members_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "city_clusters"
            referencedColumns: ["id"]
          },
        ]
      }
      city_clusters: {
        Row: {
          country: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          country?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          country?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      city_connections: {
        Row: {
          best_departure_time:
            | Database["public"]["Enums"]["time_bucket"][]
            | null
          best_return_time: Database["public"]["Enums"]["time_bucket"][] | null
          city_id_from: string
          city_id_to: string
          connection_type: Database["public"]["Enums"]["connection_type"]
          cost_note: string | null
          created_at: string
          created_by: string | null
          friction_score: number | null
          id: string
          is_active: boolean
          local_tip: string | null
          primary_mode: Database["public"]["Enums"]["transport_mode"]
          reliability_score: number | null
          seasonality_note: string | null
          typical_max_minutes: number | null
          typical_min_minutes: number | null
          warning: string | null
        }
        Insert: {
          best_departure_time?:
            | Database["public"]["Enums"]["time_bucket"][]
            | null
          best_return_time?: Database["public"]["Enums"]["time_bucket"][] | null
          city_id_from: string
          city_id_to: string
          connection_type: Database["public"]["Enums"]["connection_type"]
          cost_note?: string | null
          created_at?: string
          created_by?: string | null
          friction_score?: number | null
          id?: string
          is_active?: boolean
          local_tip?: string | null
          primary_mode?: Database["public"]["Enums"]["transport_mode"]
          reliability_score?: number | null
          seasonality_note?: string | null
          typical_max_minutes?: number | null
          typical_min_minutes?: number | null
          warning?: string | null
        }
        Update: {
          best_departure_time?:
            | Database["public"]["Enums"]["time_bucket"][]
            | null
          best_return_time?: Database["public"]["Enums"]["time_bucket"][] | null
          city_id_from?: string
          city_id_to?: string
          connection_type?: Database["public"]["Enums"]["connection_type"]
          cost_note?: string | null
          created_at?: string
          created_by?: string | null
          friction_score?: number | null
          id?: string
          is_active?: boolean
          local_tip?: string | null
          primary_mode?: Database["public"]["Enums"]["transport_mode"]
          reliability_score?: number | null
          seasonality_note?: string | null
          typical_max_minutes?: number | null
          typical_min_minutes?: number | null
          warning?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "city_connections_city_id_from_fkey"
            columns: ["city_id_from"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_connections_city_id_to_fkey"
            columns: ["city_id_to"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      city_zones: {
        Row: {
          best_time: Database["public"]["Enums"]["time_bucket"] | null
          city_id: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          local_tip: string | null
          name: string
          safety_note: string | null
          status: Database["public"]["Enums"]["place_status"]
          touristy_score: number | null
          updated_at: string
          vibe: string[] | null
          vibe_primary: Database["public"]["Enums"]["vibe_label"] | null
          vibe_secondary: Database["public"]["Enums"]["vibe_label"] | null
          when_to_go: string | null
          why_go: string | null
        }
        Insert: {
          best_time?: Database["public"]["Enums"]["time_bucket"] | null
          city_id: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          local_tip?: string | null
          name: string
          safety_note?: string | null
          status?: Database["public"]["Enums"]["place_status"]
          touristy_score?: number | null
          updated_at?: string
          vibe?: string[] | null
          vibe_primary?: Database["public"]["Enums"]["vibe_label"] | null
          vibe_secondary?: Database["public"]["Enums"]["vibe_label"] | null
          when_to_go?: string | null
          why_go?: string | null
        }
        Update: {
          best_time?: Database["public"]["Enums"]["time_bucket"] | null
          city_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          local_tip?: string | null
          name?: string
          safety_note?: string | null
          status?: Database["public"]["Enums"]["place_status"]
          touristy_score?: number | null
          updated_at?: string
          vibe?: string[] | null
          vibe_primary?: Database["public"]["Enums"]["vibe_label"] | null
          vibe_secondary?: Database["public"]["Enums"]["vibe_label"] | null
          when_to_go?: string | null
          why_go?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "city_zones_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      place_coverage: {
        Row: {
          base_city_id: string
          created_at: string
          created_by: string | null
          note: string | null
          place_id: string
          relevance: number | null
        }
        Insert: {
          base_city_id: string
          created_at?: string
          created_by?: string | null
          note?: string | null
          place_id: string
          relevance?: number | null
        }
        Update: {
          base_city_id?: string
          created_at?: string
          created_by?: string | null
          note?: string | null
          place_id?: string
          relevance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "place_coverage_base_city_id_fkey"
            columns: ["base_city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_coverage_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_flags: {
        Row: {
          created_at: string
          created_by: string
          flag_type: string
          id: string
          notes: string | null
          place_id: string
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          flag_type: string
          id?: string
          notes?: string | null
          place_id: string
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          flag_type?: string
          id?: string
          notes?: string | null
          place_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "place_flags_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_media: {
        Row: {
          caption: string | null
          created_at: string
          created_by: string | null
          id: string
          media_url: string
          place_id: string
          sort_order: number
        }
        Insert: {
          caption?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          media_url: string
          place_id: string
          sort_order?: number
        }
        Update: {
          caption?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          media_url?: string
          place_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "place_media_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_opening_hours: {
        Row: {
          close_time: string
          created_at: string
          day_of_week: number
          id: string
          is_closed: boolean
          note: string | null
          open_time: string
          place_id: string
        }
        Insert: {
          close_time: string
          created_at?: string
          day_of_week: number
          id?: string
          is_closed?: boolean
          note?: string | null
          open_time: string
          place_id: string
        }
        Update: {
          close_time?: string
          created_at?: string
          day_of_week?: number
          id?: string
          is_closed?: boolean
          note?: string | null
          open_time?: string
          place_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_opening_hours_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_reviews: {
        Row: {
          comment: string | null
          created_at: string
          decision: Database["public"]["Enums"]["review_decision"]
          editor_id: string
          id: string
          place_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          decision: Database["public"]["Enums"]["review_decision"]
          editor_id: string
          id?: string
          place_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          decision?: Database["public"]["Enums"]["review_decision"]
          editor_id?: string
          id?: string
          place_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_reviews_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_suggestions: {
        Row: {
          accepted_place_id: string | null
          address: string | null
          best_times: string[] | null
          city_id: string
          confidence: number
          created_at: string
          description: string | null
          id: string
          name: string
          place_type: string
          status: string
          why_people_go: string[] | null
          zone: string | null
        }
        Insert: {
          accepted_place_id?: string | null
          address?: string | null
          best_times?: string[] | null
          city_id: string
          confidence?: number
          created_at?: string
          description?: string | null
          id?: string
          name: string
          place_type: string
          status?: string
          why_people_go?: string[] | null
          zone?: string | null
        }
        Update: {
          accepted_place_id?: string | null
          address?: string | null
          best_times?: string[] | null
          city_id?: string
          confidence?: number
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          place_type?: string
          status?: string
          why_people_go?: string[] | null
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "place_suggestions_accepted_place_id_fkey"
            columns: ["accepted_place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_suggestions_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      place_tags: {
        Row: {
          created_at: string
          place_id: string
          tag_id: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          place_id: string
          tag_id: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          place_id?: string
          tag_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "place_tags_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      place_versions: {
        Row: {
          change_summary: string | null
          created_at: string
          created_by: string
          data: Json
          id: string
          place_id: string
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          created_at?: string
          created_by: string
          data: Json
          id?: string
          place_id: string
          version_number?: number
        }
        Update: {
          change_summary?: string | null
          created_at?: string
          created_by?: string
          data?: Json
          id?: string
          place_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "place_versions_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          address: string | null
          bar_time: string | null
          best_days: string[] | null
          best_light_time: string | null
          best_period: string | null
          best_times: string[] | null
          city_id: string
          created_at: string
          created_by: string
          crowd_level: string | null
          cuisine_type: string | null
          dead_times_note: string | null
          dress_code: string | null
          drink_focus: string | null
          duration_minutes: number | null
          flirt_friendly: boolean | null
          gender_balance: Database["public"]["Enums"]["gender_balance"] | null
          google_place_id: string | null
          group_friendly: boolean | null
          id: string
          ideal_for: Database["public"]["Enums"]["ideal_for"][]
          indoor_outdoor: string | null
          is_repeatable: boolean | null
          latitude: number | null
          local_one_liner: string | null
          local_secret: boolean
          local_warning: string | null
          longitude: number | null
          meal_time: string | null
          mental_effort: number | null
          mood_primary: Database["public"]["Enums"]["vibe_label"] | null
          mood_secondary: Database["public"]["Enums"]["vibe_label"] | null
          name: string
          needs_booking: boolean | null
          notes_internal: string | null
          overrated: boolean
          pace: string | null
          periods_to_avoid: string | null
          photo_url: string | null
          physical_effort: number | null
          place_type: Database["public"]["Enums"]["place_type"]
          pre_or_post: string | null
          price_range: string | null
          quality_score: number | null
          real_start_time: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          search_tsv: unknown
          shared_tables: boolean | null
          social_level: number | null
          solo_friendly: boolean | null
          standing_ok: boolean | null
          status: Database["public"]["Enums"]["place_status"]
          suggested_stay: Database["public"]["Enums"]["suggested_stay"] | null
          target_audience: Database["public"]["Enums"]["target_audience"] | null
          time_to_spend: string | null
          tourist_trap: boolean
          updated_at: string
          updated_by: string | null
          vibe_calm_to_energetic: number | null
          vibe_empty_to_crowded: number | null
          vibe_quiet_to_loud: number | null
          vibe_touristy_to_local: number | null
          why_other: string | null
          why_people_go: string[] | null
          works_solo: boolean | null
          worth_detour: boolean | null
          zone: string | null
          zone_id: string | null
        }
        Insert: {
          address?: string | null
          bar_time?: string | null
          best_days?: string[] | null
          best_light_time?: string | null
          best_period?: string | null
          best_times?: string[] | null
          city_id: string
          created_at?: string
          created_by: string
          crowd_level?: string | null
          cuisine_type?: string | null
          dead_times_note?: string | null
          dress_code?: string | null
          drink_focus?: string | null
          duration_minutes?: number | null
          flirt_friendly?: boolean | null
          gender_balance?: Database["public"]["Enums"]["gender_balance"] | null
          google_place_id?: string | null
          group_friendly?: boolean | null
          id?: string
          ideal_for?: Database["public"]["Enums"]["ideal_for"][]
          indoor_outdoor?: string | null
          is_repeatable?: boolean | null
          latitude?: number | null
          local_one_liner?: string | null
          local_secret?: boolean
          local_warning?: string | null
          longitude?: number | null
          meal_time?: string | null
          mental_effort?: number | null
          mood_primary?: Database["public"]["Enums"]["vibe_label"] | null
          mood_secondary?: Database["public"]["Enums"]["vibe_label"] | null
          name: string
          needs_booking?: boolean | null
          notes_internal?: string | null
          overrated?: boolean
          pace?: string | null
          periods_to_avoid?: string | null
          photo_url?: string | null
          physical_effort?: number | null
          place_type: Database["public"]["Enums"]["place_type"]
          pre_or_post?: string | null
          price_range?: string | null
          quality_score?: number | null
          real_start_time?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          search_tsv?: unknown
          shared_tables?: boolean | null
          social_level?: number | null
          solo_friendly?: boolean | null
          standing_ok?: boolean | null
          status?: Database["public"]["Enums"]["place_status"]
          suggested_stay?: Database["public"]["Enums"]["suggested_stay"] | null
          target_audience?:
            | Database["public"]["Enums"]["target_audience"]
            | null
          time_to_spend?: string | null
          tourist_trap?: boolean
          updated_at?: string
          updated_by?: string | null
          vibe_calm_to_energetic?: number | null
          vibe_empty_to_crowded?: number | null
          vibe_quiet_to_loud?: number | null
          vibe_touristy_to_local?: number | null
          why_other?: string | null
          why_people_go?: string[] | null
          works_solo?: boolean | null
          worth_detour?: boolean | null
          zone?: string | null
          zone_id?: string | null
        }
        Update: {
          address?: string | null
          bar_time?: string | null
          best_days?: string[] | null
          best_light_time?: string | null
          best_period?: string | null
          best_times?: string[] | null
          city_id?: string
          created_at?: string
          created_by?: string
          crowd_level?: string | null
          cuisine_type?: string | null
          dead_times_note?: string | null
          dress_code?: string | null
          drink_focus?: string | null
          duration_minutes?: number | null
          flirt_friendly?: boolean | null
          gender_balance?: Database["public"]["Enums"]["gender_balance"] | null
          google_place_id?: string | null
          group_friendly?: boolean | null
          id?: string
          ideal_for?: Database["public"]["Enums"]["ideal_for"][]
          indoor_outdoor?: string | null
          is_repeatable?: boolean | null
          latitude?: number | null
          local_one_liner?: string | null
          local_secret?: boolean
          local_warning?: string | null
          longitude?: number | null
          meal_time?: string | null
          mental_effort?: number | null
          mood_primary?: Database["public"]["Enums"]["vibe_label"] | null
          mood_secondary?: Database["public"]["Enums"]["vibe_label"] | null
          name?: string
          needs_booking?: boolean | null
          notes_internal?: string | null
          overrated?: boolean
          pace?: string | null
          periods_to_avoid?: string | null
          photo_url?: string | null
          physical_effort?: number | null
          place_type?: Database["public"]["Enums"]["place_type"]
          pre_or_post?: string | null
          price_range?: string | null
          quality_score?: number | null
          real_start_time?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          search_tsv?: unknown
          shared_tables?: boolean | null
          social_level?: number | null
          solo_friendly?: boolean | null
          standing_ok?: boolean | null
          status?: Database["public"]["Enums"]["place_status"]
          suggested_stay?: Database["public"]["Enums"]["suggested_stay"] | null
          target_audience?:
            | Database["public"]["Enums"]["target_audience"]
            | null
          time_to_spend?: string | null
          tourist_trap?: boolean
          updated_at?: string
          updated_by?: string | null
          vibe_calm_to_energetic?: number | null
          vibe_empty_to_crowded?: number | null
          vibe_quiet_to_loud?: number | null
          vibe_touristy_to_local?: number | null
          why_other?: string | null
          why_people_go?: string[] | null
          works_solo?: boolean | null
          worth_detour?: boolean | null
          zone?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "places_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "places_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "city_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          label_en: string | null
          label_it: string
          tag_group: string
          tag_key: string
        }
        Insert: {
          created_at?: string
          id?: string
          label_en?: string | null
          label_it: string
          tag_group: string
          tag_key: string
        }
        Update: {
          created_at?: string
          id?: string
          label_en?: string | null
          label_it?: string
          tag_group?: string
          tag_key?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_city_id: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_city_id?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_city_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_assigned_city"
            columns: ["assigned_city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_quality_score: {
        Args: { place_row: Database["public"]["Tables"]["places"]["Row"] }
        Returns: number
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "local_contributor" | "editor"
      best_time_of_day: "morning" | "afternoon" | "evening" | "night"
      city_rhythm: "very_slow" | "medium" | "intense"
      city_status: "empty" | "building" | "active"
      city_tag:
        | "archeology"
        | "sea"
        | "nightlife"
        | "food"
        | "romantic"
        | "chaotic"
        | "slow"
        | "art"
        | "nature"
        | "shopping"
      city_walkability: "yes" | "no" | "depends"
      connection_type: "day_trip" | "metro" | "nearby_city" | "multi_city"
      crowd_type: "low" | "medium" | "high" | "variable"
      gender_balance: "balanced" | "more_men" | "more_women" | "unknown"
      ideal_for:
        | "couple"
        | "friends"
        | "solo_traveler"
        | "family"
        | "first_time"
        | "meet_people"
        | "chill"
        | "party"
        | "flirt_friendly"
      place_status:
        | "draft"
        | "pending_review"
        | "approved"
        | "rejected"
        | "archived"
      place_type:
        | "attraction"
        | "bar"
        | "restaurant"
        | "club"
        | "zone"
        | "experience"
        | "view"
      price_level: "budget" | "moderate" | "expensive" | "luxury"
      review_decision: "approve" | "reject" | "request_changes"
      suggested_stay: "short" | "medium" | "long"
      target_audience: "locals" | "tourists" | "mixed" | "students" | "couples"
      time_bucket:
        | "morning"
        | "lunch"
        | "afternoon"
        | "aperitivo"
        | "dinner"
        | "evening"
        | "night"
      transport_mode: "car" | "train" | "bus" | "ferry" | "walk" | "mixed"
      vibe_label:
        | "easy"
        | "energetic"
        | "romantic"
        | "chaotic"
        | "chic"
        | "underground"
        | "authentic"
      why_go:
        | "have_fun"
        | "socialize"
        | "date_spot"
        | "eat_drink_well"
        | "relax"
        | "do_something_different"
        | "culture"
        | "scenic"
      yes_no_maybe: "yes" | "no" | "depends"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "local_contributor", "editor"],
      best_time_of_day: ["morning", "afternoon", "evening", "night"],
      city_rhythm: ["very_slow", "medium", "intense"],
      city_status: ["empty", "building", "active"],
      city_tag: [
        "archeology",
        "sea",
        "nightlife",
        "food",
        "romantic",
        "chaotic",
        "slow",
        "art",
        "nature",
        "shopping",
      ],
      city_walkability: ["yes", "no", "depends"],
      connection_type: ["day_trip", "metro", "nearby_city", "multi_city"],
      crowd_type: ["low", "medium", "high", "variable"],
      gender_balance: ["balanced", "more_men", "more_women", "unknown"],
      ideal_for: [
        "couple",
        "friends",
        "solo_traveler",
        "family",
        "first_time",
        "meet_people",
        "chill",
        "party",
        "flirt_friendly",
      ],
      place_status: [
        "draft",
        "pending_review",
        "approved",
        "rejected",
        "archived",
      ],
      place_type: [
        "attraction",
        "bar",
        "restaurant",
        "club",
        "zone",
        "experience",
        "view",
      ],
      price_level: ["budget", "moderate", "expensive", "luxury"],
      review_decision: ["approve", "reject", "request_changes"],
      suggested_stay: ["short", "medium", "long"],
      target_audience: ["locals", "tourists", "mixed", "students", "couples"],
      time_bucket: [
        "morning",
        "lunch",
        "afternoon",
        "aperitivo",
        "dinner",
        "evening",
        "night",
      ],
      transport_mode: ["car", "train", "bus", "ferry", "walk", "mixed"],
      vibe_label: [
        "easy",
        "energetic",
        "romantic",
        "chaotic",
        "chic",
        "underground",
        "authentic",
      ],
      why_go: [
        "have_fun",
        "socialize",
        "date_spot",
        "eat_drink_well",
        "relax",
        "do_something_different",
        "culture",
        "scenic",
      ],
      yes_no_maybe: ["yes", "no", "depends"],
    },
  },
} as const
