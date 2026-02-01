/**
 * Reviews API Routes
 * Handles review submissions and retrieval
 */

import { Router } from 'express';
import { body, query, param, validationResult } from 'express-validator';
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
 * GET /api/reviews
 * Get all reviews (with optional filters)
 */
router.get('/',
  [
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('offset').optional().isInt({ min: 0 }),
    query('sort').optional().isIn(['newest', 'oldest', 'highest', 'lowest'])
  ],
  validate,
  (req, res) => {
    try {
      const db = getDatabase();
      const { limit = 20, offset = 0, sort = 'newest' } = req.query;

      const sortMap = {
        newest: 'rev.created_at DESC',
        oldest: 'rev.created_at ASC',
        highest: 'rev.rating DESC',
        lowest: 'rev.rating ASC'
      };

      const reviews = db.prepare(`
        SELECT
          rev.id, rev.user_name as userName, rev.user_initials as userInitials,
          rev.rating, rev.title, rev.text, rev.highlight,
          rev.visit_date as visitDate, rev.is_verified as isVerified,
          rev.helpful_count as helpfulCount, rev.created_at as createdAt,
          r.id as restaurantId, r.name as restaurantName, r.slug as restaurantSlug
        FROM reviews rev
        JOIN restaurants r ON rev.restaurant_id = r.id
        WHERE rev.is_approved = 1
        ORDER BY ${sortMap[sort]}
        LIMIT ? OFFSET ?
      `).all(parseInt(limit), parseInt(offset));

      const getCategoryRatings = db.prepare(`
        SELECT ct.key, rcr.rating
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

      const { total } = db.prepare('SELECT COUNT(*) as total FROM reviews WHERE is_approved = 1').get();

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

/**
 * GET /api/reviews/recent
 * Get recent reviews for homepage
 */
router.get('/recent', (req, res) => {
  try {
    const db = getDatabase();
    const limit = parseInt(req.query.limit) || 5;

    const reviews = db.prepare(`
      SELECT
        rev.id, rev.user_name as userName, rev.user_initials as userInitials,
        rev.rating, rev.text, rev.highlight, rev.created_at as createdAt,
        r.name as restaurantName, r.slug as restaurantSlug
      FROM reviews rev
      JOIN restaurants r ON rev.restaurant_id = r.id
      WHERE rev.is_approved = 1
      ORDER BY rev.created_at DESC
      LIMIT ?
    `).all(limit);

    res.json({ data: reviews });
  } catch (error) {
    console.error('Error fetching recent reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/reviews
 * Submit a new review
 */
router.post('/',
  [
    body('restaurantId').isInt({ min: 1 }),
    body('userName').isString().trim().isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('title').optional().isString().trim().isLength({ max: 200 }),
    body('text').isString().trim().isLength({ min: 20, max: 5000 }),
    body('highlight').optional().isString().trim().isLength({ max: 500 }),
    body('visitDate').optional().isISO8601(),
    body('categoryRatings').optional().isObject(),
    body('categoryRatings.kidsMenu').optional().isInt({ min: 1, max: 5 }),
    body('categoryRatings.staff').optional().isInt({ min: 1, max: 5 }),
    body('categoryRatings.cleanliness').optional().isInt({ min: 1, max: 5 }),
    body('categoryRatings.noiseTolerance').optional().isInt({ min: 1, max: 5 }),
    body('categoryRatings.entertainment').optional().isInt({ min: 1, max: 5 }),
    body('categoryRatings.valueForMoney').optional().isInt({ min: 1, max: 5 }),
    body('categoryRatings.waitTime').optional().isInt({ min: 1, max: 5 }),
    body('categoryRatings.spaciousness').optional().isInt({ min: 1, max: 5 })
  ],
  validate,
  (req, res) => {
    try {
      const db = getDatabase();
      const {
        restaurantId,
        userName,
        email,
        rating,
        title,
        text,
        highlight,
        visitDate,
        categoryRatings
      } = req.body;

      // Verify restaurant exists
      const restaurant = db.prepare('SELECT id FROM restaurants WHERE id = ? AND is_active = 1').get(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      // Generate initials from name
      const initials = userName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      // Insert review (not approved by default for moderation)
      const insertReview = db.prepare(`
        INSERT INTO reviews (
          restaurant_id, user_name, user_initials, rating, title, text,
          highlight, visit_date, is_approved
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
      `);

      const result = insertReview.run(
        restaurantId,
        userName,
        initials,
        rating,
        title || null,
        text,
        highlight || null,
        visitDate || null
      );

      const reviewId = result.lastInsertRowid;

      // Insert category ratings if provided
      if (categoryRatings) {
        const getCategoryId = db.prepare('SELECT id FROM category_types WHERE key = ?');
        const insertCategoryRating = db.prepare('INSERT INTO review_category_ratings (review_id, category_id, rating) VALUES (?, ?, ?)');

        Object.entries(categoryRatings).forEach(([key, ratingValue]) => {
          const category = getCategoryId.get(key);
          if (category) {
            insertCategoryRating.run(reviewId, category.id, ratingValue);
          }
        });
      }

      res.status(201).json({
        message: 'Review submitted successfully! It will be visible after moderation.',
        data: { id: reviewId }
      });
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * POST /api/reviews/:id/helpful
 * Mark a review as helpful
 */
router.post('/:id/helpful',
  [param('id').isInt({ min: 1 })],
  validate,
  (req, res) => {
    try {
      const db = getDatabase();
      const { id } = req.params;

      const result = db.prepare('UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = ? AND is_approved = 1').run(id);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Review not found' });
      }

      const review = db.prepare('SELECT helpful_count as helpfulCount FROM reviews WHERE id = ?').get(id);

      res.json({
        message: 'Thank you for your feedback!',
        data: { helpfulCount: review.helpfulCount }
      });
    } catch (error) {
      console.error('Error updating helpful count:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
