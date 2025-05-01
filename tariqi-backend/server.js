require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const rideRoutes = require("./routes/rides");
const chatRoutes = require("./routes/chat");
const paymentRoutes = require("./routes/payment");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api", rideRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/payment", paymentRoutes);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("New client connected");

  // Join a specific ride's chat room
  socket.on("join-ride", (rideId) => {
    socket.join(rideId);
    console.log(`User joined ride chat: ${rideId}`);
  });

  // Handle new messages
  socket.on("send-message", (data) => {
    io.to(data.rideId).emit("new-message", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

connectDB();

app.get("/", (req, res) => {
  res.send("Tariqi backend is running");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
