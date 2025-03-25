-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a table for public profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  job_title TEXT,
  location TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  linkedin TEXT,
  github TEXT,
  twitter TEXT,
  bio TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create a trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create a table for resume templates
CREATE TABLE resume_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  html_content TEXT NOT NULL,
  css_content TEXT,
  js_content TEXT,
  category TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create a table for cover letter templates
CREATE TABLE cover_letter_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  html_content TEXT NOT NULL,
  css_content TEXT,
  js_content TEXT,
  category TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create a table for resumes
CREATE TABLE resumes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL, -- Structured resume data
  template_id UUID REFERENCES resume_templates(id),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create a table for cover letters
CREATE TABLE cover_letters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL, -- Structured cover letter data
  template_id UUID REFERENCES cover_letter_templates(id),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create a table for job applications
CREATE TABLE job_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_description TEXT,
  job_location TEXT,
  job_url TEXT,
  application_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'applied', 'interview', 'offer', 'rejected')),
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  cover_letter_id UUID REFERENCES cover_letters(id) ON DELETE SET NULL,
  next_step TEXT,
  next_step_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create a table for user files (uploaded resumes, cover letters, etc.)
CREATE TABLE user_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create a table for payments
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'KES' NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id TEXT,
  payment_provider TEXT NOT NULL,
  payment_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create a table for subscriptions
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan_name TEXT NOT NULL,
  plan_price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'KES' NOT NULL,
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  start_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  auto_renew BOOLEAN DEFAULT TRUE,
  payment_id UUID REFERENCES payments(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create a table for user activity logs
CREATE TABLE activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  activity_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create a table for feedback
CREATE TABLE feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create a table for AI usage tracking
CREATE TABLE ai_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  feature TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_letter_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Profiles: Users can read their own profile
CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Profiles: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Profiles: Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  ));

-- Resume Templates: Anyone can read public templates
CREATE POLICY "Anyone can read public templates"
  ON resume_templates FOR SELECT
  USING (is_premium = FALSE OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND (
      profiles.subscription_tier != 'free' OR
      profiles.is_admin = TRUE
    )
  ));

-- Cover Letter Templates: Anyone can read public templates
CREATE POLICY "Anyone can read public cover letter templates"
  ON cover_letter_templates FOR SELECT
  USING (is_premium = FALSE OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND (
      profiles.subscription_tier != 'free' OR
      profiles.is_admin = TRUE
    )
  ));

-- Resumes: Users can CRUD their own resumes
CREATE POLICY "Users can read their own resumes"
  ON resumes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes"
  ON resumes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes"
  ON resumes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes"
  ON resumes FOR DELETE
  USING (auth.uid() = user_id);

-- Cover Letters: Users can CRUD their own cover letters
CREATE POLICY "Users can read their own cover letters"
  ON cover_letters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cover letters"
  ON cover_letters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cover letters"
  ON cover_letters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cover letters"
  ON cover_letters FOR DELETE
  USING (auth.uid() = user_id);

-- Job Applications: Users can CRUD their own job applications
CREATE POLICY "Users can read their own job applications"
  ON job_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own job applications"
  ON job_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job applications"
  ON job_applications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job applications"
  ON job_applications FOR DELETE
  USING (auth.uid() = user_id);

-- User Files: Users can CRUD their own files
CREATE POLICY "Users can read their own files"
  ON user_files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own files"
  ON user_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files"
  ON user_files FOR DELETE
  USING (auth.uid() = user_id);

-- Payments: Users can read their own payments
CREATE POLICY "Users can read their own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- Subscriptions: Users can read their own subscriptions
CREATE POLICY "Users can read their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Activity Logs: Users can read their own activity logs
CREATE POLICY "Users can read their own activity logs"
  ON activity_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Feedback: Users can CRUD their own feedback
CREATE POLICY "Users can read their own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback"
  ON feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
  ON feedback FOR UPDATE
  USING (auth.uid() = user_id);

-- AI Usage: Users can read their own AI usage
CREATE POLICY "Users can read their own AI usage"
  ON ai_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Admin policies for all tables
CREATE POLICY "Admins can read all data"
  ON resumes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  ));

CREATE POLICY "Admins can read all cover letters"
  ON cover_letters FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  ));

CREATE POLICY "Admins can read all job applications"
  ON job_applications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  ));

CREATE POLICY "Admins can read all user files"
  ON user_files FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  ));

CREATE POLICY "Admins can read all payments"
  ON payments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  ));

CREATE POLICY "Admins can read all subscriptions"
  ON subscriptions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  ));

CREATE POLICY "Admins can read all activity logs"
  ON activity_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  ));

CREATE POLICY "Admins can read all feedback"
  ON feedback FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  ));

CREATE POLICY "Admins can read all AI usage"
  ON ai_usage FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  ));

-- Create indexes for better performance
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_cover_letters_user_id ON cover_letters(user_id);
CREATE INDEX idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_user_files_user_id ON user_files(user_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_ai_usage_user_id ON ai_usage(user_id);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_resume_templates_updated_at
  BEFORE UPDATE ON resume_templates
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_cover_letter_templates_updated_at
  BEFORE UPDATE ON cover_letter_templates
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_cover_letters_updated_at
  BEFORE UPDATE ON cover_letters
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert sample data for resume templates
INSERT INTO resume_templates (name, description, category, html_content, css_content, is_premium)
VALUES 
('Professional', 'A classic template suitable for most industries', 'standard', 
'<div class="resume">
  <header>
    <h1>{{personal.firstName}} {{personal.lastName}}</h1>
    <p class="job-title">{{personal.jobTitle}}</p>
    <div class="contact-info">
      <span>{{personal.email}}</span>
      <span>{{personal.phone}}</span>
      <span>{{personal.location}}</span>
    </div>
  </header>
  
  <section class="summary">
    <h2>Professional Summary</h2>
    <p>{{personal.summary}}</p>
  </section>
  
  <section class="experience">
    <h2>Work Experience</h2>
    {{#each experience}}
    <div class="job">
      <div class="job-header">
        <h3>{{position}}</h3>
        <span class="date">{{startDate}} - {{endDate}}</span>
      </div>
      <p class="company">{{company}}</p>
      <p class="description">{{description}}</p>
    </div>
    {{/each}}
  </section>
  
  <section class="education">
    <h2>Education</h2>
    {{#each education}}
    <div class="school">
      <div class="school-header">
        <h3>{{school}}</h3>
        <span class="date">{{startDate}} - {{endDate}}</span>
      </div>
      <p>{{degree}} in {{field}}</p>
    </div>
    {{/each}}
  </section>
  
  <section class="skills">
    <h2>Skills</h2>
    <div class="skills-list">
      {{#each skills}}
      <span class="skill">{{this}}</span>
      {{/each}}
    </div>
  </section>
</div>', 
'body {
  font-family: "Arial", sans-serif;
  line-height: 1.6;
  color: #333;
  margin: 0;
  padding: 0;
}

.resume {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
}

header {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 20px;
}

h1 {
  font-size: 28px;
  margin: 0 0 5px;
}

.job-title {
  font-size: 18px;
  color: #666;
  margin: 0 0 15px;
}

.contact-info {
  font-size: 14px;
}

.contact-info span {
  margin: 0 10px;
}

section {
  margin-bottom: 25px;
}

h2 {
  font-size: 18px;
  text-transform: uppercase;
  margin-bottom: 15px;
  color: #444;
}

.job, .school {
  margin-bottom: 20px;
}

.job-header, .school-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 5px;
}

h3 {
  font-size: 16px;
  margin: 0;
}

.date {
  font-size: 14px;
  color: #666;
}

.company {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.description {
  font-size: 14px;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skill {
  background-color: #f0f0f0;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 14px;
}', 
FALSE),

('Modern', 'A contemporary design with a clean layout', 'creative', 
'<div class="resume">
  <header>
    <div class="header-content">
      <h1>{{personal.firstName}} {{personal.lastName}}</h1>
      <p class="job-title">{{personal.jobTitle}}</p>
    </div>
    <div class="contact-info">
      <div class="contact-item">
        <i class="icon-email"></i>
        <span>{{personal.email}}</span>
      </div>
      <div class="contact-item">
        <i class="icon-phone"></i>
        <span>{{personal.phone}}</span>
      </div>
      <div class="contact-item">
        <i class="icon-location"></i>
        <span>{{personal.location}}</span>
      </div>
    </div>
  </header>
  
  <div class="content">
    <div class="main-column">
      <section class="summary">
        <h2>About Me</h2>
        <p>{{personal.summary}}</p>
      </section>
      
      <section class="experience">
        <h2>Experience</h2>
        {{#each experience}}
        <div class="job">
          <div class="job-header">
            <h3>{{position}}</h3>
            <span class="company">{{company}}</span>
          </div>
          <span class="date">{{startDate}} - {{endDate}}</span>
          <p class="description">{{description}}</p>
        </div>
        {{/each}}
      </section>
    </div>
    
    <div class="side-column">
      <section class="education">
        <h2>Education</h2>
        {{#each education}}
        <div class="school">
          <h3>{{school}}</h3>
          <p>{{degree}} in {{field}}</p>
          <span class="date">{{startDate}} - {{endDate}}</span>
        </div>
        {{/each}}
      </section>
      
      <section class="skills">
        <h2>Skills</h2>
        <ul class="skills-list">
          {{#each skills}}
          <li>{{this}}</li>
          {{/each}}
        </ul>
      </section>
    </div>
  </div>
</div>', 
'body {
  font-family: "Roboto", sans-serif;
  line-height: 1.6;
  color: #333;
  margin: 0;
  padding: 0;
  background-color: #f9f9f9;
}

.resume {
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

header {
  background-color: #2c3e50;
  color: white;
  padding: 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-content {
  flex: 2;
}

h1 {
  font-size: 28px;
  margin: 0 0 5px;
  font-weight: 300;
}

.job-title {
  font-size: 18px;
  opacity: 0.9;
  margin: 0;
}

.contact-info {
  flex: 1;
  text-align: right;
}

.contact-item {
  margin-bottom: 8px;
  font-size: 14px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.contact-item i {
  margin-right: 8px;
}

.content {
  display: flex;
  padding: 30px;
}

.main-column {
  flex: 2;
  padding-right: 30px;
}

.side-column {
  flex: 1;
  border-left: 1px solid #eee;
  padding-left: 30px;
}

section {
  margin-bottom: 30px;
}

h2 {
  font-size: 18px;
  color: #2c3e50;
  border-bottom: 2px solid #2c3e50;
  padding-bottom: 5px;
  margin-bottom: 15px;
  font-weight: 500;
}

.job, .school {
  margin-bottom: 25px;
}

h3 {
  font-size: 16px;
  margin: 0 0 5px;
  color: #2c3e50;
  font-weight: 500;
}

.company {
  font-size: 15px;
  color: #3498db;
}

.date {
  font-size: 14px;
  color: #7f8c8d;
  display: block;
  margin-bottom: 8px;
}

.description {
  font-size: 14px;
}

.skills-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.skills-list li {
  margin-bottom: 8px;
  position: relative;
  padding-left: 20px;
}

.skills-list li:before {
  content: "•";
  color: #3498db;
  position: absolute;
  left: 0;
}', 
FALSE),

('Minimalist', 'A simple and elegant design with minimal elements', 'simple', 
'<div class="resume">
  <header>
    <h1>{{personal.firstName}} {{personal.lastName}}</h1>
    <p class="job-title">{{personal.jobTitle}}</p>
    <div class="contact-info">
      <span>{{personal.email}}</span> • 
      <span>{{personal.phone}}</span> • 
      <span>{{personal.location}}</span>
    </div>
  </header>
  
  <section class="summary">
    <p>{{personal.summary}}</p>
  </section>
  
  <section class="experience">
    <h2>Experience</h2>
    {{#each experience}}
    <div class="job">
      <div class="job-header">
        <h3>{{position}}</h3>
        <span class="date">{{startDate}} - {{endDate}}</span>
      </div>
      <p class="company">{{company}}</p>
      <p class="description">{{description}}</p>
    </div>
    {{/each}}
  </section>
  
  <section class="education">
    <h2>Education</h2>
    {{#each education}}
    <div class="school">
      <div class="school-header">
        <h3>{{school}}</h3>
        <span class="date">{{startDate}} - {{endDate}}</span>
      </div>
      <p>{{degree}} in {{field}}</p>
    </div>
    {{/each}}
  </section>
  
  <section class="skills">
    <h2>Skills</h2>
    <p class="skills-list">{{skills}}</p>
  </section>
</div>', 
'body {
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  margin: 0;
  padding: 0;
  font-weight: 300;
}

.resume {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
}

header {
  margin-bottom: 40px;
}

h1 {
  font-size: 28px;
  margin: 0 0 5px;
  font-weight: 400;
  letter-spacing: 0.5px;
}

.job-title {
  font-size: 18px;
  color: #666;
  margin: 0 0 15px;
  font-weight: 300;
}

.contact-info {
  font-size: 14px;
}

section {
  margin-bottom: 30px;
}

h2 {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 15px;
  color: #999;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
  font-weight: 400;
}

.job, .school {
  margin-bottom: 25px;
}

.job-header, .school-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 5px;
}

h3 {
  font-size: 16px;
  margin: 0;
  font-weight: 400;
}

.date {
  font-size: 14px;
  color: #999;
}

.company {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.description {
  font-size: 14px;
}

.skills-list {
  font-size: 14px;
}', 
FALSE),

('Creative', 'A bold design for creative professionals', 'creative', 
'<div class="resume">
  <div class="sidebar">
    <div class="profile">
      <div class="profile-img"></div>
      <h1>{{personal.firstName}}<br>{{personal.lastName}}</h1>
      <p class="job-title">{{personal.jobTitle}}</p>
    </div>
    
    <div class="contact">
      <h2>Contact</h2>
      <div class="contact-item">
        <i class="icon-email"></i>
        <span>{{personal.email}}</span>
      </div>
      <div class="contact-item">
        <i class="icon-phone"></i>
        <span>{{personal.phone}}</span>
      </div>
      <div class="contact-item">
        <i class="icon-location"></i>
        <span>{{personal.location}}</span>
      </div>
    </div>
    
    <div class="skills">
      <h2>Skills</h2>
      <ul class="skills-list">
        {{#each skills}}
        <li>
          <span class="skill-name">{{this}}</span>
          <div class="skill-bar"></div>
        </li>
        {{/each}}
      </ul>
    </div>
  </div>
  
  <div class="main-content">
    <section class="summary">
      <h2>About Me</h2>
      <p>{{personal.summary}}</p>
    </section>
    
    <section class="experience">
      <h2>Experience</h2>
      {{#each experience}}
      <div class="job">
        <div class="job-header">
          <h3>{{position}}</h3>
          <span class="date">{{startDate}} - {{endDate}}</span>
        </div>
        <p class="company">{{company}}</p>
        <p class="description">{{description}}</p>
      </div>
      {{/each}}
    </section>
    
    <section class="education">
      <h2>Education</h2>
      {{#each education}}
      <div class="school">
        <div class="school-header">
          <h3>{{school}}</h3>
          <span class="date">{{startDate}} - {{endDate}}</span>
        </div>
        <p>{{degree}} in {{field}}</p>
      </div>
      {{/each}}
    </section>
  </div>
</div>', 
'body {
  font-family: "Montserrat", sans-serif;
  line-height: 1.6;
  color: #333;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
}

.resume {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  background-color: white;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
}

.sidebar {
  width: 300px;
  background-color: #2c3e50;
  color: white;
  padding: 40px 30px;
}

.profile {
  text-align: center;
  margin-bottom: 40px;
}

.profile-img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin: 0 auto 20px;
  background-color: rgba(255, 255, 255, 0.1);
}

h1 {
  font-size: 24px;
  margin: 0 0 5px;
  font-weight: 600;
  line-height: 1.2;
}

.job-title {
  font-size: 16px;
  opacity: 0.8;
  margin: 0;
  font-weight: 300;
}

.contact, .skills {
  margin-bottom: 40px;
}

h2 {
  font-size: 18px;
  margin-bottom: 15px;
  position: relative;
  padding-bottom: 10px;
  font-weight: 500;
}

h2:after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 2px;
  background-color: #e74c3c;
}

.contact-item {
  margin-bottom: 10px;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.contact-item i {
  margin-right: 10px;
  font-size: 16px;
  color: #e74c3c;
}

.skills-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.skills-list li {
  margin-bottom: 15px;
}

.skill-name {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
}

.skill-bar {
  height: 5px;
  background-color: rgba(255, 255, 255, 0.2);
  position: relative;
}

.skill-bar:after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 80%;
  background-color: #e74c3c;
}

.main-content {
  flex: 1;
  padding: 40px;
}

section {
  margin-bottom: 40px;
}

.main-content h2 {
  color: #2c3e50;
  font-size: 22px;
  margin-bottom: 20px;
}

.main-content h2:after {
  background-color: #2c3e50;
}

.job, .school {
  margin-bottom: 25px;
}

.job-header, .school-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 5px;
}

h3 {
  font-size: 18px;
  margin: 0;
  color: #e74c3c;
  font-weight: 500;
}

.date {
  font-size: 14px;
  color: #7f8c8d;
}

.company {
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 5px;
  font-weight: 500;
}

.description {
  font-size: 14px;
}', 
TRUE);

-- Insert sample data for cover letter templates
INSERT INTO cover_letter_templates (name, description, category, html_content, css_content, is_premium)
VALUES 
('Professional', 'A formal template suitable for corporate positions', 'standard', 
'<div class="cover-letter">
  <div class="header">
    <div class="sender-info">
      <p>{{personal.firstName}} {{personal.lastName}}</p>
      <p>{{personal.email}}</p>
      <p>{{personal.phone}}</p>
      <p>{{personal.location}}</p>
    </div>
    <div class="date">
      <p>{{date}}</p>
    </div>
    <div class="recipient-info">
      <p>{{recipient.name}}</p>
      <p>{{recipient.title}}</p>
      <p>{{recipient.company}}</p>
      <p>{{recipient.address}}</p>
    </div>
  </div>
  
  <div class="content">
    <div class="salutation">
      <p>Dear {{recipient.name}},</p>
    </div>
    
    <div class="body">
      <p>{{opening}}</p>
      <p>{{body1}}</p>
      <p>{{body2}}</p>
      <p>{{closing}}</p>
    </div>
    
    <div class="signature">
      <p>Sincerely,</p>
      <p>{{personal.firstName}} {{personal.lastName}}</p>
    </div>
  </div>
</div>', 
'body {
  font-family: "Times New Roman", Times, serif;
  line-height: 1.5;
  color: #333;
  margin: 0;
  padding: 0;
}

.cover-letter {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
}

.header {
  margin-bottom: 40px;
}

.sender-info {
  margin-bottom: 20px;
}

.sender-info p, .recipient-info p, .date p {
  margin: 0;
  line-height: 1.5;
}

.date {
  margin-bottom: 20px;
}

.content {
  font-size: 12pt;
}

.salutation {
  margin-bottom: 20px;
}

.body p {
  margin-bottom: 15px;
  text-align: justify;
}

.signature {
  margin-top: 30px;
}

.signature p:first-child {
  margin-bottom: 30px;
}', 
FALSE),

('Modern', 'A contemporary design with a clean layout', 'creative', 
'<div class="cover-letter">
  <header>
    <h1>{{personal.firstName}} {{personal.lastName}}</h1>
    <p class="job-title">{{personal.jobTitle}}</p>
    <div class="contact-info">
      <span>{{personal.email}}</span>
      <span>{{personal.phone}}</span>
      <span>{{personal.location}}</span>
    </div>
  </header>
  
  <div class="letter-content">
    <div class="date-recipient">
      <p class="date">{{date}}</p>
      <div class="recipient">
        <p>{{recipient.name}}</p>
        <p>{{recipient.title}}</p>
        <p>{{recipient.company}}</p>
        <p>{{recipient.address}}</p>
      </div>
    </div>
    
    <div class="salutation">
      <p>Dear {{recipient.name}},</p>
    </div>
    
    <div class="body">
      <p>{{opening}}</p>
      <p>{{body1}}</p>
      <p>{{body2}}</p>
      <p>{{closing}}</p>
    </div>
    
    <div class="signature">
      <p>Sincerely,</p>
      <p>{{personal.firstName}} {{personal.lastName}}</p>
    </div>
  </div>
</div>', 
'body {
  font-family: "Roboto", Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  margin: 0;
  padding: 0;
  background-color: #f9f9f9;
}

.cover-letter {
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

header {
  background-color: #2c3e50;
  color: white;
  padding: 30px;
  text-align: center;
}

h1 {
  font-size: 28px;
  margin: 0 0 5px;
  font-weight: 300;
}

.job-title {
  font-size: 18px;
  opacity: 0.9;
  margin: 0 0 15px;
}

.contact-info {
  font-size: 14px;
}

.contact-info span {
  margin: 0 10px;
}

.letter-content {
  padding: 40px;
}

.date-recipient {
  margin-bottom: 30px;
}

.date {
  margin-bottom: 20px;
}

.recipient p {
  margin: 0;
  line-height: 1.5;
}

.salutation {
  margin-bottom: 20px;
}

.body p {
  margin-bottom: 15px;
  text-align: justify;
}

.signature {
  margin-top: 30px;
}

.signature p:first-child {
  margin-bottom: 30px;
}', 
FALSE),

('Creative', 'A bold design for creative industry positions', 'creative', 
'<div class="cover-letter">
  <div class="sidebar">
    <div class="profile">
      <h1>{{personal.firstName}}<br>{{personal.lastName}}</h1>
      <p class="job-title">{{personal.jobTitle}}</p>
    </div>
    
    <div class="contact">
      <h2>Contact</h2>
      <div class="contact-item">
        <i class="icon-email"></i>
        <span>{{personal.email}}</span>
      </div>
      <div class="contact-item">
        <i class="icon-phone"></i>
        <span>{{personal.phone}}</span>
      </div>
      <div class="contact-item">
        <i class="icon-location"></i>
        <span>{{personal.location}}</span>
      </div>
    </div>
  </div>
  
  <div class="main-content">
    <div class="letter-header">
      <div class="date">
        <p>{{date}}</p>
      </div>
      <div class="recipient">
        <p>{{recipient.name}}</p>
        <p>{{recipient.title}}</p>
        <p>{{recipient.company}}</p>
        <p>{{recipient.address}}</p>
      </div>
    </div>
    
    <div class="letter-body">
      <div class="salutation">
        <p>Dear {{recipient.name}},</p>
      </div>
      
      <div class="body">
        <p>{{opening}}</p>
        <p>{{body1}}</p>
        <p>{{body2}}</p>
        <p>{{closing}}</p>
      </div>
      
      <div class="signature">
        <p>Sincerely,</p>
        <p>{{personal.firstName}} {{personal.lastName}}</p>
      </div>
    </div>
  </div>
</div>', 
'body {
  font-family: "Montserrat", sans-serif;
  line-height: 1.6;
  color: #333;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
}

.cover-letter {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  background-color: white;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
}

.sidebar {
  width: 300px;
  background-color: #2c3e50;
  color: white;
  padding: 40px 30px;
}

.profile {
  text-align: center;
  margin-bottom: 40px;
}

h1 {
  font-size: 24px;
  margin: 0 0 5px;
  font-weight: 600;
  line-height: 1.2;
}

.job-title {
  font-size: 16px;
  opacity: 0.8;
  margin: 0;
  font-weight: 300;
}

.contact {
  margin-bottom: 40px;
}

h2 {
  font-size: 18px;
  margin-bottom: 15px;
  position: relative;
  padding-bottom: 10px;
  font-weight: 500;
}

h2:after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 2px;
  background-color: #e74c3c;
}

.contact-item {
  margin-bottom: 10px;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.contact-item i {
  margin-right: 10px;
  font-size: 16px;
  color: #e74c3c;
}

.main-content {
  flex: 1;
  padding: 40px;
}

.letter-header {
  margin-bottom: 30px;
}

.date {
  margin-bottom: 20px;
}

.recipient p {
  margin: 0;
  line-height: 1.5;
}

.letter-body {
  font-size: 14px;
}

.salutation {
  margin-bottom: 20px;
}

.body p {
  margin-bottom: 15px;
  text-align: justify;
}

.signature {
  margin-top: 30px;
}

.signature p:first-child {
  margin-bottom: 30px;
}', 
TRUE);

-- Insert sample data for admin user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES 
('00000000-0000-0000-0000-000000000000', 'admin@cvchap.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456789', NOW(), '{"full_name": "Admin User"}');

INSERT INTO profiles (id, full_name, email, is_admin, subscription_tier)
VALUES 
('00000000-0000-0000-0000-000000000000', 'Admin User', 'admin@cvchap.com', TRUE, 'professional');

