-- ============================================
-- NOT YET, DUDE — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'parked' CHECK (status IN ('parked', 'building', 'snoozed', 'killed')),
  parked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  remind_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  snooze_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ideas_email ON ideas(email);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_remind_at ON ideas(remind_at);
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- Policies: Allow public insert (no auth required for MVP)
CREATE POLICY "Allow public insert on users"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public select on users"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on ideas"
  ON ideas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public select on ideas"
  ON ideas FOR SELECT
  USING (true);

CREATE POLICY "Allow public update on ideas"
  ON ideas FOR UPDATE
  USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ideas_updated_at
  BEFORE UPDATE ON ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- OPTIONAL: Increment snooze_count function
-- Call via supabase.rpc('increment_snooze', { idea_id: '...' })
-- ============================================
CREATE OR REPLACE FUNCTION increment_snooze(idea_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE ideas
  SET
    snooze_count = snooze_count + 1,
    status = 'snoozed',
    remind_at = NOW() + INTERVAL '90 days',
    updated_at = NOW()
  WHERE id = idea_id;
END;
$$ LANGUAGE plpgsql;
