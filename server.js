// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

/* ─────────────────── SECURITY ─────────────────── */
app.use(helmet());
app.disable("x-powered-by");

// CORS: allow your dev Vite origin(s) and anything in env
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_ORIGIN, // e.g. https://snapwear.example.com
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // non-browser / curl
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      // loosen during local dev; tighten for prod
      return cb(null, true);
      // For strict prod, use: cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Rate limit (v5 syntax uses `max`; v6+ uses `limit`)
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 600, // if on v6+, change to `limit: 600`
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

/* ──────────────── BODY PARSING ───────────────── */
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payment/webhook") return next(); // Stripe raw body
  express.json({ limit: "1mb" })(req, res, next);
});

// Static for local uploads (if used)
app.use("/uploads", express.static("uploads"));

/* ─────────────────── ROUTES ─────────────────── */
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || "development" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

/* ─────────────── 404 + ERROR HANDLERS ─────────────── */
app.use((req, res, _next) => {
  res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

/* ─────────────────── STARTUP ─────────────────── */
if (require.main === module) {
  connectDB()
    .then(() => {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("❌ Failed to connect to database:", err);
      process.exit(1);
    });
}

module.exports = app;
