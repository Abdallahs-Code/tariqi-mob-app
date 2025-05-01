const express = require("express");
const router = express.Router();
const {
  createChatRoom,
  getChatMessages,
  sendMessage,
} = require("../controllers/chatController");
const { protect } = require("../middleware/auth");

// Create chat room for a ride
router.post("/:rideId", protect, createChatRoom);

// Get chat messages
router.get("/:rideId/messages", protect, getChatMessages);

// Send message
router.post("/:rideId/messages", protect, sendMessage);

module.exports = router;
