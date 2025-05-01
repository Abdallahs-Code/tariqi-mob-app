const Payment = require("../models/payment");
const Ride = require("../models/ride");

let stripe;
try {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("STRIPE_SECRET_KEY is not defined in environment variables");
  } else {
    stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    console.log("Stripe initialized successfully");
  }
} catch (error) {
  console.error("Error initializing Stripe:", error);
}

// Initialize payment for a ride
const initializePayment = async (req, res) => {
  try {
    const { rideId, paymentMethod, amount } = req.body;
    const clientId = req.user.id;

    // Log environment variable status
    console.log(
      "STRIPE_SECRET_KEY status:",
      process.env.STRIPE_SECRET_KEY ? "Present" : "Missing"
    );

    // Validate ride exists and client is a passenger
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (!ride.passengers.includes(clientId)) {
      return res
        .status(403)
        .json({ message: "You are not a passenger in this ride" });
    }

    // Create payment record
    const payment = new Payment({
      ride: rideId,
      payer: clientId,
      receiver: ride.driver,
      amount,
      paymentMethod,
      status: "pending",
      currency: "EGP",
    });

    if (paymentMethod === "card") {
      // Check if Stripe is properly initialized
      if (!stripe || !process.env.STRIPE_SECRET_KEY) {
        console.error(
          "Stripe is not properly configured. STRIPE_SECRET_KEY:",
          process.env.STRIPE_SECRET_KEY ? "Present" : "Missing"
        );
        return res.status(500).json({
          message:
            "Card payments are not configured. Please check server configuration.",
        });
      }

      try {
        // Convert amount to piasters for Stripe (1 EGP = 100 piasters)
        const amountInPiasters = Math.round(amount * 100);

        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInPiasters,
          currency: "egp",
          metadata: {
            rideId,
            paymentId: payment._id.toString(),
            amount: `${amount} EGP`,
          },
        });

        payment.stripePaymentId = paymentIntent.id;
        await payment.save();

        return res.status(200).json({
          clientSecret: paymentIntent.client_secret,
          paymentId: payment._id,
          amount,
          currency: "EGP",
        });
      } catch (stripeError) {
        console.error("Stripe payment creation error:", stripeError);
        return res.status(500).json({
          message: "Error creating card payment",
          details: stripeError.message,
        });
      }
    }

    // For cash payments
    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    console.error("Initialize payment error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Confirm card payment
const confirmCardPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status === "completed") {
      return res.status(400).json({ message: "Payment already completed" });
    }

    // Verify payment with Stripe
    const stripePayment = await stripe.paymentIntents.retrieve(
      payment.stripePaymentId
    );

    if (stripePayment.status === "succeeded") {
      payment.status = "completed";
      payment.completedAt = new Date();
      await payment.save();

      return res.status(200).json(payment);
    }

    res.status(400).json({ message: "Payment not successful" });
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Confirm cash payment (by driver)
const confirmCashPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const driverId = req.user.id;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.receiver.toString() !== driverId) {
      return res
        .status(403)
        .json({ message: "Not authorized to confirm this payment" });
    }

    if (payment.status === "completed") {
      return res.status(400).json({ message: "Payment already completed" });
    }

    if (payment.paymentMethod !== "cash") {
      return res.status(400).json({ message: "This is not a cash payment" });
    }

    payment.status = "completed";
    payment.completedAt = new Date();
    await payment.save();

    res.status(200).json(payment);
  } catch (error) {
    console.error("Confirm cash payment error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get payment history for user
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const query =
      userRole === "driver" ? { receiver: userId } : { payer: userId };

    const payments = await Payment.find(query)
      .populate("ride", "createdAt")
      .populate("payer", "firstName lastName")
      .populate("receiver", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get payment details
const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findById(paymentId)
      .populate("ride", "createdAt route")
      .populate("payer", "firstName lastName")
      .populate("receiver", "firstName lastName");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Check if user is involved in the payment
    if (
      payment.payer._id.toString() !== userId &&
      payment.receiver._id.toString() !== userId
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this payment" });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error("Get payment details error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  initializePayment,
  confirmCardPayment,
  confirmCashPayment,
  getPaymentHistory,
  getPaymentDetails,
};
