// models/User.js
const mongoose = require("mongoose");

const NotificationSettingsSchema = new mongoose.Schema(
  {
    email: { type: Boolean, default: true },
    orderDelivered: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    availability: { type: Boolean, default: true },
  },
  { _id: false }
);

const CardSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  stripePaymentMethodId: { type: String, required: true },
  brand: { type: String, required: true },
  last4: { type: String, required: true },
  expMonth: { type: Number, required: true },
  expYear: { type: Number, required: true },
});

const PaymentMethodsSchema = new mongoose.Schema(
  {
    cards: { type: [CardSchema], default: [] },
    paypalEmail: { type: String, default: "" },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, default: "", trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: { type: String, required: true },

    // OTP reset (store hashed)
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    // Role-based access
    role: { type: String, enum: ["user", "admin"], default: "user" },

    notificationSettings: {
      type: NotificationSettingsSchema,
      default: () => ({}),
    },
    paymentMethods: { type: PaymentMethodsSchema, default: () => ({}) },
    stripeCustomerId: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
