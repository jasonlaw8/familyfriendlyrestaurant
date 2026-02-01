/**
 * Contact API Routes
 * Handles contact form submissions and newsletter subscriptions
 */

import { Router } from 'express';
import { body, validationResult } from 'express-validator';
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
 * POST /api/contact
 * Submit a contact form
 */
router.post('/',
  [
    body('name').isString().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('subject').optional().isString().trim().isLength({ max: 200 }),
    body('message').isString().trim().isLength({ min: 10, max: 5000 }).withMessage('Message must be 10-5000 characters')
  ],
  validate,
  (req, res) => {
    try {
      const db = getDatabase();
      const { name, email, subject, message } = req.body;

      const result = db.prepare(`
        INSERT INTO contact_submissions (name, email, subject, message)
        VALUES (?, ?, ?, ?)
      `).run(name, email, subject || null, message);

      res.status(201).json({
        message: 'Thank you for your message! We will get back to you soon.',
        data: { id: result.lastInsertRowid }
      });
    } catch (error) {
      console.error('Error saving contact submission:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * POST /api/newsletter/subscribe
 * Subscribe to newsletter
 */
router.post('/newsletter/subscribe',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('name').optional().isString().trim().isLength({ max: 100 })
  ],
  validate,
  (req, res) => {
    try {
      const db = getDatabase();
      const { email, name } = req.body;

      // Check if already subscribed
      const existing = db.prepare('SELECT id, is_active FROM newsletter_subscribers WHERE email = ?').get(email);

      if (existing) {
        if (existing.is_active) {
          return res.status(400).json({ error: 'This email is already subscribed to our newsletter.' });
        } else {
          // Reactivate subscription
          db.prepare('UPDATE newsletter_subscribers SET is_active = 1, name = ?, unsubscribed_at = NULL WHERE id = ?').run(name || null, existing.id);
          return res.json({ message: 'Welcome back! Your subscription has been reactivated.' });
        }
      }

      db.prepare('INSERT INTO newsletter_subscribers (email, name) VALUES (?, ?)').run(email, name || null);

      res.status(201).json({
        message: 'Thank you for subscribing! You\'ll receive our latest family-friendly restaurant updates.'
      });
    } catch (error) {
      console.error('Error saving newsletter subscription:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * POST /api/newsletter/unsubscribe
 * Unsubscribe from newsletter
 */
router.post('/newsletter/unsubscribe',
  [body('email').isEmail().normalizeEmail()],
  validate,
  (req, res) => {
    try {
      const db = getDatabase();
      const { email } = req.body;

      const result = db.prepare(`
        UPDATE newsletter_subscribers
        SET is_active = 0, unsubscribed_at = CURRENT_TIMESTAMP
        WHERE email = ? AND is_active = 1
      `).run(email);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Email not found in our subscriber list.' });
      }

      res.json({ message: 'You have been successfully unsubscribed from our newsletter.' });
    } catch (error) {
      console.error('Error unsubscribing:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
