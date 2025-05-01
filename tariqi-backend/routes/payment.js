const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  initializePayment,
  confirmCardPayment,
  confirmCashPayment,
  getPaymentHistory,
  getPaymentDetails,
} = require("../controllers/paymentController");

// Initialize payment for a ride
router.post("/initialize", protect, initializePayment);

// Confirm card payment
router.post("/confirm-card/:paymentId", protect, confirmCardPayment);

// Confirm cash payment (driver only)
router.post("/confirm-cash/:paymentId", protect, confirmCashPayment);

// Get payment history
router.get("/history", protect, getPaymentHistory);

// Get payment details
router.get("/:paymentId", protect, getPaymentDetails);

module.exports = router;
