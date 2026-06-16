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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_history: {
        Row: {
          created_at: string
          id: string
          prompt: string
          response: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompt: string
          response?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          prompt?: string
          response?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          awarded_at: string
          code: string
          id: string
          meta: Json
          user_id: string
        }
        Insert: {
          awarded_at?: string
          code: string
          id?: string
          meta?: Json
          user_id: string
        }
        Update: {
          awarded_at?: string
          code?: string
          id?: string
          meta?: Json
          user_id?: string
        }
        Relationships: []
      }
      content_reports: {
        Row: {
          created_at: string
          id: string
          reason: string | null
          reporter_id: string
          status: string
          target_id: string
          target_kind: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason?: string | null
          reporter_id: string
          status?: string
          target_id: string
          target_kind: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string | null
          reporter_id?: string
          status?: string
          target_id?: string
          target_kind?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          ai_meta: Json | null
          created_at: string
          id: string
          plan: Json
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          ai_meta?: Json | null
          created_at?: string
          id?: string
          plan?: Json
          updated_at?: string
          user_id: string
          week_start: string
        }
        Update: {
          ai_meta?: Json | null
          created_at?: string
          id?: string
          plan?: Json
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          kind: string
          link: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          kind: string
          link?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          kind?: string
          link?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      nutrition_logs: {
        Row: {
          carbs: number
          created_at: string
          fat: number
          id: string
          kcal: number
          log_date: string
          meal: string
          note: string | null
          protein: number
          recipe_id: string | null
          servings: number
          user_id: string
        }
        Insert: {
          carbs?: number
          created_at?: string
          fat?: number
          id?: string
          kcal?: number
          log_date?: string
          meal?: string
          note?: string | null
          protein?: number
          recipe_id?: string | null
          servings?: number
          user_id: string
        }
        Update: {
          carbs?: number
          created_at?: string
          fat?: number
          id?: string
          kcal?: number
          log_date?: string
          meal?: string
          note?: string | null
          protein?: number
          recipe_id?: string | null
          servings?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_logs_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      pantry_items: {
        Row: {
          barcode: string | null
          brand: string | null
          created_at: string
          expires_at: string | null
          id: string
          image_url: string | null
          is_leftover: boolean
          name: string
          notes: string | null
          quantity: number | null
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_leftover?: boolean
          name: string
          notes?: string | null
          quantity?: number | null
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_leftover?: boolean
          name?: string
          notes?: string | null
          quantity?: number | null
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          preferences: Json
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          preferences?: Json
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          preferences?: Json
          updated_at?: string
        }
        Relationships: []
      }
      recipe_comments: {
        Row: {
          body: string
          created_at: string
          id: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          recipe_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_comments_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_interactions: {
        Row: {
          created_at: string
          id: string
          kind: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_interactions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_likes: {
        Row: {
          created_at: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_likes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          image_url: string | null
          overall: number
          recipe_id: string
          sub_scores: Json
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          overall: number
          recipe_id: string
          sub_scores?: Json
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          overall?: number
          recipe_id?: string
          sub_scores?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ratings_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_remixes: {
        Row: {
          created_at: string
          id: string
          remix_recipe_id: string
          source_recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          remix_recipe_id: string
          source_recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          remix_recipe_id?: string
          source_recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_remixes_remix_recipe_id_fkey"
            columns: ["remix_recipe_id"]
            isOneToOne: true
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_remixes_source_recipe_id_fkey"
            columns: ["source_recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_shares: {
        Row: {
          created_at: string
          id: string
          recipe_id: string
          share_token: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipe_id: string
          share_token?: string
        }
        Update: {
          created_at?: string
          id?: string
          recipe_id?: string
          share_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_shares_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          ai_meta: Json | null
          carbs_g: number | null
          created_at: string
          description: string | null
          equipment: string[]
          estimated_calories: number | null
          estimated_cost: number | null
          fat_g: number | null
          id: string
          image_url: string | null
          ingredients: Json
          protein_g: number | null
          servings: number | null
          source: string
          steps: Json
          tags: string[]
          time_minutes: number | null
          title: string
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          ai_meta?: Json | null
          carbs_g?: number | null
          created_at?: string
          description?: string | null
          equipment?: string[]
          estimated_calories?: number | null
          estimated_cost?: number | null
          fat_g?: number | null
          id?: string
          image_url?: string | null
          ingredients?: Json
          protein_g?: number | null
          servings?: number | null
          source?: string
          steps?: Json
          tags?: string[]
          time_minutes?: number | null
          title: string
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          ai_meta?: Json | null
          carbs_g?: number | null
          created_at?: string
          description?: string | null
          equipment?: string[]
          estimated_calories?: number | null
          estimated_cost?: number | null
          fat_g?: number | null
          id?: string
          image_url?: string | null
          ingredients?: Json
          protein_g?: number | null
          servings?: number | null
          source?: string
          steps?: Json
          tags?: string[]
          time_minutes?: number | null
          title?: string
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: []
      }
      saved_recipes: {
        Row: {
          created_at: string
          id: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      search_history: {
        Row: {
          created_at: string
          id: string
          query: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          query: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          query?: string
          user_id?: string
        }
        Relationships: []
      }
      shopping_items: {
        Row: {
          created_at: string
          estimated_cost: number | null
          id: string
          is_done: boolean
          name: string
          quantity: number | null
          unit: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          estimated_cost?: number | null
          id?: string
          is_done?: boolean
          name: string
          quantity?: number | null
          unit?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          estimated_cost?: number | null
          id?: string
          is_done?: boolean
          name?: string
          quantity?: number | null
          unit?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_violations: {
        Row: {
          created_at: string
          detail: string | null
          id: string
          kind: string
          severity: string
          user_id: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          id?: string
          kind: string
          severity?: string
          user_id: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          id?: string
          kind?: string
          severity?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
