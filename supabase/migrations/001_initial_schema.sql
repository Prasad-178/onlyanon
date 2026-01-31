-- OnlyAnon Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Creators table (verified via Twitter/Privy)
CREATE TABLE creators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    privy_did TEXT UNIQUE NOT NULL,
    twitter_id TEXT UNIQUE,
    twitter_username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    wallet_address TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for username lookups
CREATE INDEX idx_creators_twitter_username ON creators(twitter_username);
CREATE INDEX idx_creators_privy_did ON creators(privy_did);

-- Offerings table (creator's Q&A products)
CREATE TABLE offerings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    slug TEXT NOT NULL,
    price DECIMAL(18, 9) NOT NULL CHECK (price > 0),
    token TEXT NOT NULL DEFAULT 'SOL' CHECK (token IN ('SOL', 'USDC')),
    is_active BOOLEAN DEFAULT true,
    question_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_creator_slug UNIQUE (creator_id, slug)
);

-- Index for creator offerings
CREATE INDEX idx_offerings_creator_id ON offerings(creator_id);
CREATE INDEX idx_offerings_creator_active ON offerings(creator_id, is_active) WHERE is_active = true;

-- Questions table (NO fan data stored - only access code links to question)
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offering_id UUID NOT NULL REFERENCES offerings(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    access_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'replied', 'archived')),
    payment_signature TEXT,
    payment_amount DECIMAL(18, 9) NOT NULL,
    payment_token TEXT NOT NULL CHECK (payment_token IN ('SOL', 'USDC')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for access code lookups (fan checking replies)
CREATE INDEX idx_questions_access_code ON questions(access_code);
CREATE INDEX idx_questions_offering_status ON questions(offering_id, status, created_at DESC);

-- Replies table (creator responses)
CREATE TABLE replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID UNIQUE NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    reply_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_creators_updated_at
BEFORE UPDATE ON creators
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_offerings_updated_at
BEFORE UPDATE ON offerings
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_questions_updated_at
BEFORE UPDATE ON questions
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger to increment offering question count
CREATE OR REPLACE FUNCTION increment_question_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE offerings SET question_count = question_count + 1 WHERE id = NEW.offering_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_question_count
AFTER INSERT ON questions
FOR EACH ROW EXECUTE FUNCTION increment_question_count();

-- Row Level Security (RLS) - Enable on all tables
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Creators: Public read, authenticated write for own data
CREATE POLICY "Public can view active creators"
    ON creators FOR SELECT
    USING (is_active = true);

CREATE POLICY "Service role can manage creators"
    ON creators FOR ALL
    USING (true)
    WITH CHECK (true);

-- Offerings: Public read for active, service role full access
CREATE POLICY "Public can view active offerings"
    ON offerings FOR SELECT
    USING (is_active = true);

CREATE POLICY "Service role can manage offerings"
    ON offerings FOR ALL
    USING (true)
    WITH CHECK (true);

-- Questions: Service role full access
CREATE POLICY "Service role can manage questions"
    ON questions FOR ALL
    USING (true)
    WITH CHECK (true);

-- Replies: Service role full access
CREATE POLICY "Service role can manage replies"
    ON replies FOR ALL
    USING (true)
    WITH CHECK (true);
