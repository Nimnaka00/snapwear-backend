// models/User.js
const mongoose = require('mongoose');

const NotificationSettingsSchema = new mongoose.Schema({
  email:          { type: Boolean, default: true },
  orderDelivered: { type: Boolean, default: true },
  push:           { type: Boolean, default: true },
  availability:   { type: Boolean, default: true }
}, { _id: false });

const CardSchema = new mongoose.Schema({
  _id:                   { type: mongoose.Schema.Types.ObjectId, auto: true },
  stripePaymentMethodId: { type: String, required: true },
  brand:                 { type: String, required: true },
  last4:                 { type: String, required: true },
  expMonth:              { type: Number, required: true },
  expYear:               { type: Number, required: true }
});

const PaymentMethodsSchema = new mongoose.Schema({
  cards:       { type: [CardSchema], default: [] },
  paypalEmail: { type: String, default: '' }
}, { _id: false });

const userSchema = new mongoose.Schema({
  firstName:            { type: String, required: true },
  lastName:             { type: String, default: '' },
  email:                { type: String, required: true, unique: true },
  password:             { type: String, required: true },

  // ─── OTP RESET FIELDS ───────────────────────────────────────
  resetPasswordToken:   { type: String },
  resetPasswordExpires: { type: Date },

  // ─── OTHER FIELDS ──────────────────────────────────────────
  notificationSettings: { type: NotificationSettingsSchema, default: () => ({}) },
  paymentMethods:       { type: PaymentMethodsSchema,   default: () => ({}) },
  stripeCustomerId:     { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
