/**
 * Stats API Routes
 * Provides statistics for the homepage and admin dashboard
 */

import { Router } from 'express';
import getDatabase from '../db/connection.js';

const router = Router();

/**
 * GET /api/stats
 * Get general statistics
 */
router.get('/', (req, res) => {
  try {
    const db = getDatabase();

    const stats = {
      restaurants: db.prepare('SELECT COUNT(*) as count FROM restaurants WHERE is_active = 1').get().count,
      reviews: db.prepare('SELECT COUNT(*) as count FROM reviews WHERE is_approved = 1').get().count,
      locations: db.prepare(`
        SELECT COUNT(DISTINCT l.id) as count
        FROM locations l
        JOIN restaurants r ON l.id = r.location_id AND r.is_active = 1
      `).get().count,
      featuredRestaurants: db.prepare('SELECT COUNT(*) as count FROM restaurants WHERE is_active = 1 AND featured = 1').get().count,
      averageRating: db.prepare('SELECT AVG(rating) as avg FROM restaurants WHERE is_active = 1').get().avg || 0,
      totalReviewCount: db.prepare('SELECT SUM(review_count) as total FROM restaurants WHERE is_active = 1').get().total || 0,
      subscribers: db.prepare('SELECT COUNT(*) as count FROM newsletter_subscribers WHERE is_active = 1').get().count
    };

    // Top rated restaurants
    const topRated = db.prepare(`
      SELECT r.name, r.slug, r.rating, l.name as location
      FROM restaurants r
      JOIN locations l ON r.location_id = l.id
      WHERE r.is_active = 1
      ORDER BY r.rating DESC
      LIMIT 5
    `).all();

    // Most reviewed restaurants
    const mostReviewed = db.prepare(`
      SELECT r.name, r.slug, r.review_count as reviewCount, l.name as location
      FROM restaurants r
      JOIN locations l ON r.location_id = l.id
      WHERE r.is_active = 1
      ORDER BY r.review_count DESC
      LIMIT 5
    `).all();

    // Cuisine distribution
    const cuisineDistribution = db.prepare(`
      SELECT c.name, c.icon, COUNT(r.id) as count
      FROM cuisines c
      LEFT JOIN restaurants r ON c.id = r.cuisine_id AND r.is_active = 1
      GROUP BY c.id
      HAVING count > 0
      ORDER BY count DESC
    `).all();

    // Location distribution
    const locationDistribution = db.prepare(`
      SELECT l.name, COUNT(r.id) as count
      FROM locations l
      LEFT JOIN restaurants r ON l.id = r.location_id AND r.is_active = 1
      GROUP BY l.id
      HAVING count > 0
      ORDER BY count DESC
    `).all();

    res.json({
      data: {
        stats,
        topRated,
        mostReviewed,
        cuisineDistribution,
        locationDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/stats/homepage
 * Get statistics for homepage display
 */
router.get('/homepage', (req, res) => {
  try {
    const db = getDatabase();

    const stats = {
      restaurantCount: db.prepare('SELECT COUNT(*) as count FROM restaurants WHERE is_active = 1').get().count,
      locationCount: db.prepare(`
        SELECT COUNT(DISTINCT l.id) as count
        FROM locations l
        JOIN restaurants r ON l.id = r.location_id AND r.is_active = 1
      `).get().count,
      reviewCount: db.prepare('SELECT SUM(review_count) as total FROM restaurants WHERE is_active = 1').get().total || 0,
      happyFamilies: Math.floor((db.prepare('SELECT SUM(review_count) as total FROM restaurants WHERE is_active = 1').get().total || 0) * 2.5)
    };

    res.json({ data: stats });
  } catch (error) {
    console.error('Error fetching homepage stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
