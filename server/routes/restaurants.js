/**
 * Restaurant API Routes
 * Handles all restaurant-related endpoints
 */

import { Router } from 'express';
import { query, param, validationResult } from 'express-validator';
import getDatabase from '../db/connection.js';

const router = Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * GET /api/restaurants
 * Get all restaurants with optional filtering
 */
router.get('/',
  [
    query('location').optional().isString().trim(),
    query('cuisine').optional().isString().trim(),
    query('priceRange').optional().isIn(['$', '$$', '$$$', '$$$$']),
    query('features').optional().isString(),
    query('ageRange').optional().isString(),
    query('minRating').optional().isFloat({ min: 0, max: 5 }),
    query('featured').optional().isIn(['true', 'false']),
    query('sort').optional().isIn(['rating', 'reviewCount', 'name', 'newest']),
    query('order').optional().isIn(['asc', 'desc']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  validate,
  (req, res) => {
    try {
      const db = getDatabase();
      const {
        location,
        cuisine,
        priceRange,
        features,
        ageRange,
        minRating,
        featured,
        sort = 'rating',
        order = 'desc',
        limit = 50,
        offset = 0
      } = req.query;

      let sql = `
        SELECT DISTINCT
          r.id,
          r.name,
          r.slug,
          l.name as location,
          r.neighborhood,
          c.name as cuisine,
          c.icon as cuisineIcon,
          r.price_range as priceRange,
          r.rating,
          r.review_count as reviewCount,
          r.featured,
          r.premium,
          r.description,
          r.address,
          r.phone,
          r.website,
          r.reservation_link as reservationLink,
          r.latitude,
          r.longitude,
          r.noise_level as noiseLevel,
          r.created_at as createdAt
        FROM restaurants r
        JOIN locations l ON r.location_id = l.id
        JOIN cuisines c ON r.cuisine_id = c.id
      `;

      const conditions = ['r.is_active = 1'];
      const params = [];

      // Apply filters
      if (location) {
        conditions.push('l.name = ?');
        params.push(location);
      }

      if (cuisine) {
        conditions.push('c.name = ?');
        params.push(cuisine);
      }

      if (priceRange) {
        conditions.push('r.price_range = ?');
        params.push(priceRange);
      }

      if (minRating) {
        conditions.push('r.rating >= ?');
        params.push(parseFloat(minRating));
      }

      if (featured === 'true') {
        conditions.push('r.featured = 1');
      }

      if (features) {
        const featureList = features.split(',');
        featureList.forEach((feature, idx) => {
          sql += `
            JOIN restaurant_features rf${idx} ON r.id = rf${idx}.restaurant_id
            JOIN features f${idx} ON rf${idx}.feature_id = f${idx}.id AND f${idx}.key = ?
          `;
          params.unshift(feature.trim());
        });
      }

      if (ageRange) {
        const ageList = ageRange.split(',');
        sql += `
          JOIN restaurant_age_ranges rar ON r.id = rar.restaurant_id
          JOIN age_ranges ar ON rar.age_range_id = ar.id AND ar.key IN (${ageList.map(() => '?').join(',')})
        `;
        params.push(...ageList.map(a => a.trim()));
      }

      sql += ` WHERE ${conditions.join(' AND ')}`;

      // Sorting
      const sortMap = {
        rating: 'r.rating',
        reviewCount: 'r.review_count',
        name: 'r.name',
        newest: 'r.created_at'
      };
      const sortColumn = sortMap[sort] || 'r.rating';
      const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
      sql += ` ORDER BY ${sortColumn} ${sortOrder}`;

      // Pagination
      sql += ` LIMIT ? OFFSET ?`;
      params.push(parseInt(limit), parseInt(offset));

      const restaurants = db.prepare(sql).all(...params);

      // Get additional data for each restaurant
      const getImages = db.prepare('SELECT url, alt_text, is_primary FROM restaurant_images WHERE restaurant_id = ? ORDER BY sort_order');
      const getFeatures = db.prepare(`
        SELECT f.key, f.label, f.icon
        FROM restaurant_features rf
        JOIN features f ON rf.feature_id = f.id
        WHERE rf.restaurant_id = ?
      `);
      const getAgeRanges = db.prepare(`
        SELECT ar.key, ar.label
        FROM restaurant_age_ranges rar
        JOIN age_ranges ar ON rar.age_range_id = ar.id
        WHERE rar.restaurant_id = ?
      `);
      const getCategoryRatings = db.prepare(`
        SELECT ct.key, ct.label, ct.icon, rcr.rating
        FROM restaurant_category_ratings rcr
        JOIN category_types ct ON rcr.category_id = ct.id
        WHERE rcr.restaurant_id = ?
      `);

      const enrichedRestaurants = restaurants.map(r => ({
        ...r,
        featured: !!r.featured,
        premium: !!r.premium,
        images: getImages.all(r.id).map(img => ({ url: img.url, altText: img.alt_text, isPrimary: !!img.is_primary })),
        features: getFeatures.all(r.id).reduce((acc, f) => ({ ...acc, [f.key]: { label: f.label, icon: f.icon } }), {}),
        ageRanges: getAgeRanges.all(r.id).map(a => ({ key: a.key, label: a.label })),
        categoryRatings: getCategoryRatings.all(r.id).reduce((acc, c) => ({ ...acc, [c.key]: { rating: c.rating, label: c.label, icon: c.icon } }), {})
      }));

      // Get total count for pagination
      let countSql = `
        SELECT COUNT(DISTINCT r.id) as total
        FROM restaurants r
        JOIN locations l ON r.location_id = l.id
        JOIN cuisines c ON r.cuisine_id = c.id
      `;

      if (features) {
        const featureList = features.split(',');
        featureList.forEach((feature, idx) => {
          countSql += `
            JOIN restaurant_features rf${idx} ON r.id = rf${idx}.restaurant_id
            JOIN features f${idx} ON rf${idx}.feature_id = f${idx}.id AND f${idx}.key = ?
          `;
        });
      }

      if (ageRange) {
        countSql += `
          JOIN restaurant_age_ranges rar ON r.id = rar.restaurant_id
          JOIN age_ranges ar ON rar.age_range_id = ar.id AND ar.key IN (${ageRange.split(',').map(() => '?').join(',')})
        `;
      }

      countSql += ` WHERE ${conditions.join(' AND ')}`;
      const countParams = params.slice(0, -2); // Remove limit and offset
      const { total } = db.prepare(countSql).get(...countParams);

      res.json({
        data: enrichedRestaurants,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + enrichedRestaurants.length < total
        }
      });
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /api/restaurants/featured
 * Get featured restaurants
 */
router.get('/featured', (req, res) => {
  try {
    const db = getDatabase();
    const limit = parseInt(req.query.limit) || 6;

    const restaurants = db.prepare(`
      SELECT
        r.id, r.name, r.slug, l.name as location, r.neighborhood,
        c.name as cuisine, c.icon as cuisineIcon, r.price_range as priceRange,
        r.rating, r.review_count as reviewCount, r.featured, r.premium,
        r.description
      FROM restaurants r
      JOIN locations l ON r.location_id = l.id
      JOIN cuisines c ON r.cuisine_id = c.id
      WHERE r.is_active = 1 AND r.featured = 1
      ORDER BY r.rating DESC
      LIMIT ?
    `).all(limit);

    const getImages = db.prepare('SELECT url FROM restaurant_images WHERE restaurant_id = ? ORDER BY sort_order LIMIT 1');
    const getFeatures = db.prepare(`
      SELECT f.key, f.label, f.icon
      FROM restaurant_features rf
      JOIN features f ON rf.feature_id = f.id
      WHERE rf.restaurant_id = ?
    `);

    const enriched = restaurants.map(r => ({
      ...r,
      featured: !!r.featured,
      premium: !!r.premium,
      image: getImages.get(r.id)?.url || null,
      features: getFeatures.all(r.id).reduce((acc, f) => ({ ...acc, [f.key]: { label: f.label, icon: f.icon } }), {})
    }));

    res.json({ data: enriched });
  } catch (error) {
    console.error('Error fetching featured restaurants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/restaurants/:slug
 * Get a single restaurant by slug
 */
router.get('/:slug',
  [param('slug').isString().trim().notEmpty()],
  validate,
  (req, res) => {
    try {
      const db = getDatabase();
      const { slug } = req.params;

      const restaurant = db.prepare(`
        SELECT
          r.id, r.name, r.slug, l.name as location, r.neighborhood,
          c.name as cuisine, c.icon as cuisineIcon, r.price_range as priceRange,
          r.rating, r.review_count as reviewCount, r.featured, r.premium,
          r.description, r.address, r.phone, r.email, r.website,
          r.reservation_link as reservationLink, r.latitude, r.longitude,
          r.noise_level as noiseLevel, r.created_at as createdAt
        FROM restaurants r
        JOIN locations l ON r.location_id = l.id
        JOIN cuisines c ON r.cuisine_id = c.id
        WHERE r.slug = ? AND r.is_active = 1
      `).get(slug);

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      // Get related data
      const images = db.prepare('SELECT url, alt_text as altText, is_primary as isPrimary FROM restaurant_images WHERE restaurant_id = ? ORDER BY sort_order').all(restaurant.id);
      const features = db.prepare(`
        SELECT f.key, f.label, f.icon, f.description
        FROM restaurant_features rf
        JOIN features f ON rf.feature_id = f.id
        WHERE rf.restaurant_id = ?
      `).all(restaurant.id);
      const ageRanges = db.prepare(`
        SELECT ar.key, ar.label, ar.min_age as minAge, ar.max_age as maxAge
        FROM restaurant_age_ranges rar
        JOIN age_ranges ar ON rar.age_range_id = ar.id
        WHERE rar.restaurant_id = ?
      `).all(restaurant.id);
      const hours = db.prepare(`
        SELECT day_of_week as dayOfWeek, open_time as openTime, close_time as closeTime, is_closed as isClosed
        FROM restaurant_hours
        WHERE restaurant_id = ?
        ORDER BY day_of_week
      `).all(restaurant.id);
      const categoryRatings = db.prepare(`
        SELECT ct.key, ct.label, ct.icon, ct.description, rcr.rating
        FROM restaurant_category_ratings rcr
        JOIN category_types ct ON rcr.category_id = ct.id
        WHERE rcr.restaurant_id = ?
      `).all(restaurant.id);

      const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

      res.json({
        data: {
          ...restaurant,
          featured: !!restaurant.featured,
          premium: !!restaurant.premium,
          images: images.map(img => ({ ...img, isPrimary: !!img.isPrimary })),
          features: features.reduce((acc, f) => ({
            ...acc,
            [f.key]: { label: f.label, icon: f.icon, description: f.description }
          }), {}),
          ageRanges,
          hours: hours.reduce((acc, h) => ({
            ...acc,
            [dayNames[h.dayOfWeek].toLowerCase()]: h.isClosed ? 'Closed' : `${h.openTime} - ${h.closeTime}`
          }), {}),
          categoryRatings: categoryRatings.reduce((acc, c) => ({
            ...acc,
            [c.key]: { rating: c.rating, label: c.label, icon: c.icon, description: c.description }
          }), {})
        }
      });
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /api/restaurants/:slug/reviews
 * Get reviews for a restaurant
 */
router.get('/:slug/reviews',
  [
    param('slug').isString().trim().notEmpty(),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('offset').optional().isInt({ min: 0 }),
    query('sort').optional().isIn(['newest', 'oldest', 'highest', 'lowest', 'helpful'])
  ],
  validate,
  (req, res) => {
    try {
      const db = getDatabase();
      const { slug } = req.params;
      const { limit = 10, offset = 0, sort = 'newest' } = req.query;

      // Get restaurant ID
      const restaurant = db.prepare('SELECT id FROM restaurants WHERE slug = ?').get(slug);
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      const sortMap = {
        newest: 'rev.created_at DESC',
        oldest: 'rev.created_at ASC',
        highest: 'rev.rating DESC',
        lowest: 'rev.rating ASC',
        helpful: 'rev.helpful_count DESC'
      };

      const reviews = db.prepare(`
        SELECT
          rev.id, rev.user_name as userName, rev.user_initials as userInitials,
          rev.rating, rev.title, rev.text, rev.highlight,
          rev.visit_date as visitDate, rev.is_verified as isVerified,
          rev.helpful_count as helpfulCount, rev.created_at as createdAt
        FROM reviews rev
        WHERE rev.restaurant_id = ? AND rev.is_approved = 1
        ORDER BY ${sortMap[sort]}
        LIMIT ? OFFSET ?
      `).all(restaurant.id, parseInt(limit), parseInt(offset));

      const getCategoryRatings = db.prepare(`
        SELECT ct.key, ct.label, rcr.rating
        FROM review_category_ratings rcr
        JOIN category_types ct ON rcr.category_id = ct.id
        WHERE rcr.review_id = ?
      `);

      const enrichedReviews = reviews.map(r => ({
        ...r,
        isVerified: !!r.isVerified,
        categoryRatings: getCategoryRatings.all(r.id).reduce((acc, c) => ({
          ...acc,
          [c.key]: c.rating
        }), {})
      }));

      const { total } = db.prepare('SELECT COUNT(*) as total FROM reviews WHERE restaurant_id = ? AND is_approved = 1').get(restaurant.id);

      res.json({
        data: enrichedReviews,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + enrichedReviews.length < total
        }
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
