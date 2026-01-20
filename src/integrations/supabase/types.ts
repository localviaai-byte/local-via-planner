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
          country: string
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          name: string
          region: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          country?: string
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          region?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          country?: string
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          region?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
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
          best_days: string[] | null
          best_times: string[] | null
          city_id: string
          created_at: string
          created_by: string
          flirt_friendly: boolean | null
          google_place_id: string | null
          group_friendly: boolean | null
          id: string
          latitude: number | null
          local_one_liner: string | null
          local_warning: string | null
          longitude: number | null
          name: string
          periods_to_avoid: string | null
          photo_url: string | null
          place_type: Database["public"]["Enums"]["place_type"]
          quality_score: number | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          social_level: number | null
          solo_friendly: boolean | null
          status: Database["public"]["Enums"]["place_status"]
          target_audience: Database["public"]["Enums"]["target_audience"] | null
          updated_at: string
          vibe_calm_to_energetic: number | null
          vibe_empty_to_crowded: number | null
          vibe_quiet_to_loud: number | null
          vibe_touristy_to_local: number | null
          why_other: string | null
          why_people_go: string[] | null
          zone: string | null
        }
        Insert: {
          address?: string | null
          best_days?: string[] | null
          best_times?: string[] | null
          city_id: string
          created_at?: string
          created_by: string
          flirt_friendly?: boolean | null
          google_place_id?: string | null
          group_friendly?: boolean | null
          id?: string
          latitude?: number | null
          local_one_liner?: string | null
          local_warning?: string | null
          longitude?: number | null
          name: string
          periods_to_avoid?: string | null
          photo_url?: string | null
          place_type: Database["public"]["Enums"]["place_type"]
          quality_score?: number | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_level?: number | null
          solo_friendly?: boolean | null
          status?: Database["public"]["Enums"]["place_status"]
          target_audience?:
            | Database["public"]["Enums"]["target_audience"]
            | null
          updated_at?: string
          vibe_calm_to_energetic?: number | null
          vibe_empty_to_crowded?: number | null
          vibe_quiet_to_loud?: number | null
          vibe_touristy_to_local?: number | null
          why_other?: string | null
          why_people_go?: string[] | null
          zone?: string | null
        }
        Update: {
          address?: string | null
          best_days?: string[] | null
          best_times?: string[] | null
          city_id?: string
          created_at?: string
          created_by?: string
          flirt_friendly?: boolean | null
          google_place_id?: string | null
          group_friendly?: boolean | null
          id?: string
          latitude?: number | null
          local_one_liner?: string | null
          local_warning?: string | null
          longitude?: number | null
          name?: string
          periods_to_avoid?: string | null
          photo_url?: string | null
          place_type?: Database["public"]["Enums"]["place_type"]
          quality_score?: number | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_level?: number | null
          solo_friendly?: boolean | null
          status?: Database["public"]["Enums"]["place_status"]
          target_audience?:
            | Database["public"]["Enums"]["target_audience"]
            | null
          updated_at?: string
          vibe_calm_to_energetic?: number | null
          vibe_empty_to_crowded?: number | null
          vibe_quiet_to_loud?: number | null
          vibe_touristy_to_local?: number | null
          why_other?: string | null
          why_people_go?: string[] | null
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "places_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
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
      target_audience: "locals" | "tourists" | "mixed" | "students" | "couples"
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
      ],
      target_audience: ["locals", "tourists", "mixed", "students", "couples"],
    },
  },
} as const
