-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in correct order due to dependencies)
DROP VIEW IF EXISTS state_votes CASCADE;
DROP VIEW IF EXISTS age_votes CASCADE;
DROP VIEW IF EXISTS gender_votes CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS voting_options CASCADE;
DROP TABLE IF EXISTS admin_messages CASCADE;

-- Create voting_options table first (referenced by votes)
CREATE TABLE voting_options (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    label TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    active BOOLEAN DEFAULT true
);

-- Create votes table with proper foreign key reference and demographic data
CREATE TABLE votes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    option_id BIGINT REFERENCES voting_options(id) ON DELETE CASCADE,
    state TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    age_range TEXT NOT NULL,
    gender TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT votes_age_range_check CHECK (
        age_range IN ('18-24', '25-34', '35-44', '45-54', '55-64', '65+')
    ),
    CONSTRAINT votes_gender_check CHECK (
        gender IN ('Male', 'Female', 'Other')
    )
);

-- Create admin_messages table
CREATE TABLE admin_messages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create view for state vote statistics
CREATE OR REPLACE VIEW state_votes AS
SELECT 
    v.state,
    vo.label,
    vo.color,
    COUNT(*) as vote_count
FROM votes v
JOIN voting_options vo ON v.option_id = vo.id
GROUP BY v.state, vo.label, vo.color
ORDER BY v.state;

-- Create view for age vote statistics
CREATE OR REPLACE VIEW age_votes AS
SELECT 
    v.age_range,
    vo.label,
    vo.color,
    COUNT(*) as vote_count
FROM votes v
JOIN voting_options vo ON v.option_id = vo.id
GROUP BY v.age_range, vo.label, vo.color
ORDER BY v.age_range;

-- Create view for gender vote statistics
CREATE OR REPLACE VIEW gender_votes AS
SELECT 
    v.gender,
    vo.label,
    vo.color,
    COUNT(*) as vote_count
FROM votes v
JOIN voting_options vo ON v.option_id = vo.id
GROUP BY v.gender, vo.label, vo.color
ORDER BY v.gender;

-- Enable Row Level Security
ALTER TABLE voting_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;

-- Policies for voting_options
CREATE POLICY "Public can view voting options"
  ON voting_options FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Only authenticated users can modify voting options"
  ON voting_options FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for votes
CREATE POLICY "Public can view votes"
  ON votes FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Anyone can insert votes"
  ON votes FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can delete votes"
  ON votes FOR DELETE
  TO authenticated
  USING (true);

-- Policies for admin_messages
CREATE POLICY "Public can view admin messages"
  ON admin_messages FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Only authenticated users can modify admin messages"
  ON admin_messages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant appropriate permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT ON votes TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT DELETE ON votes TO authenticated;

-- Insert initial voting options
INSERT INTO voting_options (label, color) VALUES
('Green Team', '#22c55e'),
('Blue Team', '#3b82f6');

-- Insert initial admin message
INSERT INTO admin_messages (message) VALUES
('Welcome to This or That! Choose your team below:');