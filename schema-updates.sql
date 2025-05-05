-- Add subscription_end_date column to profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Update existing users to have free tier and NULL subscription_end_date
UPDATE public.profiles
SET subscription_tier = 'free', subscription_end_date = NULL
WHERE subscription_tier IS NULL OR subscription_tier = '';

-- Create RLS policies for better security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can read their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Allow authenticated users to access dashboard tables
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own resumes" ON public.resumes
FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own cover letters" ON public.cover_letters
FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own job applications" ON public.job_applications
FOR ALL USING (auth.uid() = user_id);
