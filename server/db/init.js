/**
 * Database Initialization Script
 * Creates all tables for the Bay Area Family Eats database
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'familyeats.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('Initializing database...\n');

// Drop existing tables (in reverse order due to foreign keys)
const dropTables = `
DROP TABLE IF EXISTS review_photos;
DROP TABLE IF EXISTS review_category_ratings;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS restaurant_hours;
DROP TABLE IF EXISTS restaurant_features;
DROP TABLE IF EXISTS restaurant_age_ranges;
DROP TABLE IF EXISTS restaurant_images;
DROP TABLE IF EXISTS restaurant_category_ratings;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS cuisines;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS features;
DROP TABLE IF EXISTS age_ranges;
DROP TABLE IF EXISTS category_types;
DROP TABLE IF EXISTS contact_submissions;
DROP TABLE IF EXISTS newsletter_subscribers;
`;

// Execute drop statements one by one
dropTables.split(';').filter(stmt => stmt.trim()).forEach(stmt => {
  db.exec(stmt);
});

console.log('Dropped existing tables');

// Create tables
db.exec(`
-- Lookup table for locations/cities
CREATE TABLE locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  state TEXT DEFAULT 'CA',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Lookup table for cuisines
CREATE TABLE cuisines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Lookup table for features
CREATE TABLE features (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Lookup table for age ranges
CREATE TABLE age_ranges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  min_age INTEGER,
  max_age INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Lookup table for category rating types
CREATE TABLE category_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  initials TEXT,
  password_hash TEXT,
  avatar_url TEXT,
  is_verified INTEGER DEFAULT 0,
  is_admin INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Main restaurants table
CREATE TABLE restaurants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  location_id INTEGER NOT NULL,
  neighborhood TEXT,
  cuisine_id INTEGER NOT NULL,
  price_range TEXT CHECK(price_range IN ('$', '$$', '$$$', '$$$$')),
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  featured INTEGER DEFAULT 0,
  premium INTEGER DEFAULT 0,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  reservation_link TEXT,
  latitude REAL,
  longitude REAL,
  noise_level TEXT CHECK(noise_level IN ('quiet', 'moderate', 'lively')),
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id),
  FOREIGN KEY (cuisine_id) REFERENCES cuisines(id)
);

-- Restaurant images
CREATE TABLE restaurant_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_primary INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Restaurant features (many-to-many)
CREATE TABLE restaurant_features (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  feature_id INTEGER NOT NULL,
  value INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(restaurant_id, feature_id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (feature_id) REFERENCES features(id)
);

-- Restaurant age ranges (many-to-many)
CREATE TABLE restaurant_age_ranges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  age_range_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(restaurant_id, age_range_id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (age_range_id) REFERENCES age_ranges(id)
);

-- Restaurant operating hours
CREATE TABLE restaurant_hours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL CHECK(day_of_week >= 0 AND day_of_week <= 6),
  open_time TEXT,
  close_time TEXT,
  is_closed INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(restaurant_id, day_of_week),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Restaurant category ratings (aggregate scores)
CREATE TABLE restaurant_category_ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  rating REAL NOT NULL CHECK(rating >= 0 AND rating <= 5),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(restaurant_id, category_id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES category_types(id)
);

-- Reviews table
CREATE TABLE reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  user_id INTEGER,
  user_name TEXT NOT NULL,
  user_initials TEXT,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  title TEXT,
  text TEXT NOT NULL,
  highlight TEXT,
  visit_date DATE,
  is_verified INTEGER DEFAULT 0,
  is_approved INTEGER DEFAULT 1,
  helpful_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Review category ratings (individual review scores)
CREATE TABLE review_category_ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  review_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(review_id, category_id),
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES category_types(id)
);

-- Review photos
CREATE TABLE review_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  review_id INTEGER NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);

-- Contact form submissions
CREATE TABLE contact_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  is_replied INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Newsletter subscribers
CREATE TABLE newsletter_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  is_active INTEGER DEFAULT 1,
  subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at DATETIME
);

-- Create indexes for better query performance
CREATE INDEX idx_restaurants_location ON restaurants(location_id);
CREATE INDEX idx_restaurants_cuisine ON restaurants(cuisine_id);
CREATE INDEX idx_restaurants_rating ON restaurants(rating DESC);
CREATE INDEX idx_restaurants_featured ON restaurants(featured);
CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);
CREATE INDEX idx_restaurant_features_restaurant ON restaurant_features(restaurant_id);
CREATE INDEX idx_restaurant_hours_restaurant ON restaurant_hours(restaurant_id);
`);

console.log('Created all tables');

// Create triggers for updated_at
db.exec(`
CREATE TRIGGER update_restaurants_timestamp
AFTER UPDATE ON restaurants
BEGIN
  UPDATE restaurants SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_users_timestamp
AFTER UPDATE ON users
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_reviews_timestamp
AFTER UPDATE ON reviews
BEGIN
  UPDATE reviews SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
`);

console.log('Created triggers');

db.close();

console.log('\nDatabase initialized successfully!');
console.log(`Database file: ${dbPath}`);
