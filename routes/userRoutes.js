// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
  // Profile
  getProfile,
  updateProfile,
  updatePassword,
  // Notifications
  getNotifications,
  updateNotifications,
  // Payment methods
  getPaymentMethods,
  updatePaypal,
  addCard,
  removeCard
} = require('../controllers/settingsController');

// ─── PROFILE ─────────────────────────────────────────

// Get own profile (no password)
router.get(  '/profile',            auth, getProfile);
// Update firstName / lastName / email
router.put(  '/profile',            auth, updateProfile);
// Change password (old/new/confirm)
router.put(  '/profile/password',   auth, updatePassword);


// ─── NOTIFICATIONS ───────────────────────────────────

// Read notification settings
router.get(  '/notifications',      auth, getNotifications);
// Update one or more flags: { email, orderDelivered, push, availability }
router.put(  '/notifications',      auth, updateNotifications);


// ─── PAYMENT METHODS ─────────────────────────────────

// Read saved cards + PayPal email
router.get(  '/payments',           auth, getPaymentMethods);
// Update PayPal email only
router.put(  '/payments/paypal',    auth, updatePaypal);
// Add a new card via Stripe paymentMethodId
router.post( '/payments/cards',     auth, addCard);
// Remove a saved card by its Mongo sub‐document id
router.delete('/payments/cards/:cardId', auth, removeCard);


module.exports = router;
