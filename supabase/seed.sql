-- ============================================================
-- ReviewFlow AI - Seed Data
-- ============================================================

-- Insert positive review tags
INSERT INTO review_tags (name, type, sort_order) VALUES
  ('Great Collection', 'positive', 1),
  ('Friendly Staff', 'positive', 2),
  ('Excellent Service', 'positive', 3),
  ('Affordable Prices', 'positive', 4),
  ('Premium Quality', 'positive', 5),
  ('Fast Billing', 'positive', 6),
  ('Nice Store', 'positive', 7),
  ('Good Variety', 'positive', 8),
  ('Helpful Staff', 'positive', 9),
  ('Highly Recommended', 'positive', 10);

-- Insert negative review tags
INSERT INTO review_tags (name, type, sort_order) VALUES
  ('Staff Behaviour', 'negative', 1),
  ('Collection', 'negative', 2),
  ('Billing', 'negative', 3),
  ('Product Quality', 'negative', 4),
  ('Availability', 'negative', 5),
  ('Price', 'negative', 6),
  ('Trial Room', 'negative', 7),
  ('Waiting Time', 'negative', 8),
  ('Parking', 'negative', 9),
  ('Other', 'negative', 10);

-- Note: Business and review seed data should be created after
-- a user account is set up, since businesses require an owner_id.
-- Use the admin signup flow to create your first business.
