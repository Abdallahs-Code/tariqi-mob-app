const Client = require('../models/client');
const Driver = require('../models/driver');

const clientGetInfo = async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Access denied: not a client' });
    }

    const client = await Client.findById(req.user.id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    const clientInfo = {
      firstName: client.firstName,
      lastName: client.lastName,
      age: client.age,
      phoneNumber: client.phoneNumber,
      email: client.email,
      inRide: client.inRide,
    };

    res.status(200).json({ user: clientInfo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const driverGetInfo = async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Access denied: not a driver' });
    }

    const driver = await Driver.findById(req.user.id);

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    const driverInfo = {
      firstName: driver.firstName,
      lastName: driver.lastName,
      age: driver.age,
      phoneNumber: driver.phoneNumber,
      email: driver.email,
      carDetails: driver.carDetails,
      drivingLicense: driver.drivingLicense,
      inRide: driver.inRide,
    };

    res.status(200).json({ user: driverInfo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  clientGetInfo,
  driverGetInfo,
};