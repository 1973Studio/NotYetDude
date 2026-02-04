-- =============================================
-- NOTYETDUDE.COM - Supabase Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Index for email lookups
CREATE INDEX idx_users_email ON users(email);

-- =============================================
-- IDEAS TABLE
-- =============================================
CREATE TYPE idea_status AS ENUM ('parked', 'snoozed', 'building', 'killed');

CREATE TABLE ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status idea_status DEFAULT 'parked',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    remind_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days'),
    snooze_count INTEGER DEFAULT 0,
    resolved_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_ideas_user_id ON ideas(user_id);
CREATE INDEX idx_ideas_status ON ideas(status);
CREATE INDEX idx_ideas_remind_at ON ideas(remind_at);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Ideas policies
CREATE POLICY "Users can view own ideas" ON ideas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ideas" ON ideas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ideas" ON ideas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ideas" ON ideas
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_ideas_updated_at
    BEFORE UPDATE ON ideas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to get ideas due for reminder (for scheduled job)
CREATE OR REPLACE FUNCTION get_ideas_due_for_reminder()
RETURNS TABLE (
    idea_id UUID,
    idea_title TEXT,
    idea_description TEXT,
    user_email TEXT,
    snooze_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.title,
        i.description,
        u.email,
        i.snooze_count
    FROM ideas i
    JOIN users u ON i.user_id = u.id
    WHERE i.status IN ('parked', 'snoozed')
    AND i.remind_at::date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to snooze an idea (adds 90 days)
CREATE OR REPLACE FUNCTION snooze_idea(idea_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE ideas
    SET 
        status = 'snoozed',
        remind_at = NOW() + INTERVAL '90 days',
        snooze_count = snooze_count + 1
    WHERE id = idea_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark idea as building
CREATE OR REPLACE FUNCTION build_idea(idea_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE ideas
    SET 
        status = 'building',
        resolved_at = NOW()
    WHERE id = idea_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to kill an idea
CREATE OR REPLACE FUNCTION kill_idea(idea_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE ideas
    SET 
        status = 'killed',
        resolved_at = NOW()
    WHERE id = idea_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- NOTES
-- =============================================
-- 
-- After running this schema, you'll need to:
-- 
-- 1. Set up Supabase Auth with Magic Link enabled
--    - Go to Authentication > Providers > Email
--    - Enable "Email" provider
--    - Enable "Confirm email" for magic links
-- 
-- 2. Create a scheduled Edge Function for daily reminders
--    - Use the get_ideas_due_for_reminder() function
--    - Send emails via Resend or Supabase's email
-- 
-- 3. Update the site_url in Supabase Auth settings
--    - Set to https://notyetdude.com
-- 
