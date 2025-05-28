-- =============================================
-- CV CHAP CHAP DATABASE SCHEMA
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CORE USER MANAGEMENT
-- =============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    location TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    bio TEXT,
    skills TEXT[], -- Array of skills
    experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
    industry TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles and permissions
CREATE TABLE public.user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role_name TEXT NOT NULL CHECK (role_name IN ('user', 'admin', 'super_admin', 'content_moderator', 'job_poster')),
    granted_by UUID REFERENCES public.users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, role_name)
);

-- =============================================
-- SUBSCRIPTION MANAGEMENT
-- =============================================

-- Subscription plans
CREATE TABLE public.subscription_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'premium', 'professional', 'corporate')),
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_yearly DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    features JSONB NOT NULL, -- Plan features and limits
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.subscription_plans(id),
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMPTZ,
    intasend_subscription_id TEXT, -- IntaSend subscription reference
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE public.usage_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    month_year TEXT NOT NULL, -- Format: "2024-01"
    cover_letters_generated INTEGER DEFAULT 0,
    resumes_generated INTEGER DEFAULT 0,
    resumes_downloaded INTEGER DEFAULT 0,
    cover_letters_downloaded INTEGER DEFAULT 0,
    ats_optimizations_used INTEGER DEFAULT 0,
    interview_sessions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, month_year)
);

-- =============================================
-- PAYMENT MANAGEMENT (IntaSend)
-- =============================================

-- Payment transactions
CREATE TABLE public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    intasend_transaction_id TEXT UNIQUE NOT NULL,
    intasend_invoice_id TEXT,
    payment_type TEXT NOT NULL CHECK (payment_type IN ('subscription', 'one_time_download', 'upgrade')),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'canceled')),
    payment_method TEXT, -- card, mpesa, bank, etc.
    description TEXT,
    metadata JSONB, -- Additional payment data
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Download history and payments
CREATE TABLE public.download_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('resume', 'cover_letter')),
    item_id UUID NOT NULL, -- References resume or cover_letter id
    payment_id UUID REFERENCES public.payments(id),
    download_format TEXT NOT NULL CHECK (download_format IN ('pdf', 'docx')),
    file_url TEXT, -- S3/storage URL
    is_paid_download BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 1,
    expires_at TIMESTAMPTZ, -- For temporary download links
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- RESUME TEMPLATES AND MANAGEMENT
-- =============================================

-- Resume templates
CREATE TABLE public.resume_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('modern', 'classic', 'creative', 'executive', 'minimal', 'professional')),
    html_template TEXT NOT NULL, -- HTML template with placeholders
    css_styles TEXT NOT NULL, -- CSS styles for the template
    preview_image_url TEXT,
    thumbnail_url TEXT,
    is_premium BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    download_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0, -- Average rating
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template placeholders reference
CREATE TABLE public.template_placeholders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    template_id UUID REFERENCES public.resume_templates(id) ON DELETE CASCADE,
    placeholder_name TEXT NOT NULL, -- e.g., "{FULL_NAME}"
    placeholder_category TEXT NOT NULL CHECK (placeholder_category IN ('personal', 'experience', 'education', 'skills', 'other', 'references')),
    description TEXT NOT NULL,
    is_required BOOLEAN DEFAULT false,
    default_value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User resumes
CREATE TABLE public.resumes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.resume_templates(id),
    title TEXT NOT NULL,
    content JSONB NOT NULL, -- User's resume data mapped to placeholders
    generated_html TEXT, -- Final rendered HTML
    file_url TEXT, -- Generated PDF/DOCX URL
    is_active BOOLEAN DEFAULT false, -- Only one active resume per user
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- COVER LETTERS
-- =============================================

-- Cover letters
CREATE TABLE public.cover_letters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Rich text content
    job_title TEXT,
    company_name TEXT,
    job_description TEXT, -- Original job description used for AI generation
    generated_by_ai BOOLEAN DEFAULT false,
    ai_prompt_used TEXT, -- Store the prompt used for AI generation
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- JOB BOARD
-- =============================================

-- Job postings
CREATE TABLE public.job_postings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    posted_by UUID REFERENCES public.users(id),
    company_name TEXT NOT NULL,
    company_logo_url TEXT,
    job_title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[],
    responsibilities TEXT[],
    location TEXT,
    salary_range TEXT,
    salary_min DECIMAL(12,2),
    salary_max DECIMAL(12,2),
    currency TEXT DEFAULT 'USD',
    job_type TEXT NOT NULL CHECK (job_type IN ('full-time', 'part-time', 'contract', 'remote', 'hybrid')),
    experience_level TEXT NOT NULL CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
    industry TEXT,
    skills_required TEXT[],
    is_private BOOLEAN DEFAULT false, -- Private jobs only visible to premium users
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    application_deadline TIMESTAMPTZ,
    external_url TEXT, -- Link to external job posting
    application_email TEXT,
    application_instructions TEXT,
    view_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    posted_date TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job applications
CREATE TABLE public.job_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    job_posting_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id),
    cover_letter_id UUID REFERENCES public.cover_letters(id),
    status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'viewed', 'interview', 'rejected', 'offer', 'accepted', 'withdrawn')),
    application_date TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    follow_up_date TIMESTAMPTZ,
    interview_date TIMESTAMPTZ,
    salary_offered DECIMAL(12,2),
    response_received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, job_posting_id)
);

-- =============================================
-- ATS OPTIMIZATION
-- =============================================

-- ATS optimization results
CREATE TABLE public.ats_optimizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id),
    job_description TEXT NOT NULL,
    optimization_type TEXT NOT NULL CHECK (optimization_type IN ('basic', 'full', 'advanced')),
    keyword_score INTEGER NOT NULL CHECK (keyword_score >= 0 AND keyword_score <= 100),
    ats_score INTEGER NOT NULL CHECK (ats_score >= 0 AND ats_score <= 100),
    missing_keywords TEXT[],
    suggestions TEXT[],
    detailed_analysis JSONB, -- Detailed AI analysis
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INTERVIEW PREPARATION
-- =============================================

-- Interview sessions
CREATE TABLE public.interview_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    job_application_id UUID REFERENCES public.job_applications(id),
    session_type TEXT NOT NULL CHECK (session_type IN ('practice', 'mock', 'ai_coaching')),
    job_title TEXT,
    company_name TEXT,
    industry TEXT,
    questions JSONB NOT NULL, -- Array of questions and answers
    ai_feedback JSONB, -- AI-generated feedback
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    duration_minutes INTEGER,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- COMMUNITY BOARD & NOTIFICATIONS
-- =============================================

-- Community board posts
CREATE TABLE public.community_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    posted_by UUID REFERENCES public.users(id),
    post_type TEXT NOT NULL CHECK (post_type IN ('announcement', 'update', 'tip', 'success_story', 'maintenance')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    target_audience TEXT[] DEFAULT ARRAY['all'], -- ['all', 'free', 'premium', 'professional']
    read_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User notifications
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('system', 'payment', 'download', 'community', 'job_alert', 'subscription')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT, -- URL to redirect when notification is clicked
    is_read BOOLEAN DEFAULT false,
    is_important BOOLEAN DEFAULT false,
    metadata JSONB, -- Additional notification data
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ACTIVITY TRACKING
-- =============================================

-- User activity log
CREATE TABLE public.user_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('resume_created', 'resume_downloaded', 'cover_letter_created', 'cover_letter_downloaded', 'job_applied', 'template_viewed', 'ats_optimization', 'interview_session', 'payment_made', 'subscription_changed')),
    description TEXT NOT NULL,
    metadata JSONB, -- Additional activity data
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ADMIN MANAGEMENT
-- =============================================

-- Admin settings
CREATE TABLE public.admin_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System logs
CREATE TABLE public.system_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    log_level TEXT NOT NULL CHECK (log_level IN ('info', 'warning', 'error', 'critical')),
    module TEXT NOT NULL, -- e.g., 'payment', 'auth', 'template', etc.
    message TEXT NOT NULL,
    metadata JSONB,
    user_id UUID REFERENCES public.users(id),
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_created_at ON public.users(created_at);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role_name ON public.user_roles(role_name);

-- Subscription indexes
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_usage_tracking_user_month ON public.usage_tracking(user_id, month_year);

-- Payment indexes
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_intasend_id ON public.payments(intasend_transaction_id);
CREATE INDEX idx_download_history_user_id ON public.download_history(user_id);

-- Resume and template indexes
CREATE INDEX idx_resume_templates_category ON public.resume_templates(category);
CREATE INDEX idx_resume_templates_is_premium ON public.resume_templates(is_premium);
CREATE INDEX idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX idx_resumes_template_id ON public.resumes(template_id);
CREATE INDEX idx_cover_letters_user_id ON public.cover_letters(user_id);

-- Job board indexes
CREATE INDEX idx_job_postings_is_private ON public.job_postings(is_private);
CREATE INDEX idx_job_postings_is_active ON public.job_postings(is_active);
CREATE INDEX idx_job_postings_posted_date ON public.job_postings(posted_date);
CREATE INDEX idx_job_postings_location ON public.job_postings(location);
CREATE INDEX idx_job_postings_job_type ON public.job_postings(job_type);
CREATE INDEX idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX idx_job_applications_status ON public.job_applications(status);

-- Community and notification indexes
CREATE INDEX idx_community_posts_post_type ON public.community_posts(post_type);
CREATE INDEX idx_community_posts_is_active ON public.community_posts(is_active);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX idx_user_activities_type ON public.user_activities(activity_type);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Resumes - users can only access their own
CREATE POLICY "Users can manage own resumes" ON public.resumes
    FOR ALL USING (auth.uid() = user_id);

-- Cover letters - users can only access their own
CREATE POLICY "Users can manage own cover letters" ON public.cover_letters
    FOR ALL USING (auth.uid() = user_id);

-- Job postings - public read, restricted write
CREATE POLICY "Anyone can view active public job postings" ON public.job_postings
    FOR SELECT USING (is_active = true AND (is_private = false OR auth.uid() IS NOT NULL));

-- Job applications - users can only access their own
CREATE POLICY "Users can manage own job applications" ON public.job_applications
    FOR ALL USING (auth.uid() = user_id);

-- Templates are publicly readable
CREATE POLICY "Anyone can view active templates" ON public.resume_templates
    FOR SELECT USING (is_active = true);

-- Community posts are publicly readable
CREATE POLICY "Anyone can view active community posts" ON public.community_posts
    FOR SELECT USING (is_active = true);

-- Notifications - users can only see their own
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON public.usage_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON public.resumes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cover_letters_updated_at BEFORE UPDATE ON public.cover_letters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON public.job_postings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON public.job_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_usage(
    p_user_id UUID,
    p_month_year TEXT,
    p_feature TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.usage_tracking (user_id, month_year)
    VALUES (p_user_id, p_month_year)
    ON CONFLICT (user_id, month_year) DO NOTHING;
    
    CASE p_feature
        WHEN 'cover_letters_generated' THEN
            UPDATE public.usage_tracking 
            SET cover_letters_generated = cover_letters_generated + 1
            WHERE user_id = p_user_id AND month_year = p_month_year;
        WHEN 'resumes_generated' THEN
            UPDATE public.usage_tracking 
            SET resumes_generated = resumes_generated + 1
            WHERE user_id = p_user_id AND month_year = p_month_year;
        WHEN 'resumes_downloaded' THEN
            UPDATE public.usage_tracking 
            SET resumes_downloaded = resumes_downloaded + 1
            WHERE user_id = p_user_id AND month_year = p_month_year;
        WHEN 'cover_letters_downloaded' THEN
            UPDATE public.usage_tracking 
            SET cover_letters_downloaded = cover_letters_downloaded + 1
            WHERE user_id = p_user_id AND month_year = p_month_year;
        WHEN 'ats_optimizations_used' THEN
            UPDATE public.usage_tracking 
            SET ats_optimizations_used = ats_optimizations_used + 1
            WHERE user_id = p_user_id AND month_year = p_month_year;
        WHEN 'interview_sessions' THEN
            UPDATE public.usage_tracking 
            SET interview_sessions = interview_sessions + 1
            WHERE user_id = p_user_id AND month_year = p_month_year;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- INITIAL DATA SETUP
-- =============================================

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, plan_type, price_monthly, price_yearly, features) VALUES
('Free Plan', 'free', 0.00, 0.00, '{
    "cover_letters": 5,
    "resumes": 0,
    "resume_downloads": 0,
    "ats_optimizations": 1,
    "interview_sessions": 0,
    "job_board_access": "public",
    "premium_templates": false,
    "ai_features": false,
    "priority_support": false
}'),
('Premium Plan', 'premium', 9.99, 99.99, '{
    "cover_letters": 25,
    "resumes": 5,
    "resume_downloads": 5,
    "ats_optimizations": 10,
    "interview_sessions": 0,
    "job_board_access": "private",
    "premium_templates": true,
    "ai_features": true,
    "priority_support": false
}'),
('Professional Plan', 'professional', 19.99, 199.99, '{
    "cover_letters": -1,
    "resumes": 20,
    "resume_downloads": 20,
    "ats_optimizations": -1,
    "interview_sessions": -1,
    "job_board_access": "full",
    "premium_templates": true,
    "ai_features": true,
    "priority_support": true
}'),
('Corporate Plan', 'corporate', 150.00, 1500.00, '{
    "cover_letters": -1,
    "resumes": -1,
    "resume_downloads": -1,
    "ats_optimizations": -1,
    "interview_sessions": -1,
    "job_board_access": "full",
    "premium_templates": true,
    "ai_features": true,
    "priority_support": true,
    "team_management": true,
    "analytics": true
}');

-- Insert admin settings
INSERT INTO public.admin_settings (setting_key, setting_value, description) VALUES
('site_maintenance', 'false', 'Enable/disable site maintenance mode'),
('max_file_size_mb', '10', 'Maximum file upload size in MB'),
('allowed_file_types', '["pdf", "docx", "jpg", "png"]', 'Allowed file types for uploads'),
('email_notifications', 'true', 'Enable/disable email notifications'),
('ai_features_enabled', 'true', 'Enable/disable AI features globally'),
('payment_gateway', 'intasend', 'Active payment gateway'),
('default_currency', 'USD', 'Default currency for payments');

-- Create super admin user role for odimaoscar@gmail.com
-- Note: This will be executed after the user signs up
-- INSERT INTO public.user_roles (user_id, role_name, granted_by)
-- SELECT id, 'super_admin', id FROM public.users WHERE email = 'odimaoscar@gmail.com';
