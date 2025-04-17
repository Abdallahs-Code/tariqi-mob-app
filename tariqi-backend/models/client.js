const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const clientSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
  },
  role: {
    type: String,
    enum: ['client', 'driver'],
    default: 'client',
  },
  createdAt: {
    type: Date,
    default: Date.now,
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
