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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_readings: {
        Row: {
          bazi_record_id: string | null
          content: string
          created_at: string | null
          id: string
          reading_type: string
          user_id: string
        }
        Insert: {
          bazi_record_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          reading_type: string
          user_id: string
        }
        Update: {
          bazi_record_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          reading_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_readings_bazi_record_id_fkey"
            columns: ["bazi_record_id"]
            isOneToOne: false
            referencedRelation: "bazi_records"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_records: {
        Row: {
          bazi_record_id: string | null
          created_at: string
          id: string
          usage_type: string
          user_id: string
        }
        Insert: {
          bazi_record_id?: string | null
          created_at?: string
          id?: string
          usage_type?: string
          user_id: string
        }
        Update: {
          bazi_record_id?: string | null
          created_at?: string
          id?: string
          usage_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_records_bazi_record_id_fkey"
            columns: ["bazi_record_id"]
            isOneToOne: false
            referencedRelation: "bazi_records"
            referencedColumns: ["id"]
          },
        ]
      }
      bazi_records: {
        Row: {
          birth_day: number
          birth_hour: number
          birth_month: number
          birth_year: number
          created_at: string | null
          gender: string | null
          id: string
          result: Json
          user_id: string
        }
        Insert: {
          birth_day: number
          birth_hour: number
          birth_month: number
          birth_year: number
          created_at?: string | null
          gender?: string | null
          id?: string
          result: Json
          user_id: string
        }
        Update: {
          birth_day?: number
          birth_hour?: number
          birth_month?: number
          birth_year?: number
          created_at?: string | null
          gender?: string | null
          id?: string
          result?: Json
          user_id?: string
        }
        Relationships: []
      }
      custom_questions: {
        Row: {
          answer: string | null
          answered_at: string | null
          bazi_record_id: string
          created_at: string
          id: string
          question: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          bazi_record_id: string
          created_at?: string
          id?: string
          question: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          bazi_record_id?: string
          created_at?: string
          id?: string
          question?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_questions_bazi_record_id_fkey"
            columns: ["bazi_record_id"]
            isOneToOne: false
            referencedRelation: "bazi_records"
            referencedColumns: ["id"]
          },
        ]
      }
      liunian_analyses: {
        Row: {
          analysis: Json
          bazi_record_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          analysis: Json
          bazi_record_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          analysis?: Json
          bazi_record_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "liunian_analyses_bazi_record_id_fkey"
            columns: ["bazi_record_id"]
            isOneToOne: false
            referencedRelation: "bazi_records"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_records: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          id: string
          payment_method: string
          payment_status: string
          region: string | null
          subscription_id: string | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          id?: string
          payment_method: string
          payment_status?: string
          region?: string | null
          subscription_id?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          id?: string
          payment_method?: string
          payment_status?: string
          region?: string | null
          subscription_id?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_records_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      reading_bookmarks: {
        Row: {
          bazi_record_id: string
          content: string
          created_at: string
          highlight_text: string | null
          id: string
          note: string | null
          reading_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bazi_record_id: string
          content: string
          created_at?: string
          highlight_text?: string | null
          id?: string
          note?: string | null
          reading_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bazi_record_id?: string
          content?: string
          created_at?: string
          highlight_text?: string | null
          id?: string
          note?: string | null
          reading_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_bookmarks_bazi_record_id_fkey"
            columns: ["bazi_record_id"]
            isOneToOne: false
            referencedRelation: "bazi_records"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_feedbacks: {
        Row: {
          admin_note: string | null
          bazi_record_id: string
          created_at: string
          feedback_text: string | null
          feedback_type: string
          id: string
          reading_content: string
          reading_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          bazi_record_id: string
          created_at?: string
          feedback_text?: string | null
          feedback_type: string
          id?: string
          reading_content: string
          reading_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          bazi_record_id?: string
          created_at?: string
          feedback_text?: string | null
          feedback_type?: string
          id?: string
          reading_content?: string
          reading_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_feedbacks_bazi_record_id_fkey"
            columns: ["bazi_record_id"]
            isOneToOne: false
            referencedRelation: "bazi_records"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_shares: {
        Row: {
          bazi_record_id: string
          content: Json
          created_at: string
          expires_at: string | null
          id: string
          reading_type: string
          share_code: string
          updated_at: string
          user_id: string
          views_count: number
        }
        Insert: {
          bazi_record_id: string
          content: Json
          created_at?: string
          expires_at?: string | null
          id?: string
          reading_type: string
          share_code: string
          updated_at?: string
          user_id: string
          views_count?: number
        }
        Update: {
          bazi_record_id?: string
          content?: Json
          created_at?: string
          expires_at?: string | null
          id?: string
          reading_type?: string
          share_code?: string
          updated_at?: string
          user_id?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "reading_shares_bazi_record_id_fkey"
            columns: ["bazi_record_id"]
            isOneToOne: false
            referencedRelation: "bazi_records"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string | null
          currency: string | null
          expires_at: string
          id: string
          payment_method: string | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          region: string | null
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string | null
          currency?: string | null
          expires_at: string
          id?: string
          payment_method?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          region?: string | null
          started_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string | null
          currency?: string | null
          expires_at?: string
          id?: string
          payment_method?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          region?: string | null
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_memberships: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["membership_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          language: string
          region: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string
          region?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          region?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "vip" | "admin"
      membership_tier: "free" | "basic" | "premium" | "vip"
      subscription_plan: "basic" | "advanced" | "premium"
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
      app_role: ["user", "vip", "admin"],
      membership_tier: ["free", "basic", "premium", "vip"],
      subscription_plan: ["basic", "advanced", "premium"],
    },
  },
} as const
