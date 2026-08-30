-- ============================================================
-- ReviewFlow AI - Database Schema
-- Version: 1.0.0
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles table (linked to Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Businesses table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  google_review_url TEXT,
  review_threshold INTEGER NOT NULL DEFAULT 5 CHECK (review_threshold >= 1 AND review_threshold <= 5),
  welcome_message TEXT DEFAULT 'How was your shopping experience today?',
  notification_email TEXT,
  primary_color TEXT DEFAULT '#4F46E5',
  ai_review_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  feedback TEXT,
  customer_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'resolved')),
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Review Tags table
CREATE TABLE review_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('positive', 'negative')),
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Review Tag Mapping (M2M)
CREATE TABLE review_tag_mapping (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES review_tags(id) ON DELETE CASCADE,
  UNIQUE(review_id, tag_id)
);

-- Admin Notes
CREATE TABLE admin_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_owner ON businesses(owner_id);
CREATE INDEX idx_reviews_business ON reviews(business_id);
CREATE INDEX idx_reviews_business_created ON reviews(business_id, created_at DESC);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_review_tag_mapping_review ON review_tag_mapping(review_id);
CREATE INDEX idx_review_tag_mapping_tag ON review_tag_mapping(tag_id);
CREATE INDEX idx_admin_notes_review ON admin_notes(review_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_tag_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Businesses policies
CREATE POLICY "Public can view businesses by slug"
  ON businesses FOR SELECT
  USING (true);

CREATE POLICY "Owners can insert businesses"
  ON businesses FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own businesses"
  ON businesses FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own businesses"
  ON businesses FOR DELETE
  USING (auth.uid() = owner_id);

-- Reviews policies
CREATE POLICY "Public can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Business owners can view their reviews"
  ON reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = reviews.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Public can view reviews for submission confirmation"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Business owners can update their reviews"
  ON reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = reviews.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- Review Tags policies
CREATE POLICY "Anyone can view tags"
  ON review_tags FOR SELECT
  USING (true);

-- Review Tag Mapping policies
CREATE POLICY "Public can insert tag mappings"
  ON review_tag_mapping FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view tag mappings"
  ON review_tag_mapping FOR SELECT
  USING (true);

-- Admin Notes policies
CREATE POLICY "Business owners can insert notes"
  ON admin_notes FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Business owners can view notes on their reviews"
  ON admin_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reviews
      JOIN businesses ON businesses.id = reviews.business_id
      WHERE reviews.id = admin_notes.review_id
      AND businesses.owner_id = auth.uid()
    )
  );
