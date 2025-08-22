const express = require("express");
const router = express.Router();
const { handleWebhook } = require("../controllers/orderController");

// Stripe requires the raw body to validate webhook signatures.
// NOTE: This will put the raw Buffer on req.body (used in controller).
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

module.exports = router;
