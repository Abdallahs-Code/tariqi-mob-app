const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const driverSchema = new mongoose.Schema({
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
  carDetails: {
    make: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    licensePlate: {
      type: String,
      required: true,
    },
  },
  drivingLicense: {
    type: String,
    required: true,
  },
  inRide: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    // default: () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000),
  },
});

driverSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

driverSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;