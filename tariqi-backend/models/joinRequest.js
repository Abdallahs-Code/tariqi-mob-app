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
    expires: 60,
  },
});

const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema);

module.exports = JoinRequest;
