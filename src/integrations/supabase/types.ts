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
      ai_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_sessions: {
        Row: {
          bazi_record_id: string | null
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bazi_record_id?: string | null
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bazi_record_id?: string | null
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      bazi_cases: {
        Row: {
          age_range: string
          bazi_data: Json
          case_code: string
          consultation_question: string
          created_at: string | null
          feedback_time: string | null
          gender: string
          helpful_votes: number | null
          id: string
          identity: string
          is_verified: boolean | null
          pattern_type: string
          region: string
          scenario_tags: string[]
          system_reading: string
          unhelpful_votes: number | null
          updated_at: string | null
          user_feedback: string | null
          wuxing_analysis: Json | null
        }
        Insert: {
          age_range: string
          bazi_data: Json
          case_code: string
          consultation_question: string
          created_at?: string | null
          feedback_time?: string | null
          gender: string
          helpful_votes?: number | null
          id?: string
          identity: string
          is_verified?: boolean | null
          pattern_type: string
          region: string
          scenario_tags: string[]
          system_reading: string
          unhelpful_votes?: number | null
          updated_at?: string | null
          user_feedback?: string | null
          wuxing_analysis?: Json | null
        }
        Update: {
          age_range?: string
          bazi_data?: Json
          case_code?: string
          consultation_question?: string
          created_at?: string | null
          feedback_time?: string | null
          gender?: string
          helpful_votes?: number | null
          id?: string
          identity?: string
          is_verified?: boolean | null
          pattern_type?: string
          region?: string
          scenario_tags?: string[]
          system_reading?: string
          unhelpful_votes?: number | null
          updated_at?: string | null
          user_feedback?: string | null
          wuxing_analysis?: Json | null
        }
        Relationships: []
      }
      bazi_derivation_cache: {
        Row: {
          bazi_record_id: string
          calculation_data: Json
          created_at: string | null
          explanation: string
          id: string
          step_index: number
          step_name: string
          user_id: string
        }
        Insert: {
          bazi_record_id: string
          calculation_data: Json
          created_at?: string | null
          explanation: string
          id?: string
          step_index: number
          step_name: string
          user_id: string
        }
        Update: {
          bazi_record_id?: string
          calculation_data?: Json
          created_at?: string | null
          explanation?: string
          id?: string
          step_index?: number
          step_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bazi_derivation_cache_bazi_record_id_fkey"
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
      case_feedbacks: {
        Row: {
          case_id: string
          created_at: string | null
          feedback_note: string | null
          id: string
          is_helpful: boolean
          user_id: string
        }
        Insert: {
          case_id: string
          created_at?: string | null
          feedback_note?: string | null
          id?: string
          is_helpful: boolean
          user_id: string
        }
        Update: {
          case_id?: string
          created_at?: string | null
          feedback_note?: string | null
          id?: string
          is_helpful?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_feedbacks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "bazi_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      classic_texts: {
        Row: {
          application_scenario: string
          book_author: string | null
          book_name: string
          chapter: string | null
          created_at: string | null
          id: string
          keyword: string
          modern_interpretation: string
          original_text: string
          updated_at: string | null
        }
        Insert: {
          application_scenario: string
          book_author?: string | null
          book_name: string
          chapter?: string | null
          created_at?: string | null
          id?: string
          keyword: string
          modern_interpretation: string
          original_text: string
          updated_at?: string | null
        }
        Update: {
          application_scenario?: string
          book_author?: string | null
          book_name?: string
          chapter?: string | null
          created_at?: string | null
          id?: string
          keyword?: string
          modern_interpretation?: string
          original_text?: string
          updated_at?: string | null
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
          scene_category: string | null
          scene_type: string | null
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
          scene_category?: string | null
          scene_type?: string | null
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
          scene_category?: string | null
          scene_type?: string | null
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
      fengshui_records: {
        Row: {
          analysis_result: string
          analysis_type: string
          build_year: number | null
          created_at: string
          description: string | null
          direction: string
          floor: number | null
          house_type: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_result: string
          analysis_type: string
          build_year?: number | null
          created_at?: string
          description?: string | null
          direction: string
          floor?: number | null
          house_type: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_result?: string
          analysis_type?: string
          build_year?: number | null
          created_at?: string
          description?: string | null
          direction?: string
          floor?: number | null
          house_type?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_courses: {
        Row: {
          created_at: string
          description: string
          id: string
          is_published: boolean
          level: string
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_published?: boolean
          level: string
          order_index: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_published?: boolean
          level?: string
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_lessons: {
        Row: {
          case_refs: string[] | null
          classic_text_refs: string[] | null
          content: string
          course_id: string
          created_at: string
          duration_minutes: number | null
          id: string
          media_type: string
          media_url: string | null
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          case_refs?: string[] | null
          classic_text_refs?: string[] | null
          content: string
          course_id: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          media_type: string
          media_url?: string | null
          order_index: number
          title: string
          updated_at?: string
        }
        Update: {
          case_refs?: string[] | null
          classic_text_refs?: string[] | null
          content?: string
          course_id?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          media_type?: string
          media_url?: string | null
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "learning_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_quizzes: {
        Row: {
          correct_answer: string
          created_at: string
          explanation: string | null
          id: string
          lesson_id: string
          options: Json
          order_index: number
          question: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          explanation?: string | null
          id?: string
          lesson_id: string
          options: Json
          order_index: number
          question: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          explanation?: string | null
          id?: string
          lesson_id?: string
          options?: Json
          order_index?: number
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons"
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
      membership_features: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          feature_key: string
          feature_name: string
          feature_value: string
          id: string
          tier: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          feature_key: string
          feature_name: string
          feature_value: string
          id?: string
          tier: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          feature_key?: string
          feature_name?: string
          feature_value?: string
          id?: string
          tier?: string
          updated_at?: string | null
        }
        Relationships: []
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
      referral_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string | null
          id: string
          max_uses: number | null
          updated_at: string
          user_id: string
          uses_count: number
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          updated_at?: string
          user_id: string
          uses_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          updated_at?: string
          user_id?: string
          uses_count?: number
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          created_at: string
          id: string
          referral_code_id: string
          referred_user_id: string
          referrer_id: string
          reward_count: number
          reward_type: string
          updated_at: string
          used_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code_id: string
          referred_user_id: string
          referrer_id: string
          reward_count?: number
          reward_type: string
          updated_at?: string
          used_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          referral_code_id?: string
          referred_user_id?: string
          referrer_id?: string
          reward_count?: number
          reward_type?: string
          updated_at?: string
          used_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
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
      user_learning_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          last_position: number | null
          lesson_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          last_position?: number | null
          lesson_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          last_position?: number | null
          lesson_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons"
            referencedColumns: ["id"]
          },
        ]
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
      user_quiz_results: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_correct: boolean
          quiz_id: string
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_correct: boolean
          quiz_id: string
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_correct?: boolean
          quiz_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quiz_results_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "lesson_quizzes"
            referencedColumns: ["id"]
          },
        ]
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
      user_scene_preferences: {
        Row: {
          created_at: string | null
          id: string
          last_used_at: string | null
          scene_type: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          scene_type: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          scene_type?: string
          usage_count?: number | null
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
      is_admin: { Args: { _user_id: string }; Returns: boolean }
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
