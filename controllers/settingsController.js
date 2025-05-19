// controllers/settingsController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ─── PROFILE ───────────────────────────────────────────

// GET /api/users/profile
exports.getProfile = async (req, res) => {
  try {
    const u = await User.findById(req.user.userId).select('-password');
    if (!u) return res.status(404).json({ message: 'User not found' });
    res.json(u);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  const { firstName, lastName, email } = req.body;
  try {
    const u = await User.findById(req.user.userId);
    if (!u) return res.status(404).json({ message: 'User not found' });
    u.firstName = firstName ?? u.firstName;
    u.lastName  = lastName  ?? u.lastName;
    u.email     = email     ?? u.email;
    await u.save();
    res.json({ message: 'Profile updated', user: { firstName: u.firstName, lastName: u.lastName, email: u.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/users/profile/password
exports.updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }
  try {
    const u = await User.findById(req.user.userId);
    if (!u) return res.status(404).json({ message: 'User not found' });
    const ok = await bcrypt.compare(oldPassword, u.password);
    if (!ok) return res.status(400).json({ message: 'Old password is incorrect' });
    u.password = await bcrypt.hash(newPassword, 10);
    await u.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── NOTIFICATIONS ─────────────────────────────────────

// GET /api/users/notifications
exports.getNotifications = async (req, res) => {
  try {
    const u = await User.findById(req.user.userId, 'notificationSettings');
    res.json(u.notificationSettings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/users/notifications
exports.updateNotifications = async (req, res) => {
  try {
    const u = await User.findById(req.user.userId);
    Object.assign(u.notificationSettings, req.body);
    await u.save();
    res.json({ message: 'Notifications updated', notificationSettings: u.notificationSettings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── PAYMENT METHODS ───────────────────────────────────

// GET /api/users/payments
exports.getPaymentMethods = async (req, res) => {
  try {
    const u = await User.findById(req.user.userId, 'paymentMethods');
    res.json(u.paymentMethods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/users/payments/paypal
exports.updatePaypal = async (req, res) => {
  const { paypalEmail } = req.body;
  try {
    const u = await User.findById(req.user.userId);
    u.paymentMethods.paypalEmail = paypalEmail;
    await u.save();
    res.json({ message: 'PayPal email updated', paypalEmail });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/users/payments/cards
exports.addCard = async (req, res) => {
  const { paymentMethodId } = req.body;
  try {
    const u = await User.findById(req.user.userId);
    if (!u.stripeCustomerId) {
      const customer = await stripe.customers.create({ email: u.email });
      u.stripeCustomerId = customer.id;
    }
    await stripe.paymentMethods.attach(paymentMethodId, { customer: u.stripeCustomerId });
    await stripe.customers.update(u.stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId }
    });

    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
    u.paymentMethods.cards.push({
      stripePaymentMethodId: pm.id,
      brand: pm.card.brand,
      last4: pm.card.last4,
      expMonth: pm.card.exp_month,
      expYear: pm.card.exp_year
    });
    await u.save();

    res.json({ message: 'Card added', card: pm.card });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/users/payments/cards/:cardId
exports.removeCard = async (req, res) => {
  try {
    const u = await User.findById(req.user.userId);
    u.paymentMethods.cards.id(req.params.cardId).remove();
    await u.save();
    res.json({ message: 'Card removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
