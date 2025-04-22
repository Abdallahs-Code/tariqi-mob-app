const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const clientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  age : {
    type: Number,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  inRide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    default: null
  },
  pickup: {
    lat: { type: Number, required: false },
    lng: { type: Number, required: false }
  },
  dropoff: {
    lat: { type: Number, required: false },
    lng: { type: Number, required: false }
  },
  currentLocation: {
    lat: { type: Number, required: false },
    lng: { type: Number, required: false }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // default: () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000),
  },
});

clientSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

clientSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
