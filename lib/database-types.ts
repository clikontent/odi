// Database type definitions for TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          location: string | null
          linkedin_url: string | null
          portfolio_url: string | null
          bio: string | null
          skills: string[] | null
          experience_level: "entry" | "mid" | "senior" | "executive" | null
          industry: string | null
          is_active: boolean
          email_verified: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          location?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          bio?: string | null
          skills?: string[] | null
          experience_level?: "entry" | "mid" | "senior" | "executive" | null
          industry?: string | null
          is_active?: boolean
          email_verified?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          location?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          bio?: string | null
          skills?: string[] | null
          experience_level?: "entry" | "mid" | "senior" | "executive" | null
          industry?: string | null
          is_active?: boolean
          email_verified?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role_name: "user" | "admin" | "super_admin" | "content_moderator" | "job_poster"
          granted_by: string | null
          granted_at: string
          expires_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          role_name: "user" | "admin" | "super_admin" | "content_moderator" | "job_poster"
          granted_by?: string | null
          granted_at?: string
          expires_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          role_name?: "user" | "admin" | "super_admin" | "content_moderator" | "job_poster"
          granted_by?: string | null
          granted_at?: string
          expires_at?: string | null
          is_active?: boolean
        }
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          plan_type: "free" | "premium" | "professional" | "corporate"
          price_monthly: number
          price_yearly: number | null
          currency: string
          features: any // JSONB
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          plan_type: "free" | "premium" | "professional" | "corporate"
          price_monthly?: number
          price_yearly?: number | null
          currency?: string
          features: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          plan_type?: "free" | "premium" | "professional" | "corporate"
          price_monthly?: number
          price_yearly?: number | null
          currency?: string
          features?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: "active" | "canceled" | "past_due" | "trialing" | "incomplete"
          current_period_start: string
          current_period_end: string
          trial_start: string | null
          trial_end: string | null
          cancel_at_period_end: boolean
          canceled_at: string | null
          intasend_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status: "active" | "canceled" | "past_due" | "trialing" | "incomplete"
          current_period_start: string
          current_period_end: string
          trial_start?: string | null
          trial_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          intasend_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: "active" | "canceled" | "past_due" | "trialing" | "incomplete"
          current_period_start?: string
          current_period_end?: string
          trial_start?: string | null
          trial_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          intasend_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          intasend_transaction_id: string
          intasend_invoice_id: string | null
          payment_type: "subscription" | "one_time_download" | "upgrade"
          amount: number
          currency: string
          status: "pending" | "completed" | "failed" | "refunded" | "canceled"
          payment_method: string | null
          description: string | null
          metadata: any | null
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          intasend_transaction_id: string
          intasend_invoice_id?: string | null
          payment_type: "subscription" | "one_time_download" | "upgrade"
          amount: number
          currency?: string
          status: "pending" | "completed" | "failed" | "refunded" | "canceled"
          payment_method?: string | null
          description?: string | null
          metadata?: any | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          intasend_transaction_id?: string
          intasend_invoice_id?: string | null
          payment_type?: "subscription" | "one_time_download" | "upgrade"
          amount?: number
          currency?: string
          status?: "pending" | "completed" | "failed" | "refunded" | "canceled"
          payment_method?: string | null
          description?: string | null
          metadata?: any | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      resume_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          category: "modern" | "classic" | "creative" | "executive" | "minimal" | "professional"
          html_template: string
          css_styles: string
          preview_image_url: string | null
          thumbnail_url: string | null
          is_premium: boolean
          is_active: boolean
          download_count: number
          rating: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: "modern" | "classic" | "creative" | "executive" | "minimal" | "professional"
          html_template: string
          css_styles: string
          preview_image_url?: string | null
          thumbnail_url?: string | null
          is_premium?: boolean
          is_active?: boolean
          download_count?: number
          rating?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: "modern" | "classic" | "creative" | "executive" | "minimal" | "professional"
          html_template?: string
          css_styles?: string
          preview_image_url?: string | null
          thumbnail_url?: string | null
          is_premium?: boolean
          is_active?: boolean
          download_count?: number
          rating?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      job_postings: {
        Row: {
          id: string
          posted_by: string | null
          company_name: string
          company_logo_url: string | null
          job_title: string
          description: string
          requirements: string[] | null
          responsibilities: string[] | null
          location: string | null
          salary_range: string | null
          salary_min: number | null
          salary_max: number | null
          currency: string
          job_type: "full-time" | "part-time" | "contract" | "remote" | "hybrid"
          experience_level: "entry" | "mid" | "senior" | "executive"
          industry: string | null
          skills_required: string[] | null
          is_private: boolean
          is_featured: boolean
          is_active: boolean
          application_deadline: string | null
          external_url: string | null
          application_email: string | null
          application_instructions: string | null
          view_count: number
          application_count: number
          posted_date: string
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          posted_by?: string | null
          company_name: string
          company_logo_url?: string | null
          job_title: string
          description: string
          requirements?: string[] | null
          responsibilities?: string[] | null
          location?: string | null
          salary_range?: string | null
          salary_min?: number | null
          salary_max?: number | null
          currency?: string
          job_type: "full-time" | "part-time" | "contract" | "remote" | "hybrid"
          experience_level: "entry" | "mid" | "senior" | "executive"
          industry?: string | null
          skills_required?: string[] | null
          is_private?: boolean
          is_featured?: boolean
          is_active?: boolean
          application_deadline?: string | null
          external_url?: string | null
          application_email?: string | null
          application_instructions?: string | null
          view_count?: number
          application_count?: number
          posted_date?: string
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          posted_by?: string | null
          company_name?: string
          company_logo_url?: string | null
          job_title?: string
          description?: string
          requirements?: string[] | null
          responsibilities?: string[] | null
          location?: string | null
          salary_range?: string | null
          salary_min?: number | null
          salary_max?: number | null
          currency?: string
          job_type?: "full-time" | "part-time" | "contract" | "remote" | "hybrid"
          experience_level?: "entry" | "mid" | "senior" | "executive"
          industry?: string | null
          skills_required?: string[] | null
          is_private?: boolean
          is_featured?: boolean
          is_active?: boolean
          application_deadline?: string | null
          external_url?: string | null
          application_email?: string | null
          application_instructions?: string | null
          view_count?: number
          application_count?: number
          posted_date?: string
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      community_posts: {
        Row: {
          id: string
          posted_by: string | null
          post_type: "announcement" | "update" | "tip" | "success_story" | "maintenance"
          title: string
          content: string
          is_pinned: boolean
          is_active: boolean
          target_audience: string[]
          read_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          posted_by?: string | null
          post_type: "announcement" | "update" | "tip" | "success_story" | "maintenance"
          title: string
          content: string
          is_pinned?: boolean
          is_active?: boolean
          target_audience?: string[]
          read_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          posted_by?: string | null
          post_type?: "announcement" | "update" | "tip" | "success_story" | "maintenance"
          title?: string
          content?: string
          is_pinned?: boolean
          is_active?: boolean
          target_audience?: string[]
          read_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          notification_type: "system" | "payment" | "download" | "community" | "job_alert" | "subscription"
          title: string
          message: string
          action_url: string | null
          is_read: boolean
          is_important: boolean
          metadata: any | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          notification_type: "system" | "payment" | "download" | "community" | "job_alert" | "subscription"
          title: string
          message: string
          action_url?: string | null
          is_read?: boolean
          is_important?: boolean
          metadata?: any | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          notification_type?: "system" | "payment" | "download" | "community" | "job_alert" | "subscription"
          title?: string
          message?: string
          action_url?: string | null
          is_read?: boolean
          is_important?: boolean
          metadata?: any | null
          expires_at?: string | null
          created_at?: string
        }
      }
      user_activities: {
        Row: {
          id: string
          user_id: string
          activity_type:
            | "resume_created"
            | "resume_downloaded"
            | "cover_letter_created"
            | "cover_letter_downloaded"
            | "job_applied"
            | "template_viewed"
            | "ats_optimization"
            | "interview_session"
            | "payment_made"
            | "subscription_changed"
          description: string
          metadata: any | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type:
            | "resume_created"
            | "resume_downloaded"
            | "cover_letter_created"
            | "cover_letter_downloaded"
            | "job_applied"
            | "template_viewed"
            | "ats_optimization"
            | "interview_session"
            | "payment_made"
            | "subscription_changed"
          description: string
          metadata?: any | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?:
            | "resume_created"
            | "resume_downloaded"
            | "cover_letter_created"
            | "cover_letter_downloaded"
            | "job_applied"
            | "template_viewed"
            | "ats_optimization"
            | "interview_session"
            | "payment_made"
            | "subscription_changed"
          description?: string
          metadata?: any | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_usage: {
        Args: {
          p_user_id: string
          p_month_year: string
          p_feature: string
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
