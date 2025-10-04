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
      appointments: {
        Row: {
          created_at: string
          duration_minutes: number | null
          id: string
          meeting_link: string | null
          mentor_id: string
          notes: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["appointment_status"] | null
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          meeting_link?: string | null
          mentor_id: string
          notes?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          meeting_link?: string | null
          mentor_id?: string
          notes?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      careers: {
        Row: {
          average_salary: string | null
          created_at: string
          description: string | null
          education_requirements: string | null
          growth_rate: string | null
          id: string
          image_url: string | null
          name: string
          required_skills: string[] | null
        }
        Insert: {
          average_salary?: string | null
          created_at?: string
          description?: string | null
          education_requirements?: string | null
          growth_rate?: string | null
          id?: string
          image_url?: string | null
          name: string
          required_skills?: string[] | null
        }
        Update: {
          average_salary?: string | null
          created_at?: string
          description?: string | null
          education_requirements?: string | null
          growth_rate?: string | null
          id?: string
          image_url?: string | null
          name?: string
          required_skills?: string[] | null
        }
        Relationships: []
      }
      colleges: {
        Row: {
          admission_requirements: string | null
          courses_offered: string[] | null
          created_at: string
          id: string
          location: string | null
          name: string
          ranking: number | null
          website_url: string | null
        }
        Insert: {
          admission_requirements?: string | null
          courses_offered?: string[] | null
          created_at?: string
          id?: string
          location?: string | null
          name: string
          ranking?: number | null
          website_url?: string | null
        }
        Update: {
          admission_requirements?: string | null
          courses_offered?: string[] | null
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          ranking?: number | null
          website_url?: string | null
        }
        Relationships: []
      }
      mentor_profiles: {
        Row: {
          availability: Json | null
          bio: string | null
          company: string | null
          created_at: string
          education: string | null
          experience_years: number | null
          expertise: string[] | null
          hourly_rate: number | null
          id: string
          status: Database["public"]["Enums"]["mentor_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: Json | null
          bio?: string | null
          company?: string | null
          created_at?: string
          education?: string | null
          experience_years?: number | null
          expertise?: string[] | null
          hourly_rate?: number | null
          id?: string
          status?: Database["public"]["Enums"]["mentor_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: Json | null
          bio?: string | null
          company?: string | null
          created_at?: string
          education?: string | null
          experience_years?: number | null
          expertise?: string[] | null
          hourly_rate?: number | null
          id?: string
          status?: Database["public"]["Enums"]["mentor_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      quiz_results: {
        Row: {
          created_at: string
          id: string
          quiz_data: Json
          recommended_careers: string[] | null
          scores: Json
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          quiz_data: Json
          recommended_careers?: string[] | null
          scores: Json
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          quiz_data?: Json
          recommended_careers?: string[] | null
          scores?: Json
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          career_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          language: string | null
          thumbnail_url: string | null
          title: string
          type: Database["public"]["Enums"]["resource_type"]
          url: string
        }
        Insert: {
          career_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          language?: string | null
          thumbnail_url?: string | null
          title: string
          type: Database["public"]["Enums"]["resource_type"]
          url: string
        }
        Update: {
          career_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          language?: string | null
          thumbnail_url?: string | null
          title?: string
          type?: Database["public"]["Enums"]["resource_type"]
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_career_id_fkey"
            columns: ["career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarships: {
        Row: {
          amount: string | null
          application_url: string | null
          created_at: string
          deadline: string | null
          description: string | null
          eligibility: string | null
          id: string
          title: string
        }
        Insert: {
          amount?: string | null
          application_url?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          eligibility?: string | null
          id?: string
          title: string
        }
        Update: {
          amount?: string | null
          application_url?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          eligibility?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          bio: string | null
          city: string | null
          created_at: string
          grade: string | null
          id: string
          interests: string[] | null
          preferred_language: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          city?: string | null
          created_at?: string
          grade?: string | null
          id?: string
          interests?: string[] | null
          preferred_language?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          city?: string | null
          created_at?: string
          grade?: string | null
          id?: string
          interests?: string[] | null
          preferred_language?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      appointment_status: "pending" | "accepted" | "completed" | "cancelled"
      mentor_status: "pending" | "approved" | "rejected"
      resource_type: "pdf" | "article" | "video" | "course"
      user_role: "student" | "mentor" | "admin"
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
      appointment_status: ["pending", "accepted", "completed", "cancelled"],
      mentor_status: ["pending", "approved", "rejected"],
      resource_type: ["pdf", "article", "video", "course"],
      user_role: ["student", "mentor", "admin"],
    },
  },
} as const
