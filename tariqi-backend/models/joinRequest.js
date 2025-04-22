const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  requestedAt: {
    type: Date,
    default: Date.now,
    // default: () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000),
    expires: 120,
  },
  pickup: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  dropoff: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  approvals: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      role: {
        type: String,
        enum: ['driver', 'client'],
        required: true,
      },
      approved: {
        type: Boolean,
        default: null, 
      }
    }
  ],  
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
});

const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema);

module.exports = JoinRequest;
