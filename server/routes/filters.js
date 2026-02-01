/**
 * Filters API Routes
 * Provides filter options for the search page
 */

import { Router } from 'express';
import getDatabase from '../db/connection.js';

const router = Router();

/**
 * GET /api/filters
 * Get all filter options
 */
router.get('/', (req, res) => {
  try {
    const db = getDatabase();

    // Get locations with restaurant counts
    const locations = db.prepare(`
      SELECT l.id, l.name, l.state, COUNT(r.id) as restaurantCount
      FROM locations l
      LEFT JOIN restaurants r ON l.id = r.location_id AND r.is_active = 1
      GROUP BY l.id
      HAVING restaurantCount > 0
      ORDER BY restaurantCount DESC, l.name
    `).all();

    // Get cuisines with restaurant counts
    const cuisines = db.prepare(`
      SELECT c.id, c.name, c.icon, COUNT(r.id) as restaurantCount
      FROM cuisines c
      LEFT JOIN restaurants r ON c.id = r.cuisine_id AND r.is_active = 1
      GROUP BY c.id
      HAVING restaurantCount > 0
      ORDER BY restaurantCount DESC, c.name
    `).all();

    // Get features with restaurant counts
    const features = db.prepare(`
      SELECT f.id, f.key, f.label, f.icon, f.description, COUNT(rf.restaurant_id) as restaurantCount
      FROM features f
      LEFT JOIN restaurant_features rf ON f.id = rf.feature_id
      LEFT JOIN restaurants r ON rf.restaurant_id = r.id AND r.is_active = 1
      GROUP BY f.id
      HAVING restaurantCount > 0
      ORDER BY restaurantCount DESC, f.label
    `).all();

    // Get age ranges with restaurant counts
    const ageRanges = db.prepare(`
      SELECT ar.id, ar.key, ar.label, ar.min_age as minAge, ar.max_age as maxAge, COUNT(rar.restaurant_id) as restaurantCount
      FROM age_ranges ar
      LEFT JOIN restaurant_age_ranges rar ON ar.id = rar.age_range_id
      LEFT JOIN restaurants r ON rar.restaurant_id = r.id AND r.is_active = 1
      GROUP BY ar.id
      HAVING restaurantCount > 0
      ORDER BY ar.min_age
    `).all();

    // Get category types
    const categoryTypes = db.prepare(`
      SELECT id, key, label, icon, description
      FROM category_types
      ORDER BY label
    `).all();

    // Get price ranges with counts
    const priceRanges = db.prepare(`
      SELECT price_range as priceRange, COUNT(*) as restaurantCount
      FROM restaurants
      WHERE is_active = 1
      GROUP BY price_range
      ORDER BY LENGTH(price_range)
    `).all();

    // Get noise levels with counts
    const noiseLevels = db.prepare(`
      SELECT noise_level as noiseLevel, COUNT(*) as restaurantCount
      FROM restaurants
      WHERE is_active = 1 AND noise_level IS NOT NULL
      GROUP BY noise_level
    `).all();

    res.json({
      data: {
        locations,
        cuisines,
        features,
        ageRanges,
        categoryTypes,
        priceRanges,
        noiseLevels
      }
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/filters/locations
 * Get all locations
 */
router.get('/locations', (req, res) => {
  try {
    const db = getDatabase();
    const locations = db.prepare(`
      SELECT l.id, l.name, l.state, COUNT(r.id) as restaurantCount
      FROM locations l
      LEFT JOIN restaurants r ON l.id = r.location_id AND r.is_active = 1
      GROUP BY l.id
      ORDER BY l.name
    `).all();

    res.json({ data: locations });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/filters/cuisines
 * Get all cuisines
 */
router.get('/cuisines', (req, res) => {
  try {
    const db = getDatabase();
    const cuisines = db.prepare(`
      SELECT c.id, c.name, c.icon, COUNT(r.id) as restaurantCount
      FROM cuisines c
      LEFT JOIN restaurants r ON c.id = r.cuisine_id AND r.is_active = 1
      GROUP BY c.id
      ORDER BY c.name
    `).all();

    res.json({ data: cuisines });
  } catch (error) {
    console.error('Error fetching cuisines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/filters/features
 * Get all features
 */
router.get('/features', (req, res) => {
  try {
    const db = getDatabase();
    const features = db.prepare(`
      SELECT f.id, f.key, f.label, f.icon, f.description, COUNT(rf.restaurant_id) as restaurantCount
      FROM features f
      LEFT JOIN restaurant_features rf ON f.id = rf.feature_id
      LEFT JOIN restaurants r ON rf.restaurant_id = r.id AND r.is_active = 1
      GROUP BY f.id
      ORDER BY f.label
    `).all();

    res.json({ data: features });
  } catch (error) {
    console.error('Error fetching features:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
