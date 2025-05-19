// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Auth / Products
const authRoutes    = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

// User (profile, personal data, notifications, payment methods)
const userRoutes    = require('./routes/userRoutes');

// Cart / Orders / Payment webhook
const cartRoutes    = require('./routes/cartRoutes');
const orderRoutes   = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// ─── MIDDLEWARE ──────────────────────────────────────

// Enable CORS for all routes
app.use(cors());

// Use raw body for Stripe webhooks; JSON body parser everywhere else
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payment/webhook') {
    return next();
  }
  express.json()(req, res, next);
});

// Serve local uploads
app.use('/uploads', express.static('uploads'));

// ─── ROUTES ──────────────────────────────────────────

// Public & Auth
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);

// Protected: user profile & settings
app.use('/api/users',    userRoutes);

// Cart and Checkout
app.use('/api/cart',     cartRoutes);
app.use('/api/orders',   orderRoutes);

// Stripe webhook (no JSON parsing)
app.use('/api/payment',  paymentRoutes);

// ─── STARTUP ─────────────────────────────────────────

if (require.main === module) {
  connectDB()
    .then(() => {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
      });
    })
    .catch(err => {
      console.error('❌ Failed to connect to database:', err);
      process.exit(1);
    });
}

module.exports = app;
