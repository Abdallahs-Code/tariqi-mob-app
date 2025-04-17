const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true,
  },
  passengers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
  }],
  pickupLocation: {
    type: String,
    required: true,
  },
  dropoffLocation: {
    type: String,
    required: true,
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 1,
  },
  rideStatus: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'canceled'],
    default: 'scheduled',
  },
  rideTime: {
    type: Date,
    required: true,
  },
  rejectedClients: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client' 
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;
