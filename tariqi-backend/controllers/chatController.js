const ChatRoom = require("../models/chat");
const Ride = require("../models/ride");

// Create a new chat room for a ride
const createChatRoom = async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.user.id; // Get authenticated user's ID

    // Check if ride exists
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // Verify user is either the driver or a passenger
    const isDriver = ride.driver.toString() === userId;
    const isPassenger = ride.passengers.some((p) => p.toString() === userId);

    if (!isDriver && !isPassenger) {
      return res
        .status(403)
        .json({ message: "You are not authorized to create this chat room" });
    }

    // Check if chat room already exists
    const existingChat = await ChatRoom.findOne({ ride: rideId });
    if (existingChat) {
      return res
        .status(400)
        .json({ message: "Chat room already exists for this ride" });
    }

    // Create new chat room
    const chatRoom = new ChatRoom({
      ride: rideId,
      participants: [ride.driver, ...ride.passengers].map((id) =>
        id.toString()
      ),
    });

    await chatRoom.save();
    res.status(201).json(chatRoom);
  } catch (error) {
    console.error("Create chat room error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get chat room messages
const getChatMessages = async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.user.id;

    const chatRoom = await ChatRoom.findOne({ ride: rideId })
      .populate("messages.sender", "name")
      .sort({ "messages.timestamp": -1 });

    if (!chatRoom) {
      return res.status(404).json({ message: "Chat room not found" });
    }

    // Verify user is a participant
    if (!chatRoom.participants.includes(userId)) {
      return res
        .status(403)
        .json({ message: "You are not a participant in this chat" });
    }

    res.json(chatRoom.messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Send a new message
const sendMessage = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const chatRoom = await ChatRoom.findOne({ ride: rideId });
    if (!chatRoom) {
      return res.status(404).json({ message: "Chat room not found" });
    }

    // Check if sender is a participant
    if (!chatRoom.participants.includes(userId)) {
      return res
        .status(403)
        .json({ message: "You are not a participant in this chat" });
    }

    const newMessage = {
      sender: userId,
      senderType: userRole === "driver" ? "Driver" : "Client",
      content,
      timestamp: new Date(),
    };

    chatRoom.messages.push(newMessage);
    chatRoom.lastMessage = new Date();
    await chatRoom.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createChatRoom,
  getChatMessages,
  sendMessage,
};
