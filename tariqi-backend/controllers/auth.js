const jwt = require('jsonwebtoken');
const Client = require('../models/client');
const Driver = require('../models/driver');

const signup = async (req, res) => {
  const { firstName, lastName, age, phoneNumber, email, password, role, carDetails, drivingLicense } = req.body;

  if (role === 'driver') {
    const existingDriver = await Driver.findOne({ email });
    if (existingDriver) {
      return res.status(400).json({ message: 'Driver already exists' });
    }

    const newDriver = new Driver({ firstName, lastName, age, phoneNumber, email, password, carDetails, drivingLicense });
    await newDriver.save();

    const token = jwt.sign({ id: newDriver._id, role: role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.status(201).json({ message: 'Driver created', token, id: newDriver._id });
  }

  const existingClient = await Client.findOne({ email });
  if (existingClient) {
    return res.status(400).json({ message: 'Client already exists' });
  }

  const newClient = new Client({ firstName, lastName, age, phoneNumber, email, password });
  await newClient.save();

  const token = jwt.sign({ id: newClient._id, role: role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  return res.status(201).json({ message: 'Client created', token, id: newClient._id });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  let user = await Client.findOne({ email });
  let role = 'client';
  
  if (!user) {
    user = await Driver.findOne({ email });
    role = 'driver';
  }

  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id, role: role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ message: 'Login successful', token, role, id: user._id });
};

module.exports = { signup, login };