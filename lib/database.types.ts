export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          job_title: string | null
          location: string | null
          phone: string | null
          email: string | null
          website: string | null
          linkedin: string | null
          github: string | null
          twitter: string | null
          bio: string | null
          subscription_tier: string
          subscription_expires_at: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          job_title?: string | null
          location?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          linkedin?: string | null
          github?: string | null
          twitter?: string | null
          bio?: string | null
          subscription_tier?: string
          subscription_expires_at?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          job_title?: string | null
          location?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          linkedin?: string | null
          github?: string | null
          twitter?: string | null
          bio?: string | null
          subscription_tier?: string
          subscription_expires_at?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      resume_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          thumbnail_url: string | null
          html_content: string
          css_content: string | null
          js_content: string | null
          category: string
          is_premium: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          thumbnail_url?: string | null
          html_content: string
          css_content?: string | null
          js_content?: string | null
          category: string
          is_premium?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          thumbnail_url?: string | null
          html_content?: string
          css_content?: string | null
          js_content?: string | null
          category?: string
          is_premium?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cover_letter_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          thumbnail_url: string | null
          html_content: string
          css_content: string | null
          js_content: string | null
          category: string
          is_premium: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          thumbnail_url?: string | null
          html_content: string
          css_content?: string | null
          js_content?: string | null
          category: string
          is_premium?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          thumbnail_url?: string | null
          html_content?: string
          css_content?: string | null
          js_content?: string | null
          category?: string
          is_premium?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      resumes: {
        Row: {
          id: string
          user_id: string
          title: string
          content: Json
          template_id: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: Json
          template_id?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: Json
          template_id?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      cover_letters: {
        Row: {
          id: string
          user_id: string
          title: string
          content: Json
          template_id: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: Json
          template_id?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: Json
          template_id?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      job_applications: {
        Row: {
          id: string
          user_id: string
          company_name: string
          job_title: string
          job_description: string | null
          job_location: string | null
          job_url: string | null
          application_date: string
          status: string
          resume_id: string | null
          cover_letter_id: string | null
          next_step: string | null
          next_step_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          job_title: string
          job_description?: string | null
          job_location?: string | null
          job_url?: string | null
          application_date?: string
          status?: string
          resume_id?: string | null
          cover_letter_id?: string | null
          next_step?: string | null
          next_step_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          job_title?: string
          job_description?: string | null
          job_location?: string | null
          job_url?: string | null
          application_date?: string
          status?: string
          resume_id?: string | null
          cover_letter_id?: string | null
          next_step?: string | null
          next_step_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_files: {
        Row: {
          id: string
          user_id: string
          filename: string
          original_filename: string
          file_path: string
          file_type: string
          file_size: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          original_filename: string
          file_path: string
          file_type: string
          file_size: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          original_filename?: string
          file_path?: string
          file_type?: string
          file_size?: number
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          amount: number
          currency: string
          payment_method: string
          payment_status: string
          transaction_id: string | null
          payment_provider: string
          payment_details: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          currency?: string
          payment_method: string
          payment_status?: string
          transaction_id?: string | null
          payment_provider: string
          payment_details?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          currency?: string
          payment_method?: string
          payment_status?: string
          transaction_id?: string | null
          payment_provider?: string
          payment_details?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_name: string
          plan_price: number
          currency: string
          billing_cycle: string
          start_date: string
          end_date: string
          is_active: boolean
          auto_renew: boolean
          payment_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_name: string
          plan_price: number
          currency?: string
          billing_cycle?: string
          start_date?: string
          end_date: string
          is_active?: boolean
          auto_renew?: boolean
          payment_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_name?: string
          plan_price?: number
          currency?: string
          billing_cycle?: string
          start_date?: string
          end_date?: string
          is_active?: boolean
          auto_renew?: boolean
          payment_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          activity_details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          activity_details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: string
          activity_details?: Json | null
          created_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          user_id: string | null
          feedback_type: string
          content: string
          rating: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          feedback_type: string
          content: string
          rating?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          feedback_type?: string
          content?: string
          rating?: number | null
          created_at?: string
        }
      }
      ai_usage: {
        Row: {
          id: string
          user_id: string
          feature: string
          tokens_used: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          feature: string
          tokens_used: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          feature?: string
          tokens_used?: number
          created_at?: string
        }
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
