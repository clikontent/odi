-- Create user_stats table to track usage limits
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cover_letters_used INT NOT NULL DEFAULT 0,
  resume_downloads_used INT NOT NULL DEFAULT 0,
  storage_used BIGINT NOT NULL DEFAULT 0,
  storage_limit BIGINT NOT NULL DEFAULT 104857600, -- 100MB default
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);

-- Add is_featured column to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Add match_score column to job_applications table
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS match_score INT;

-- Add match_details column to job_applications table
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS match_details JSONB;
