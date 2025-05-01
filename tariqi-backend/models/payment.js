const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ride",
    required: true,
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    required: true,
    default: "EGP",
    enum: ["EGP"],
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ["cash", "card", "wallet"],
  },
  stripePaymentId: {
    type: String,
    sparse: true, // Only unique if exists
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

// Index for faster queries
paymentSchema.index({ ride: 1, payer: 1 });
paymentSchema.index({ receiver: 1, status: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
